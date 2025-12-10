import { executeQuery } from '@/lib/db';

export interface BookLoan {
  Loan_ID: number;
  ISBN: string;
  Card_ID: string;
  Date_out: Date | null;
  Due_date: Date | null;
  Date_in: Date | null;
  Title: string;
  Bname: string;
}

export async function searchBookLoans(searchTerm: string): Promise<BookLoan[]> {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }

  const searchPattern = `%${searchTerm.trim()}%`;

  const query = `
    SELECT 
      bl.Loan_ID,
      bl.ISBN,
      bl.Card_ID,
      bl.Date_out,
      bl.Due_date,
      bl.Date_in,
      b.Title,
      br.Bname
    FROM \`BOOK_LOANS\` bl
    JOIN \`BOOKS\` b ON bl.ISBN = b.ISBN
    JOIN \`BORROWER\` br ON bl.Card_ID = br.Card_ID
    WHERE bl.Date_in IS NULL
      AND (
        bl.ISBN LIKE ?
        OR bl.Card_ID LIKE ?
        OR br.Bname LIKE ?
      )
    ORDER BY bl.Date_out DESC
  `;

  const results = await executeQuery({
    query,
    values: [searchPattern, searchPattern, searchPattern],
  });

  return results as BookLoan[];
}



