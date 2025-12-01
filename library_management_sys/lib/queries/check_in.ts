import { executeQuery } from "@/lib/db";

export interface CheckInResult {
  Loan_ID: number;
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
      query: 'SELECT * FROM `BOOK_LOANS` WHERE Loan_ID = ?',
      values: [loanId],
    });

    if (!loan.length) {
      results.push({ Loan_ID: loanId, message: 'Loan not found.' });
      continue;
    }

    if (loan[0].Date_in) {
      results.push({ Loan_ID: loanId, message: 'Book already checked in.' });
      continue;
    }

    await executeQuery({
      query: 'UPDATE `BOOK_LOANS` SET Date_in = ? WHERE Loan_ID = ?',
      values: [today, loanId],
    });

    results.push({ Loan_ID: loanId, message: 'Book checked in successfully.' });
  }

  return results;
}