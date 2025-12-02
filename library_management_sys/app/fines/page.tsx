"use client";

import React, { useEffect, useState } from 'react';

type FineDetail = {
  Loan_ID: number;
  ISBN?: string;
  Title?: string;
  Due_date?: string;
  Date_in?: string | null;
  fine_amt: string | number;
  Paid: number;
};

type BorrowerFines = {
  card_id: string;
  borrower: string;
  total_fines: string;
  details: FineDetail[];
};

export default function FinesPage() {
  const [fines, setFines] = useState<BorrowerFines[]>([]);
  const [loading, setLoading] = useState(false);
  const [includePaid, setIncludePaid] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function fetchFines() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/mysql/fines?includePaid=${includePaid ? '1' : '0'}`);
      const json = await res.json();
      if (json.success) {
        setFines(json.data || []);
      } else {
        setMessage(json.error || 'Failed to load fines');
      }
    } catch (err) {
      setMessage(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFines();
  }, [includePaid]);

  async function handleUpdate() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/mysql/fines/update', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setMessage(`Updated fines: inserted=${json.result.inserted} updated=${json.result.updated} skippedPaid=${json.result.skippedPaid}`);
        await fetchFines();
      } else {
        setMessage(json.error || 'Update failed');
      }
    } catch (err) {
      setMessage(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handlePay(cardId: string) {
    if (!confirm(`Mark all fines for card ${cardId} as paid? This is irreversible.`)) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/mysql/fines/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`Paid fines, affected rows: ${json.result.paidCount}`);
        await fetchFines();
      } else {
        setMessage(json.error || 'Payment failed');
      }
    } catch (err) {
      setMessage(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Fines Management</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={handleUpdate} disabled={loading} style={{ marginRight: 8 }}>
          Refresh / Update Fines
        </button>
        <label style={{ marginRight: 8 }}>
          <input type="checkbox" checked={includePaid} onChange={(e) => setIncludePaid(e.target.checked)} /> Include paid
        </label>
        <button onClick={fetchFines} disabled={loading}>Reload</button>
      </div>

      {message && <div style={{ marginBottom: 12, color: 'darkblue' }}>{message}</div>}

      {loading && <div>Loading…</div>}

      {!loading && fines.length === 0 && <div>No fines found.</div>}

      <div>
        {fines.map((b) => (
          <div key={b.card_id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{b.borrower}</strong> — Card: <code>{b.card_id}</code>
                <div>Total: ${b.total_fines}</div>
              </div>
              <div>
                <button onClick={() => handlePay(b.card_id)} disabled={loading || Number(b.total_fines) <= 0}>
                  Pay All Fines
                </button>
              </div>
            </div>

            <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Loan ID</th>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>ISBN</th>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Title</th>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Due</th>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Returned</th>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'right' }}>Fine</th>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Paid</th>
                </tr>
              </thead>
              <tbody>
                {b.details.map((d) => (
                  <tr key={d.Loan_ID}>
                    <td style={{ padding: '6px 4px' }}>{d.Loan_ID}</td>
                    <td style={{ padding: '6px 4px' }}>{d.ISBN}</td>
                    <td style={{ padding: '6px 4px' }}>{d.Title}</td>
                    <td style={{ padding: '6px 4px' }}>{d.Due_date}</td>
                    <td style={{ padding: '6px 4px' }}>{d.Date_in || 'Not returned'}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right' }}>${Number(d.fine_amt).toFixed(2)}</td>
                    <td style={{ padding: '6px 4px' }}>{d.Paid ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
