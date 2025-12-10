import { executeQuery } from '@/lib/db';

export interface BorrowerLoan {
  Loan_ID: number;
  ISBN: string;
  Title: string;
  Date_out: Date | null;
  Due_date: Date | null;
  Date_in: Date | null;
}

export async function getBorrowerLoans(cardId: string): Promise<BorrowerLoan[]> {
  const query = `
    SELECT 
      bl.Loan_ID,
      bl.ISBN,
      b.Title,
      bl.Date_out,
      bl.Due_date,
      bl.Date_in
    FROM \`BOOK_LOANS\` bl
    JOIN \`BOOKS\` b ON bl.ISBN = b.ISBN
    WHERE bl.Card_ID = ?
    ORDER BY bl.Date_out DESC
  `;

  const results = await executeQuery({
    query,
    values: [cardId],
  });

  return results as BorrowerLoan[];
}

