import { executeQuery } from "../db";

interface CheckInResult {
  Loan_id: number;
  message: string;
}

export async function checkInBooks(loanIds: number[]): Promise<CheckInResult[]> {
  if (!loanIds.length || loanIds.length > 3) {
    throw new Error('You must select between 1 and 3 loans to check in.');
  }

  const today = new Date();
  const results: CheckInResult[] = [];

  for (const loanId of loanIds) {
    const loan = await executeQuery({
      query: 'SELECT * FROM BOOK_LOANS WHERE Loan_id = ?',
      values: [loanId],
    });

    if (!loan.length) {
      results.push({ Loan_id: loanId, message: 'Loan not found.' });
      continue;
    }

    if (loan[0].date_in) {
      results.push({ Loan_id: loanId, message: 'Book already checked in.' });
      continue;
    }

    await executeQuery({
      query: 'UPDATE BOOK_LOANS SET date_in = ? WHERE Loan_id = ?',
      values: [today, loanId],
    });

    results.push({ Loan_id: loanId, message: 'Book checked in successfully.' });
  }

  return results;
}