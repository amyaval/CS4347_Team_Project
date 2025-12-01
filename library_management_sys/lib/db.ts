import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || '',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'LIBRARY_SYSTEM',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

if (!process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD) {
  console.error('WARNING: MySQL credentials not found in environment variables. Please check your .env.local file.');
}

interface QueryParams {
  query: string;
  values?: any[];
}

export async function executeQuery({ query, values = [] }: QueryParams): Promise<any> {
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}