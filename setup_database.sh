#!/bin/bash

# Get the absolute path of the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOOKS_CSV="$PROJECT_DIR/books.csv"
BORROWERS_CSV="$PROJECT_DIR/borrowers.csv"

# Check if CSV files exist
if [ ! -f "$BOOKS_CSV" ]; then
    echo "Error: books.csv not found at $BOOKS_CSV"
    exit 1
fi

if [ ! -f "$BORROWERS_CSV" ]; then
    echo "Error: borrowers.csv not found at $BORROWERS_CSV"
    exit 1
fi

# Escape the paths for use in SQL (replace / with \/ for MySQL)
BOOKS_PATH=$(echo "$BOOKS_CSV" | sed 's/\//\\\//g')
BORROWERS_PATH=$(echo "$BORROWERS_CSV" | sed 's/\//\\\//g')

# Create a temporary SQL file with correct paths
TEMP_SQL="$PROJECT_DIR/normalize_temp.sql"
cp "$PROJECT_DIR/normalize.sql" "$TEMP_SQL"

# Replace the Windows paths with macOS paths
# For macOS, we need to use forward slashes
sed -i '' "s|LOAD DATA LOCAL INFILE 'C:/Users/valdi/Documents/Database_Team_Project_csv/books.csv'|LOAD DATA LOCAL INFILE '$BOOKS_CSV'|g" "$TEMP_SQL"
sed -i '' "s|LOAD DATA LOCAL INFILE 'C:/Users/valdi/Documents/Database_Team_Project_csv/borrowers.csv'|LOAD DATA LOCAL INFILE '$BORROWERS_CSV'|g" "$TEMP_SQL"

echo "Setup script ready!"
echo ""
echo "To load the database, run the following command:"
echo ""
echo "mysql -u YOUR_USERNAME -p --local-infile < $TEMP_SQL"
echo ""
echo "Or if you want to enter the command interactively:"
echo "mysql -u YOUR_USERNAME -p --local-infile"
echo "Then run: source $TEMP_SQL"
echo ""
read -p "Do you want to run it now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter MySQL username: " MYSQL_USER
    mysql -u "$MYSQL_USER" -p --local-infile < "$TEMP_SQL"
    if [ $? -eq 0 ]; then
        echo "Database setup completed successfully!"
        rm "$TEMP_SQL"
    else
        echo "Error: Database setup failed. Check the error messages above."
        echo "Temporary SQL file saved at: $TEMP_SQL"
    fi
else
    echo "Temporary SQL file created at: $TEMP_SQL"
    echo "You can run it manually with the command shown above."
fi

