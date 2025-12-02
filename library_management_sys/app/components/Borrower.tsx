"use client";

import { useState, useEffect } from "react";
import { Search, MoreVertical } from "lucide-react";

interface Borrower {
    CardID: string;
    ssn: string;
    bname: string;
    address: string;
    phone: string;
}

export default function Borrower() {
    const [searchQuery, setSearchQuery] = useState("");
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [filteredBorrowers, setFilteredBorrowers] = useState<Borrower[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch all borrowers from API
    const fetchBorrowers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/mysql/borrower_search");
            const json = await res.json();

            if (json.success) {
                setBorrowers(json.data);
            } else {
                setBorrowers([]);
            }
        } catch (error) {
            console.error("Failed to fetch borrowers:", error);
            setBorrowers([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter borrowers whenever search query or borrowers list changes
    useEffect(() => {
        const filtered = borrowers.filter(
            (b) =>
                b.bname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.ssn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.CardID.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredBorrowers(filtered);
        setCurrentPage(1);
    }, [searchQuery, borrowers]);

    useEffect(() => {
        fetchBorrowers();
    }, []);


    // Pagination logic
    const totalPages = Math.ceil(filteredBorrowers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBorrowers = filteredBorrowers.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    // Dynamic page numbers (max 3 visible pages)
    const getVisiblePages = () => {
        const maxVisible = 3;
        let start = Math.max(currentPage - 1, 1);
        const end = Math.min(start + maxVisible - 1, totalPages);

        if (end - start + 1 < maxVisible) {
            start = Math.max(end - maxVisible + 1, 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="p-6">
            {/* Title and Add User button */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold" style={{ color: "#000000" }}>
                    Find Users
                </h1>
                <button className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 transition-colors">
                    Add User
                </button>
            </div>

            {/* Search Bar */}
            <div className="flex flex-row justify-between mb-6 space-x-4">
                <div className="w-full bg-[#F6F6F6] p-[1rem] border border-[#EBEBEB] rounded-lg flex flex-row items-center">
                    <Search />
                    <input
                        type="text"
                        placeholder="Search by name, CardID, or SSN"
                        className="w-full bg-transparent ml-2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-50 rounded-lg p-6">
                {!loading && filteredBorrowers.length === 0 && (
                    <p className="text-gray-600 italic">No users found.</p>
                )}

                <div className="bg-white rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">CardID</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">SSN</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Name</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Address</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Phone</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading
                                ? Array.from({ length: itemsPerPage }).map((_, index) => (
                                    <tr key={index} className="border-b border-gray-100">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <td key={i} className="py-4 px-6">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                                : paginatedBorrowers.map((borrower, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-6 text-sm text-gray-600">{borrower.CardID}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{borrower.ssn}</td>
                                        <td className="py-4 px-6 text-sm text-gray-900">{borrower.bname}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{borrower.address}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{borrower.phone}</td>
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

                {/* Pagination Buttons */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-4 space-x-2">
                        {/* Jump to First */}
                        <button
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        >
                            {"<<"}
                        </button>

                        {/* Back one page */}
                        <button
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            {"<"}
                        </button>

                        {/* Dynamic page numbers */}
                        {visiblePages.map((num) => (
                            <button
                                key={num}
                                className={`px-3 py-1 rounded ${currentPage === num ? "bg-red-700 text-white" : "bg-gray-200"
                                    }`}
                                onClick={() => setCurrentPage(num)}
                            >
                                {num}
                            </button>
                        ))}

                        {/* Forward one page */}
                        <button
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            {">"}
                        </button>

                        {/* Jump to Last */}
                        <button
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            {">>"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
