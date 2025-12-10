"use client";

import { useState, useEffect } from "react";
import { CheckSquare, BookOpen, User, BookPlus, Search, MoreVertical, BadgeDollarSign } from "lucide-react";

type TabType = "dashboard" | "checkin" | "catalog" | "borrower" | "checkout" | "fines";
import Borrower from "./Borrower";
import FinesPage from "../fines/page";

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const navItems = [
    { id: "checkin" as TabType, label: "Check In", icon: CheckSquare },
    { id: "catalog" as TabType, label: "Catalog", icon: BookOpen },
    { id: "borrower" as TabType, label: "Users", icon: User },
      { id: "fines" as TabType, label: "Manage Fines", icon: BadgeDollarSign},
    { id: "checkout" as TabType, label: "Check Out", icon: BookPlus },
  ];

  return (
    <div className="h-16 border-b flex items-center justify-center px-6 gap-4" style={{ borderColor: "#EBEBEB" }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const isCheckOut = item.id === "checkout";

        if (isCheckOut) {
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="px-4 py-2 rounded text-white flex items-center gap-2"
              style={{ backgroundColor: isActive ? "#B60000" : "#B60000" }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="px-4 py-2 rounded flex items-center gap-2 transition-colors"
            style={{
              color: isActive ? "#B60000" : "#000000",
            }}
          >
            <Icon size={18} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

interface DashboardContentProps {
  onNavigateToCatalog?: (query?: string) => void;
}

function DashboardContent({ onNavigateToCatalog }: DashboardContentProps) {
  const [numUsers, setNumUsers] = useState<number | null>(null);
  const [numBooks, setNumBooks] = useState<number | null>(null);
  const [numCheckedOut, setNumCheckedOut] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    async function loadNumUsers() {
      try {
        const res = await fetch("/api/mysql/users?count=1");
        const data = await res.json();
        
        if (!res.ok) {
          console.error('Error fetching user count:', data.error);
          setNumUsers(0);
          return;
        }
        
        if (data.error) {
          console.error('API error:', data.error);
          setNumUsers(0);
          return;
        }
        
        setNumUsers(data.count ?? 0);
      } catch (error) {
        console.error('Error loading user count:', error);
        setNumUsers(0);
      }
    }
    async function loadNumBooks() {
      try {
        const res = await fetch("/api/mysql/book");
        const data = await res.json();
        
        if (!res.ok) {
          console.error('Error fetching book count:', data.error);
          setNumBooks(0);
          return;
        }
        
        if (data.error) {
          console.error('API error:', data.error);
          setNumUsers(0);
          return;
        }
        console.log(data);
        setNumBooks(data.numBooks ?? 0);
        setNumCheckedOut(data.numCheckOut[0].count ?? 0);
      } catch (error) {
        console.error('Error loading book count:', error);
        setNumBooks(0);
      }
    }
    loadNumUsers();
    loadNumBooks();
  },[]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const fetchBooks = async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/mysql/book_search?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();

        const booksWithStatus = data.map((book: any) => {
          const dateIn = book.Date_in ? new Date(book.Date_in) : null;
          const dateOut = book.Date_out ? new Date(book.Date_out) : null;
          const isOut = dateOut && !dateIn;
          const authorName = `${book.Fname} ${book.Minit ? book.Minit + ' ' : ''}${book.Lname}`;
          return {
            isbn: book.ISBN ?? book.Isbn ?? book.isbn ?? "",
            title: book.Title,
            authors: authorName,
            status: isOut ? "Out" : "In",
            card_id: book.Card_id ?? book.card_id ?? "",
          };
        });

        setSearchResults(booksWithStatus);
      } catch (error) {
        console.error("Error fetching books:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4" style={{ color: "#000000" }}>
        Dashboard
      </h1>

      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Quick search for a book"
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            style={{ borderColor: "#EBEBEB", color: "#000000" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Search Results */}
        {searchQuery.trim() && (
          <div className="mt-4 w-full bg-white rounded-lg border" style={{ borderColor: "#EBEBEB", maxHeight: "400px", overflowY: "auto" }}>
            {searchLoading ? (
              <div className="p-4 text-center text-gray-600">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-600">No books found.</div>
            ) : (
              <div>
                {searchResults.slice(0, 10).map((book: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    style={{ 
                      borderBottom: index < searchResults.slice(0, 10).length - 1 ? "1px solid #EBEBEB" : "none"
                    }}
                    onClick={() => {
                      if (onNavigateToCatalog) {
                        onNavigateToCatalog(searchQuery);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{book.title}</p>
                        <p className="text-sm text-gray-600 mt-1">ISBN: {book.isbn}</p>
                        <p className="text-sm text-gray-600">Author: {book.authors}</p>
                      </div>
                      <span
                        className={`ml-4 px-2 py-1 rounded text-xs font-medium ${
                          book.status === "Out" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {book.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border" style={{ borderColor: "#EBEBEB" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: "#B60000" }}>
              Number of Users
            </span>
            <span style={{ color: "#B60000" }}>ℹ</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "#000000" }}>
            {numUsers}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border" style={{ borderColor: "#EBEBEB" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: "#B60000" }}>
              Circulation
            </span>
            <span style={{ color: "#B60000" }}>ℹ</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "#000000" }}>
            {numBooks}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border" style={{ borderColor: "#EBEBEB" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: "#B60000" }}>
              Items Checked Out
            </span>
            <span style={{ color: "#B60000" }}>ℹ</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "#000000" }}>
            {numCheckedOut}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border" style={{ borderColor: "#EBEBEB" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: "#B60000" }}>
              Total Fines
            </span>
            <span style={{ color: "#B60000" }}>ℹ</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "#000000" }}>
            $17.00
          </p>
        </div>
      </div>

      
    </div>
  );
}

interface BookLoan {
  Loan_ID: number;
  ISBN: string;
  Card_ID: string;
  Date_out: Date | null;
  Due_date: Date | null;
  Date_in: Date | null;
  Title: string;
  Bname: string;
}

function CheckInContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loans, setLoans] = useState<BookLoan[]>([]);
  const [selectedLoans, setSelectedLoans] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search for loans when searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLoans([]);
      setSelectedLoans([]);
      return;
    }

    const fetchLoans = async () => {
      setLoading(true);
      setMessage(null);

      try {
        const res = await fetch(`/api/mysql/checkin?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Search failed");
        }

        setLoans(data);
        setSelectedLoans([]);
      } catch (error) {
        console.error("Error fetching loans:", error);
        setLoans([]);
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        setMessage({ type: "error", text: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchLoans();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLoanToggle = (loanId: number) => {
    setSelectedLoans(prev => {
      if (prev.includes(loanId)) {
        return prev.filter(id => id !== loanId);
      } else {
        if (prev.length >= 3) {
          setMessage({ type: "error", text: "You can only select up to 3 loans at a time" });
          return prev;
        }
        return [...prev, loanId];
      }
    });
  };

  const handleCheckIn = async () => {
    if (selectedLoans.length === 0) {
      setMessage({ type: "error", text: "Please select at least one loan to check in" });
      return;
    }

    if (selectedLoans.length > 3) {
      setMessage({ type: "error", text: "You can only check in up to 3 loans at a time" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/mysql/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loanIds: selectedLoans,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Check-in failed");
      }

      // Show results
      const successCount = data.filter((r: any) => r.message.includes("successfully")).length;
      const errorCount = data.length - successCount;

      if (errorCount === 0) {
        setMessage({ type: "success", text: `Successfully checked in ${successCount} book(s)` });
      } else {
        setMessage({ 
          type: "error", 
          text: `Checked in ${successCount} book(s), ${errorCount} failed. Check console for details.` 
        });
        console.log("Check-in results:", data);
      }

      // Refresh the search results
      if (searchQuery.trim()) {
        const res = await fetch(`/api/mysql/checkin?search=${encodeURIComponent(searchQuery)}`);
        const updatedData = await res.json();
        if (res.ok) {
          setLoans(updatedData);
        }
      }

      setSelectedLoans([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date | null | string) => {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4" style={{ color: "#000000" }}>
        Check In
      </h1>

      <div className="mb-6">
        <div className="bg-[#F6F6F6] p-[1rem] space-x-[1.25rem] w-full border border-[#EBEBEB] rounded-lg flex flex-row">
          <Search />
          <input
            type="text"
            placeholder="Please enter ISBN, Card ID, or Borrower Name"
            className="w-full bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
        >
          {message.text}
        </div>
      )}

      {loading && (
        <p className="text-gray-600 italic mb-4">Searching...</p>
      )}

      {!loading && searchQuery.trim() && loans.length === 0 && (
        <p className="text-gray-600 italic mb-4">No active loans found.</p>
      )}

      {!loading && loans.length > 0 && (
        <div className="mb-6">
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-12">
                    <input
                      type="checkbox"
                      checked={selectedLoans.length === loans.length && loans.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const maxSelect = Math.min(loans.length, 3);
                          setSelectedLoans(loans.slice(0, maxSelect).map(l => l.Loan_ID));
                        } else {
                          setSelectedLoans([]);
                        }
                      }}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ISBN</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Borrower</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Card ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date Out</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr 
                    key={loan.Loan_ID} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedLoans.includes(loan.Loan_ID) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedLoans.includes(loan.Loan_ID)}
                        onChange={() => handleLoanToggle(loan.Loan_ID)}
                        disabled={!selectedLoans.includes(loan.Loan_ID) && selectedLoans.length >= 3}
                        className="cursor-pointer disabled:opacity-50"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{loan.ISBN}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{loan.Title}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{loan.Bname}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{loan.Card_ID}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(loan.Date_out)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(loan.Due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedLoans.length > 0 && (
        <div className="flex flex-row justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            {selectedLoans.length} loan(s) selected (max 3)
          </p>
          <button
            onClick={handleCheckIn}
            disabled={submitting || selectedLoans.length === 0}
            className="py-2 px-4 bg-red-700 rounded-sm text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Checking In..." : `Check In ${selectedLoans.length} Book(s)`}
          </button>
        </div>
      )}
    </div>
  );
}

interface CatalogContentProps {
  onCheckoutClick?: (isbn: string) => void;
}

function CatalogContent({ onCheckoutClick }: CatalogContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [checkingIn, setCheckingIn] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Listen for search query from dashboard
  useEffect(() => {
    const handleSetSearch = (event: CustomEvent) => {
      if (event.detail?.query) {
        setSearchQuery(event.detail.query);
      }
    };
    window.addEventListener('setCatalogSearch', handleSetSearch as EventListener);
    return () => {
      window.removeEventListener('setCatalogSearch', handleSetSearch as EventListener);
    };
  }, []);

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
            card_id: book.Card_id ?? book.card_id ?? "",
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside any dropdown
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const handleCheckIn = async (isbn: string, index: number) => {
    setOpenDropdown(null);
    setCheckingIn(index);
    setMessage(null);

    try {
      // First, find the loan ID for this ISBN
      const searchRes = await fetch(`/api/mysql/checkin?search=${encodeURIComponent(isbn)}`);
      const loanData = await searchRes.json();

      if (!searchRes.ok || !Array.isArray(loanData) || loanData.length === 0) {
        throw new Error("No active loan found for this book");
      }

      // Get the first active loan for this ISBN
      const loanId = loanData[0].Loan_ID;

      // Check in the book
      const response = await fetch("/api/mysql/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loanIds: [loanId],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Check-in failed");
      }

      if (result[0]?.message.includes("successfully")) {
        setMessage({ type: "success", text: "Book checked in successfully" });
        
        // Refresh the book list to update status
        if (searchQuery.trim()) {
          const res = await fetch(`/api/mysql/book_search?search=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();

          const booksWithStatus = data.map((book: any) => {
            const dateIn = book.Date_in ? new Date(book.Date_in) : null;
            const dateOut = book.Date_out ? new Date(book.Date_out) : null;
            const isOut = dateOut && !dateIn;
            const authorName = `${book.Fname} ${book.Minit ? book.Minit + ' ' : ''}${book.Lname}`;
            return {
              isbn: book.ISBN ?? book.Isbn ?? book.isbn ?? "",
              title: book.Title,
              authors: authorName,
              date_in: dateIn,
              date_out: dateOut,
              status: isOut ? "Out" : "In",
              card_id: book.Card_id ?? book.card_id ?? "",
            };
          });

          setBooks(booksWithStatus);
        }
      } else {
        throw new Error(result[0]?.message || "Check-in failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setCheckingIn(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4" style={{ color: "#000000" }}>
        Catalog
      </h1>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="bg-[#F6F6F6] p-[1rem] space-x-[1.25rem] w-full border border-[#EBEBEB] rounded-lg flex flex-row">
          <Search />
          <input
            type="text"
            placeholder="Search books..."
            className="w-full bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
          >
            {message.text}
          </div>
        )}

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
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Borrower ID</th>
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
                        className={`text-sm font-medium ${book.status === "Out" ? "text-red-600" : "text-green-600"
                          }`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {book.status === "Out" ? (book.card_id || "-") : "-"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="relative dropdown-container">
                        <button 
                          onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                          className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                          disabled={checkingIn === index}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openDropdown === index && book.status === "In" && (
                          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                if (onCheckoutClick) {
                                  onCheckoutClick(book.isbn);
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg"
                            >
                              Check Out
                            </button>
                          </div>
                        )}
                        {openDropdown === index && book.status === "Out" && (
                          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={() => handleCheckIn(book.isbn, index)}
                              disabled={checkingIn === index}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {checkingIn === index ? "Checking In..." : "Check In"}
                            </button>
                          </div>
                        )}
                      </div>
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

interface CheckOutContentProps {
  initialISBN?: string;
}

function CheckOutContent({ initialISBN }: CheckOutContentProps) {
  const [isbn, setIsbn] = useState("");
  const [cardId, setCardId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Update ISBN when initialISBN prop changes
  useEffect(() => {
    if (initialISBN) {
      setIsbn(initialISBN);
    }
  }, [initialISBN]);

  const handleSubmit = async () => {
    if (!isbn || !cardId) {
      setMessage({ type: "error", text: "Please enter both ISBN and Card ID" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/mysql/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ISBN: isbn,
          Card_id: cardId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      setMessage({ type: "success", text: data.message || "Book checked out successfully" });
      setIsbn("");
      setCardId("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4" style={{ color: "#000000" }}>
        Check Out
      </h1>
      <div className="flex flex-row justify-between mb-6 space-x-4">
        <div className="w-full">
          <div className="bg-[#F6F6F6] p-[1rem] space-x-[1.25rem] w-full border border-[#EBEBEB] rounded-lg flex flex-row">
            <Search />
            <input
              type="text"
              placeholder="Please enter ISBN"
              className="w-full bg-transparent"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="bg-[#F6F6F6] p-[1rem] space-x-[1.25rem] w-full border border-[#EBEBEB] rounded-lg flex flex-row">
            <Search />
            <input
              type="text"
              placeholder="Please enter CardID"
              className="w-full bg-transparent"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
            />
          </div>
        </div>
      </div>
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
        >
          {message.text}
        </div>
      )}
      <div className="flex flex-row justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="py-2 px-4 bg-red-700 rounded-sm text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

export function MainCard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [checkoutISBN, setCheckoutISBN] = useState<string>("");

  const handleCheckoutClick = (isbn: string) => {
    setCheckoutISBN(isbn);
    setActiveTab("checkout");
  };

  const getTitle = () => {
    switch (activeTab) {
      case "checkin":
        return "Check In";
      case "catalog":
        return "Catalog";
      case "borrower":
        return "Find User";
      case "checkout":
        return "Check Out";
      default:
        return "Dashboard";
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "checkin":
        return <CheckInContent />;
      case "catalog":
        return <CatalogContent onCheckoutClick={handleCheckoutClick} />;
      case "borrower":
        return <Borrower />;
      case "checkout":
        return <CheckOutContent initialISBN={checkoutISBN} />;
      case "fines":
        return <FinesPage />;
      default:
        return <DashboardContent onNavigateToCatalog={(query) => {
          setActiveTab("catalog");
          // Set the search query in catalog if provided
          if (query) {
            setTimeout(() => {
              const event = new CustomEvent('setCatalogSearch', { detail: { query } });
              window.dispatchEvent(event);
            }, 100);
          }
        }} />;
    }
  };

  return (
    <div className="bg-white border border-[#EBEBEB] rounded-[1rem] shadow-lg h-full flex flex-col">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-auto">{renderContent()}</div>
    </div>
  );
}
