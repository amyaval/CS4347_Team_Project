import { executeQuery } from '@/lib/db';

async function ensureTablesExist() {
    try {
        await executeQuery({
            query: `CREATE TABLE IF NOT EXISTS \`BOOK_LOANS\` (
                Loan_ID INT,
                ISBN VARCHAR(10),
                Card_ID VARCHAR(6),
                Date_out DATE,
                Due_date DATE,
                Date_in DATE,
                CONSTRAINT PK_BOOKLOANS PRIMARY KEY (Loan_ID),
                CONSTRAINT FK_BORROWER FOREIGN KEY (Card_ID) REFERENCES \`BORROWER\`(Card_ID)
            )`,
        });
    } catch (error: any) {
        if (error.code !== 'ER_NO_SUCH_TABLE' && !error.sqlMessage?.includes('BORROWER')) {
            throw error;
        }
    }

    try {
        await executeQuery({
            query: `CREATE TABLE IF NOT EXISTS \`FINES\` (
                Loan_ID INT,
                Fine_amt DOUBLE,
                Paid DOUBLE,
                CONSTRAINT FK_BOOK_LOANS FOREIGN KEY (Loan_ID) REFERENCES \`BOOK_LOANS\`(Loan_ID)
            )`,
        });
    } catch (error: any) {
        if (error.code !== 'ER_NO_SUCH_TABLE') {
            throw error;
        }
    }
}

export async function checkout(ISBN: string, Card_id: string) {
    await ensureTablesExist();
    const borrower = await executeQuery({
        query: 'SELECT Card_ID FROM `BORROWER` WHERE Card_ID = ?',
        values: [Card_id],
    });

    if (!borrower.length) throw new Error("Borrower not found");

    try {
        const fines = await executeQuery({
            query: `SELECT COUNT(*) AS count FROM \`FINES\` f 
                    JOIN \`BOOK_LOANS\` bl ON f.Loan_ID = bl.Loan_ID 
                    WHERE bl.Card_ID = ? AND (f.Paid IS NULL OR f.Paid < f.Fine_amt)`,
            values: [Card_id],
        });
        
        if (fines[0].count > 0) throw new Error("Borrower has unpaid fines");
    } catch (error: any) {
        if (error.code === 'ER_NO_SUCH_TABLE' && error.sqlMessage?.includes('FINES')) {
        } else {
            throw error;
        }
    }

    let activeLoans;
    try {
        activeLoans = await executeQuery({
            query: 'SELECT COUNT(*) AS count FROM `BOOK_LOANS` WHERE Card_ID = ? AND Date_in IS NULL',
            values: [Card_id],
        });
    } catch (error: any) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
            activeLoans = [{ count: 0 }];
        } else {
            throw error;
        }
    }
    
    if (activeLoans[0].count >= 3) throw new Error('Maximum active loans reached.');
    
    let checkedOut;
    try {
        checkedOut = await executeQuery({
            query: 'SELECT * FROM `BOOK_LOANS` WHERE ISBN = ? AND Date_in IS NULL',
            values: [ISBN],
        });
    } catch (error: any) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
            checkedOut = [];
        } else {
            throw error;
        }
    }
    
    if (checkedOut.length > 0) throw new Error('Book is already checked out.');
    
    let maxLoanId;
    try {
        maxLoanId = await executeQuery({
            query: 'SELECT COALESCE(MAX(Loan_ID), 0) AS max_id FROM `BOOK_LOANS`',
        });
    } catch (error: any) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
            maxLoanId = [{ max_id: 0 }];
        } else {
            throw error;
        }
    }
    
    const newLoanId = maxLoanId[0].max_id + 1;
    
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);
    
    await executeQuery({
        query: 'INSERT INTO `BOOK_LOANS` (Loan_ID, ISBN, Card_ID, Date_out, Due_date) VALUES (?, ?, ?, ?, ?)',
        values: [newLoanId, ISBN, Card_id, today, dueDate],
    });
    
    return { message: 'Book checked out successfully', dueDate };
}

export async function getNumCheckOut(): Promise<number> {
    const query = 'SELECT COUNT(*) AS count FROM `BOOK_LOANS`';
    const results = await executeQuery({ query });
    return results;
}