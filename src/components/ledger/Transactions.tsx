import React, { useState, useEffect } from 'react';
import { LedgerTransaction } from '../../lib/ledger/types';
import { LedgerParser } from '../../lib/ledger/parser';

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/src/assets/sample.ledger');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const ledgerContent = await response.text();
                const parser = new LedgerParser();
                const parsedTransactions = parser.parse(ledgerContent);
                setTransactions(parsedTransactions);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load transactions');
                console.error("Failed to load or parse ledger data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return <p>Loading transactions...</p>;
    }

    if (error) {
        return <p>Error loading transactions: {error}</p>;
    }

    if (!transactions || transactions.length === 0) {
        return <p>No transactions found.</p>;
    }

    return (
        <div className="transactions-list">
            {transactions.map((transaction, index) => (
                <div key={index} className="transaction-item" style={{ marginBottom: '20px', border: '1px solid #eee', padding: '10px' }}>
                    <h3>{transaction.date.toLocaleDateString()} - {transaction.description}</h3>
                    {transaction.note && <p style={{ fontStyle: 'italic', color: '#555' }}>Note: {transaction.note}</p>}
                    <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
                        {transaction.postings.map((posting, pIndex) => (
                            <li key={pIndex} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{posting.account}</span>
                                <span>
                                    {posting.amount !== null ? `${posting.amount.toFixed(2)}` : ''}
                                    {posting.currency && ` ${posting.currency}`}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default Transactions; 