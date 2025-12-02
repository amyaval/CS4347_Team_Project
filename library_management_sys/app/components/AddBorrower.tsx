"use client";

import { useState } from "react";

interface NewUserModalProps {
    onClose: () => void;
    onUserAdded: () => void;
}

export default function NewUserModal({ onClose, onUserAdded }: NewUserModalProps) {
    const [ssn, setSsn] = useState("");
    const [bname, setBname] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!ssn || !bname || !address || !phone) {
            alert("Please fill in all fields.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/mysql/borrower_search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ssn, bname, address, phone }),
            });
            const result = await res.json();
            if (result.success) {
                alert(`User added successfully! CardID: ${result.CardID}`);
                onUserAdded();
                onClose();
            } else {
                alert("Failed to add user: " + result.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error adding user.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
                <h2 className="text-xl font-bold">Add New User</h2>
                <input type="text" placeholder="SSN" className="w-full border rounded px-2 py-1" value={ssn} onChange={e => setSsn(e.target.value)} />
                <input type="text" placeholder="Name" className="w-full border rounded px-2 py-1" value={bname} onChange={e => setBname(e.target.value)} />
                <input type="text" placeholder="Address" className="w-full border rounded px-2 py-1" value={address} onChange={e => setAddress(e.target.value)} />
                <input type="text" placeholder="Phone" className="w-full border rounded px-2 py-1" value={phone} onChange={e => setPhone(e.target.value)} />
                <div className="flex justify-end space-x-2 mt-4">
                    <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={onClose} disabled={loading}>Cancel</button>
                    <button className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Adding..." : "Add User"}
                    </button>
                </div>
            </div>
        </div>
    );
}
