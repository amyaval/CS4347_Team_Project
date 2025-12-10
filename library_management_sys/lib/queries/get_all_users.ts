import { executeQuery } from '@/lib/db';

export interface Borrower {
  Card_ID: string;
  Ssn: string;
  Bname: string;
  Address: string;
  Phone: string;
}

export async function getAllUsers(): Promise<Borrower[]> {
  const query = 'SELECT Card_ID, Ssn, Bname, Address, Phone FROM `BORROWER` ORDER BY Bname';
  
  const results = await executeQuery({ query });
  return results as Borrower[];
}

export async function getNumUsers(): Promise<number> {
  const query = 'SELECT COUNT(*) AS count FROM `BORROWER`';
  const results = await executeQuery({ query });
  
  // Handle different possible result structures
  if (!results || results.length === 0) {
    console.error('getNumUsers: No results returned from query');
    return 0;
  }
  
  const firstResult = results[0];
  
  // Try different possible property names (case-insensitive)
  const count = firstResult.count ?? firstResult.COUNT ?? firstResult['COUNT(*)'] ?? 0;
  
  // Convert to number if it's a string
  const numCount = typeof count === 'string' ? parseInt(count, 10) : Number(count);
  
  if (isNaN(numCount)) {
    console.error('getNumUsers: Invalid count value:', firstResult);
    return 0;
  }
  
  return numCount;
}



