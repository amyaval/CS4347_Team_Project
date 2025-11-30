"use client";

import { useState, useEffect } from "react";
import { Search, MoreVertical } from "lucide-react";

export default function CatalogCard() {
  const [searchQuery, setSearchQuery] = useState("will");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch from API whenever searchQuery changes
  useEffect(() => {
    if (!searchQuery) return;

    const fetchBooks = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/mysql/book_search?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();

        const booksWithStatus = data.map((book: any) => {
            const dateIn = book.Date_in ? new Date(book.Date_in) : null;
            const dateOut = book.Date_out ? new Date(book.Date_out) : null;
            
            const isOut = dateOut && !dateIn;

            // put together author name
            const authorName = `${book.Fname} ${book.Minit ? book.Minit + ' ' : ''}${book.Lname}`;
            return {
                isbn: book.ISBN ?? book.Isbn ?? book.isbn ?? "",
                title: book.Title,
                authors: authorName,
                date_in: dateIn,
                date_out: dateOut,
                status: isOut ? "Out" : "In",
            };
        });

        setBooks(booksWithStatus);
      } catch (error) {
        console.error("Error fetching books:", error);
        setBooks([]);
      }

      setLoading(false);
    };

    fetchBooks();
  }, [searchQuery]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-7xl mx-auto">

      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Catalog</h1>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Search books..."
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-gray-50 rounded-lg p-6">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Book Results for "{searchQuery}"
          </h2>
        </div>

        {/* Loading State */}
        {loading && (
          <p className="text-gray-600 italic px-6">Loading results...</p>
        )}

        {/* No Results */}
        {!loading && books.length === 0 && (
          <p className="text-gray-600 italic px-6">No books found.</p>
        )}

        {/* Table */}
        {!loading && books.length > 0 && (
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ISBN</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Title</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Authors</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-600">{book.isbn}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{book.title}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{book.authors}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-sm font-medium ${
                          book.status === "Out" ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button className="text-red-600 hover:text-red-700 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}