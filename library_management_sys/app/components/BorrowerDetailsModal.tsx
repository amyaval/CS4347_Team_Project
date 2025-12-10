"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Borrower {
    CardID: string;
    ssn: string;
    bname: string;
    address: string;
    phone: string;
}

interface BorrowerLoan {
    Loan_ID: number;
    ISBN: string;
    Title: string;
    Date_out: Date | null;
    Due_date: Date | null;
    Date_in: Date | null;
}

interface BorrowerDetailsModalProps {
    borrower: Borrower;
    onClose: () => void;
}

export default function BorrowerDetailsModal({ borrower, onClose }: BorrowerDetailsModalProps) {
    const [loans, setLoans] = useState<BorrowerLoan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const res = await fetch(`/api/mysql/borrower_loans?cardId=${encodeURIComponent(borrower.CardID)}`);
                const data = await res.json();
                
                if (data.success) {
                    setLoans(data.data);
                }
            } catch (error) {
                console.error("Error fetching loans:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
    }, [borrower.CardID]);

    const formatDate = (date: Date | null | string) => {
        if (!date) return "-";
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleDateString();
    };

    const isOverdue = (dueDate: Date | null | string, dateIn: Date | null | string) => {
        if (!dueDate) return false;
        const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDateOnly = new Date(due);
        dueDateOnly.setHours(0, 0, 0, 0);
        
        // Only overdue if not returned and past due date
        return !dateIn && dueDateOnly < today;
    };

    const activeLoans = loans.filter(loan => !loan.Date_in);
    const returnedLoans = loans.filter(loan => loan.Date_in);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div 
                className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <h2 className="text-2xl font-bold" style={{ color: "#000000" }}>
                        Borrower Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-4">
                        {/* Name - Full Width */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900">
                                {borrower.bname}
                            </div>
                        </div>

                        {/* Street/Address - Full Width */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Street
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900">
                                {borrower.address}
                            </div>
                        </div>

                        {/* SSN and Phone Number - Side by Side */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SSN
                                </label>
                                <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900">
                                    {borrower.ssn}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900">
                                    {borrower.phone}
                                </div>
                            </div>
                        </div>

                        {/* Card ID - Full Width */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Card ID
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-900">
                                {borrower.CardID}
                            </div>
                        </div>
                    </div>

                    {/* Books Checked Out Section */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3" style={{ color: "#000000" }}>
                            Books Checked Out
                        </h3>
                        {loading ? (
                            <p className="text-gray-600 italic">Loading loans...</p>
                        ) : activeLoans.length === 0 ? (
                            <p className="text-gray-600 italic">No books currently checked out.</p>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="space-y-3">
                                    {activeLoans.map((loan) => (
                                        <div 
                                            key={loan.Loan_ID} 
                                            className={`p-3 bg-white rounded border ${
                                                isOverdue(loan.Due_date, loan.Date_in) 
                                                    ? "border-red-300 bg-red-50" 
                                                    : "border-gray-200"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{loan.Title}</p>
                                                    <p className="text-sm text-gray-600 mt-1">ISBN: {loan.ISBN}</p>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Due Date:</span>
                                                    </p>
                                                    <p className={`text-sm font-medium ${
                                                        isOverdue(loan.Due_date, loan.Date_in) 
                                                            ? "text-red-600" 
                                                            : "text-gray-900"
                                                    }`}>
                                                        {formatDate(loan.Due_date)}
                                                    </p>
                                                    {isOverdue(loan.Due_date, loan.Date_in) && (
                                                        <p className="text-xs text-red-600 mt-1">Overdue</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Returned Books Section */}
                    {returnedLoans.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3" style={{ color: "#000000" }}>
                                Returned Books
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="space-y-3">
                                    {returnedLoans.map((loan) => (
                                        <div 
                                            key={loan.Loan_ID} 
                                            className="p-3 bg-white rounded border border-gray-200"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{loan.Title}</p>
                                                    <p className="text-sm text-gray-600 mt-1">ISBN: {loan.ISBN}</p>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Returned:</span> {formatDate(loan.Date_in)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Due was:</span> {formatDate(loan.Due_date)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer - Fixed at bottom */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

