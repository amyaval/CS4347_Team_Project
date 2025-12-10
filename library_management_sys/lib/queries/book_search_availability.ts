import { executeQuery } from '@/lib/db';

export interface Book {
  ISBN: string;
  Title: string;
  Fname: string;
  Minit: string;
  Lname: string;
  Date_in: Date;
  Date_out: Date;
  Card_id: string;
}

export interface BorrowerID {
  Card_ID: string;
}

export async function book_search_availability(searchTerm: string): Promise<Book[]> {
  const query = `
    SELECT A.Isbn, B.Title, C.Fname, C.Minit, C.Lname, L.Date_in, L.Date_out, L.Card_id
    FROM BOOKS AS B 
    LEFT JOIN BOOK_LOANS AS L ON B.Isbn = L.Isbn 
    JOIN BOOK_AUTHORS AS A ON B.Isbn = A.Isbn
    JOIN AUTHORS AS C ON A.Author_id = C.Author_id
    WHERE B.Title LIKE ? OR C.Fname LIKE ? OR C.Lname LIKE ?
  `;
  
  // Add wildcards for LIKE search
  const searchPattern = `%${searchTerm}%`;
  
  // Pass the search pattern three times (once for each ? placeholder)
  const results = await executeQuery({ query, values: [searchPattern, searchPattern, searchPattern] });
  
  return results;
}

export async function getBorrowerIdByIsbn(isbn: string, date_in: Date, date_out: Date): Promise<BorrowerID[]> {
  const query = `
    SELECT BL.Card_ID
    FROM BOOK_LOANS AS BL
    WHERE BL.Isbn = ? AND BL.Date_in = ? AND BL.Date_out = ?`;
  
  // Pass the search pattern three times (once for each ? placeholder)
  const results = await executeQuery({ query, values: [isbn, date_in, date_out] });
  
  return results;
}


export async function getAllBooks(): Promise<Book[]> {
  const query = "SELECT * FROM BOOKS";
  return await executeQuery({ query });
}

export async function getBookById(id: number): Promise<Book | null> {
  const query = "SELECT * FROM BOOKS WHERE BookID = ?";
  const results = await executeQuery({ query, values: [id] });
  return results[0] || null;
}

export async function getNumBooks(): Promise<number> {
  const query = 'SELECT COUNT(*) AS count FROM `BOOKS`';
  const results = await executeQuery({ query });
  
  if (!results || results.length === 0) {
    console.error('getNumUsers: No results returned from query');
    return 0;
  }

  const firstResult = results[0];

  const count = firstResult.count ?? firstResult.COUNT ?? firstResult['COUNT(*)'] ?? 0;

  const numCount = typeof count === 'string' ? parseInt(count, 10) : Number(count);

  if (isNaN(numCount)) {
    console.error('getNumUsers: Invalid count value:', firstResult);
    return 0;
  }
  
  return numCount;
}