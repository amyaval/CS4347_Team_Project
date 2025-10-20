#!/bin/bash
read -p "Enter MySQL username: " MYSQL_USERNAME

read -sp "Enter MySQL password: " MYSQL_PASSWORD
echo

tables=("BOOKS" "AUTHORS" "BOOK_AUTHORS")

for t in "${tables[@]}"; do
    mysql -u "$MYSQL_USERNAME" -p"$MYSQL_PASSWORD" -D LIBRARY_SYSTEM --batch -e "SELECT * FROM $t;" > "output/$t.csv"
done

