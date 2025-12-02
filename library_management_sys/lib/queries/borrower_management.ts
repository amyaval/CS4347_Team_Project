import { executeQuery } from '@/lib/db';

export interface BookLoan {
    Card_ID: string;
    Ssn: string;
    Bname: string;
    Address: string;
    Phone: string;
}

export async function allBorrowers(): Promise<BookLoan[]> {
    const query = `
        SELECT BR.Card_ID, BR.Ssn, BR.Bname, BR.Address, BR.Phone
        FROM BORROWER AS BR
    `;
    const results = await executeQuery({ query });
    return results;
}

export async function getBorrowerById(cardId: string): Promise<BookLoan | null> {
    const query = `
        SELECT BR.Card_ID, BR.Ssn, BR.Bname, BR.Address, BR.Phone
        FROM BORROWER AS BR
        WHERE BR.Card_ID = ?
    `;
    const results = await executeQuery({ query, values: [cardId] });
    return results[0] || null;
}

export async function getBorrowerBySsn(ssn: string): Promise<BookLoan | null> {
    const query = `
        SELECT BR.Card_ID, BR.Ssn, BR.Bname, BR.Address, BR.Phone
        FROM BORROWER AS BR
        WHERE BR.Ssn = ?
    `;
    const results = await executeQuery({ query, values: [ssn] });
    return results[0] || null;
}

export async function getNextCardId(): Promise<string> {
    const query = `SELECT MAX(Card_ID) as maxId FROM BORROWER`;
    const results: any = await executeQuery({ query });

    // Get the max numeric Card_ID
    const maxId = results[0]?.maxId ? parseInt(results[0].maxId, 10) : 0;

    // Increment and pad to 6 digits
    const nextId = (maxId + 1).toString().padStart(6, "0");
    return nextId;
}

export async function addBorrower(ssn: string, bname: string, address: string, phone: string): Promise<string> {
    const nextCardId = await getNextCardId();
    const query = `
        INSERT INTO BORROWER (Card_ID, Ssn, Bname, Address, Phone)
        VALUES (?, ?, ?, ?, ?)
    `;
    await executeQuery({ query, values: [nextCardId, ssn, bname, address, phone] });
    return nextCardId;
}

export async function updateBorrower(cardId: string, ssn: string, bname: string, address: string, phone: string): Promise<void> {
    const query = `
        UPDATE BORROWER
        SET Ssn = ?, Bname = ?, Address = ?, Phone = ?
        WHERE Card_ID = ?
    `;
    await executeQuery({ query, values: [ssn, bname, address, phone, cardId] });
}

export async function deleteBorrower(cardId: string): Promise<void> {
    const query = `
        DELETE FROM BORROWER
        WHERE Card_ID = ?
    `;
    await executeQuery({ query, values: [cardId] });
}
