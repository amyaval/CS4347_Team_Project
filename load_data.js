const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
const envPath = path.join(__dirname, 'library_management_sys', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

async function loadData() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || '',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'LIBRARY_SYSTEM',
    multipleStatements: true,
    localInfile: true
  });

  try {
    console.log('Connected to database. Loading data...');

    // Read and execute the normalize.sql file (without the LOAD DATA commands)
    const sqlFile = fs.readFileSync(path.join(__dirname, 'normalize.sql'), 'utf8');
    
    // Split the SQL file and remove the LOAD DATA LOCAL INFILE commands
    // We'll handle CSV loading manually
    const sqlStatements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.includes('LOAD DATA LOCAL INFILE'));

    // Execute table creation statements
    for (const statement of sqlStatements) {
      if (statement.trim()) {
        try {
          await connection.query(statement + ';');
        } catch (error) {
          // Ignore "table already exists" errors
          if (!error.message.includes('already exists') && !error.message.includes('Unknown database')) {
            console.error('Error executing statement:', error.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
          }
        }
      }
    }

    // Load books.csv
    console.log('Loading books.csv...');
    const booksCsv = fs.readFileSync(path.join(__dirname, 'books.csv'), 'utf8');
    const booksLines = booksCsv.split('\n').filter(line => line.trim());
    const booksHeader = booksLines[0].split('\t');
    
    // Clear RAW_DATA table first
    await connection.query('DELETE FROM RAW_DATA');
    
    for (let i = 1; i < booksLines.length; i++) {
      const values = booksLines[i].split('\t');
      if (values.length >= 6) {
        await connection.query(
          'INSERT INTO RAW_DATA (ISBN, ISBN13, Title, Author, COVER, PUBLISHER, PAGES) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            values[0] || null,
            values[1] || null,
            values[2] || null,
            values[3] || null,
            values[4] || null,
            values[5] || null,
            values[6] ? parseInt(values[6]) : null
          ]
        );
      }
    }
    console.log(`Loaded ${booksLines.length - 1} books`);

    // Load borrowers.csv
    console.log('Loading borrowers.csv...');
    const borrowersCsv = fs.readFileSync(path.join(__dirname, 'borrowers.csv'), 'utf8');
    const borrowersLines = borrowersCsv.split('\n').filter(line => line.trim());
    
    // Clear RAW_BORROWER_DATA table first
    await connection.query('DELETE FROM RAW_BORROWER_DATA');
    
    for (let i = 1; i < borrowersLines.length; i++) {
      // Parse CSV with quoted fields
      const line = borrowersLines[i];
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add last value
      
      if (values.length >= 8) {
        await connection.query(
          'INSERT INTO RAW_BORROWER_DATA (Card_ID, Ssn, Fname, Lname, Email, Address, City, State, Phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            values[0] || null,
            values[1] || null,
            values[2] || null,
            values[3] || null,
            values[4] || null,
            values[5] || null,
            values[6] || null,
            values[7] || null,
            values[8] || null
          ]
        );
      }
    }
    console.log(`Loaded ${borrowersLines.length - 1} borrowers`);

    // Now run the INSERT statements to populate the normalized tables
    console.log('Populating normalized tables...');
    
    await connection.query(`
      INSERT INTO BOOKS (ISBN, Title)
      SELECT DISTINCT ISBN, Title
      FROM RAW_DATA
      ON DUPLICATE KEY UPDATE Title = VALUES(Title);
    `);

    await connection.query(`
      INSERT INTO BOOK_AUTHORS (ISBN)
      SELECT DISTINCT ISBN
      FROM RAW_DATA;
    `);

    await connection.query(`
      INSERT INTO BORROWER (Card_ID, Ssn, Bname, Address, Phone)
      SELECT
        RIGHT(REGEXP_REPLACE(TRIM(Card_ID), '[^0-9]', ''), 6) AS Card_ID,
        TRIM(Ssn) AS Ssn,
        CONCAT_WS(' ', TRIM(Fname), TRIM(Lname)) AS Bname,
        TRIM(Address) AS Address,
        REGEXP_REPLACE(COALESCE(Phone,''), '[^0-9]', '') AS Phone
      FROM RAW_BORROWER_DATA
      ON DUPLICATE KEY UPDATE 
        Ssn = VALUES(Ssn),
        Bname = VALUES(Bname),
        Address = VALUES(Address),
        Phone = VALUES(Phone);
    `);

    await connection.query(`
      INSERT INTO AUTHORS (Author_ID, FName, Minit, LName)
      SELECT BA.Author_ID,
             TRIM(SUBSTRING_INDEX(RD.Author, ' ', 1)) AS FName,
             CASE
                 WHEN (LENGTH(RD.Author) - LENGTH(REPLACE(RD.Author, ' ', ''))) > 1
                 THEN LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(RD.Author, ' ', 2), ' ', -1), 1)
                 ELSE NULL
             END AS Minit,
             TRIM(SUBSTRING_INDEX(RD.Author, ' ', -1)) AS LName
      FROM RAW_DATA RD
      JOIN BOOK_AUTHORS BA ON RD.ISBN = BA.ISBN
      ON DUPLICATE KEY UPDATE
        FName = VALUES(FName),
        Minit = VALUES(Minit),
        LName = VALUES(LName);
    `);

    // Get counts
    const [bookCount] = await connection.query('SELECT COUNT(*) as count FROM BOOKS');
    const [borrowerCount] = await connection.query('SELECT COUNT(*) as count FROM BORROWER');
    
    console.log('\n✅ Data loaded successfully!');
    console.log(`   Books: ${bookCount[0].count}`);
    console.log(`   Borrowers: ${borrowerCount[0].count}`);

  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

loadData().catch(console.error);

