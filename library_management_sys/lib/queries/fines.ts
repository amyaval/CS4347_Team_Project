import { executeQuery } from '@/lib/db';

const DAILY_RATE = 0.25;

export interface FineRow {
  Loan_ID: number;
  Card_ID: string;
  Due_date: string | null;
  Date_in: string | null;
  days_late: number;
  fine_amt: string; // decimal as string
  Paid?: number;
}

export async function computeLateLoans(): Promise<FineRow[]> {
  const query = `
    SELECT L.Loan_ID, L.Card_ID, L.Due_date, L.Date_in,
      CASE
        WHEN L.Date_in IS NOT NULL AND L.Date_in > L.Due_date THEN DATEDIFF(L.Date_in, L.Due_date)
        WHEN L.Date_in IS NULL AND CURDATE() > L.Due_date THEN DATEDIFF(CURDATE(), L.Due_date)
        ELSE 0
      END AS days_late,
      CAST(ROUND(
        CASE
          WHEN L.Date_in IS NOT NULL AND L.Date_in > L.Due_date THEN DATEDIFF(L.Date_in, L.Due_date) * ?
          WHEN L.Date_in IS NULL AND CURDATE() > L.Due_date THEN DATEDIFF(CURDATE(), L.Due_date) * ?
          ELSE 0
        END, 2
      ) AS DECIMAL(10,2)) AS fine_amt
    FROM BOOK_LOANS L
    WHERE (L.Date_in IS NOT NULL AND L.Date_in > L.Due_date)
       OR (L.Date_in IS NULL AND CURDATE() > L.Due_date)
  `;

  const results = await executeQuery({ query, values: [DAILY_RATE, DAILY_RATE] });
  return results;
}

export async function updateFines(): Promise<{ inserted: number; updated: number; skippedPaid: number }> {
  const lateLoans: FineRow[] = await computeLateLoans();
  let inserted = 0,
    updated = 0,
    skippedPaid = 0;

  for (const loan of lateLoans) {
    const existing = await executeQuery({ query: 'SELECT Fine_amt, Paid FROM FINES WHERE Loan_ID = ?', values: [loan.Loan_ID] });

    if (!existing || existing.length === 0) {
      // insert new fine (paid = 0)
      await executeQuery({ query: 'INSERT INTO FINES (Loan_ID, Fine_amt, Paid) VALUES (?, ?, 0)', values: [loan.Loan_ID, loan.fine_amt] });
      inserted++;
    } else {
      const row = existing[0];
      const paid = Number(row.Paid);
      const currentAmt = Number(row.Fine_amt).toFixed(2);
      const newAmt = Number(loan.fine_amt).toFixed(2);
      if (paid === 1) {
        // do nothing for paid fines
        skippedPaid++;
        continue;
      }
      if (currentAmt !== newAmt) {
        await executeQuery({ query: 'UPDATE FINES SET Fine_amt = ? WHERE Loan_ID = ?', values: [loan.fine_amt, loan.Loan_ID] });
        updated++;
      }
    }
  }

  return { inserted, updated, skippedPaid };
}

export async function listFines(includePaid = false): Promise<any[]> {
  // Returns fines grouped by borrower with details
  const whereClause = includePaid ? '' : 'WHERE f.Paid = 0';

  const summaryQuery = `
    SELECT b.Card_ID, b.Bname, CAST(SUM(f.Fine_amt) AS DECIMAL(10,2)) AS total_fines
    FROM FINES f
    JOIN BOOK_LOANS l ON f.Loan_ID = l.Loan_ID
    JOIN BORROWER b ON l.Card_ID = b.Card_ID
    ${whereClause}
    GROUP BY b.Card_ID, b.Bname
    ORDER BY b.Bname
  `;

  const summaries = await executeQuery({ query: summaryQuery });

  // For each borrower, fetch details
  const results: any[] = [];
  for (const s of summaries) {
    const detailsQuery = `
      SELECT f.Loan_ID, l.ISBN, b.Title, l.Due_date, l.Date_in, CAST(f.Fine_amt AS DECIMAL(10,2)) AS fine_amt, f.Paid
      FROM FINES f
      JOIN BOOK_LOANS l ON f.Loan_ID = l.Loan_ID
      LEFT JOIN BOOKS b ON l.ISBN = b.ISBN
      WHERE l.Card_ID = ? ${includePaid ? '' : 'AND f.Paid = 0'}
    `;
    const details = await executeQuery({ query: detailsQuery, values: [s.Card_ID] });
    results.push({ card_id: s.Card_ID, borrower: s.Bname, total_fines: Number(s.total_fines).toFixed(2), details });
  }

  return results;
}

export async function payFinesForCard(cardId: string): Promise<{ paidCount: number }> {
  // Do not allow payment if any unpaid fine corresponds to a loan that is not returned
  const q = `
    SELECT COUNT(*) as cnt_unreturned
    FROM FINES f
    JOIN BOOK_LOANS l ON f.Loan_ID = l.Loan_ID
    WHERE l.Card_ID = ? AND f.Paid = 0 AND l.Date_in IS NULL
  `;
  const check = await executeQuery({ query: q, values: [cardId] });
  const cnt = check[0]?.cnt_unreturned || 0;
  if (Number(cnt) > 0) {
    throw new Error('Cannot pay fines: one or more books are not yet returned.');
  }

  // Sum unpaid fines for the card
  const sumQ = `
    SELECT SUM(f.Fine_amt) AS total_unpaid
    FROM FINES f
    JOIN BOOK_LOANS l ON f.Loan_ID = l.Loan_ID
    WHERE l.Card_ID = ? AND f.Paid = 0
  `;
  const sumRes = await executeQuery({ query: sumQ, values: [cardId] });
  const total_unpaid = sumRes[0]?.total_unpaid || 0;
  if (Number(total_unpaid) <= 0) {
    throw new Error('No unpaid fines to pay for this card.');
  }

  // Mark all unpaid fines for this card as paid
  const updateQ = `
    UPDATE FINES f
    JOIN BOOK_LOANS l ON f.Loan_ID = l.Loan_ID
    SET f.Paid = 1
    WHERE l.Card_ID = ? AND f.Paid = 0
  `;
  const res = await executeQuery({ query: updateQ, values: [cardId] });

  // return number of affected rows if possible
  const paidCount = (res && (res.affectedRows || res.affected_rows || res.changedRows)) || 0;
  return { paidCount };
}

export async function getTotalFinesForCard(cardId: string): Promise<number> {
  const q = `
    SELECT CAST(SUM(f.Fine_amt) AS DECIMAL(10,2)) AS total
    FROM FINES f
    JOIN BOOK_LOANS l ON f.Loan_ID = l.Loan_ID
    WHERE l.Card_ID = ? AND f.Paid = 0
  `;
  const r = await executeQuery({ query: q, values: [cardId] });
  return Number(r[0]?.total || 0);
}

export default {
  computeLateLoans,
  updateFines,
  listFines,
  payFinesForCard,
  getTotalFinesForCard,
};
