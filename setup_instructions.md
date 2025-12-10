# Database Setup Instructions

## Step 1: Create the database and tables

Run this command in your terminal (replace YOUR_USERNAME with your MySQL username):

```bash
mysql -u YOUR_USERNAME -p < normalize.sql
```

**Note:** The normalize.sql file has hardcoded Windows paths that won't work. You have two options:

### Option A: Use the Node.js script (Recommended)

1. Make sure you have the required packages:
```bash
cd library_management_sys
npm install dotenv
cd ..
```

2. Make sure your `.env.local` file in `library_management_sys/` has your MySQL credentials:
```
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
MYSQL_DATABASE=LIBRARY_SYSTEM
```

3. Run the load script:
```bash
node load_data.js
```

### Option B: Manually update normalize.sql

1. Open `normalize.sql` in a text editor
2. Find these two lines (around lines 87 and 93):
   - `LOAD DATA LOCAL INFILE 'C:/Users/valdi/Documents/Database_Team_Project_csv/books.csv'`
   - `LOAD DATA LOCAL INFILE 'C:/Users/valdi/Documents/Database_Team_Project_csv/borrowers.csv'`

3. Replace them with the absolute paths to your CSV files:
   - `LOAD DATA LOCAL INFILE '/Users/thebenzsecrets/CS4347_Team_Project/books.csv'`
   - `LOAD DATA LOCAL INFILE '/Users/thebenzsecrets/CS4347_Team_Project/borrowers.csv'`

4. Then run:
```bash
mysql -u YOUR_USERNAME -p --local-infile < normalize.sql
```

The `--local-infile` flag is required for LOAD DATA LOCAL INFILE to work.
