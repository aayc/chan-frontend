import React, { useState, useEffect, useMemo } from 'react';
import { LedgerTransaction } from '../../lib/ledger/types';
import { LedgerParser } from '../../lib/ledger/parser';
import { SelectMenu, SelectOption } from '../shared/Select';
import Popover from '../shared/Popover';
import Tag from '../shared/Tag';

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<string>('date-desc');
    const [visibleCount, setVisibleCount] = useState<number>(100); // Pagination state
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState<boolean>(false); // Popover state
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]); // Filter state
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]); // Filter state

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const uniqueMonths = useMemo(() => {
        if (!Array.isArray(transactions)) return [];
        const months = new Set<string>();
        transactions.forEach(t => {
            if (t && t.date) {
                const monthYear = `${t.date.getFullYear()}-${(t.date.getMonth() + 1).toString().padStart(2, '0')}`;
                months.add(monthYear);
            }
        });
        return Array.from(months).sort((a, b) => b.localeCompare(a));
    }, [transactions]);

    const uniqueAccounts = useMemo(() => {
        if (!Array.isArray(transactions)) return [];
        const accounts = new Set<string>();
        transactions.forEach(t => {
            if (t && Array.isArray(t.postings)) {
                t.postings.forEach(p => {
                    if (p && typeof p.account === 'string') {
                        accounts.add(p.account.split(" ")[0])
                    }
                });
            }
        });
        return Array.from(accounts).sort((a, b) => a.localeCompare(b));
    }, [transactions]);

    const sortedTransactions = [...transactions].sort((a, b) => {
        if (sortOption === 'date-asc') {
            return a.date.getTime() - b.date.getTime();
        }
        return b.date.getTime() - a.date.getTime();
    });

    const filteredTransactions = useMemo(() => {
        if (selectedMonths.length === 0 && selectedAccounts.length === 0) {
            return sortedTransactions;
        }
        return sortedTransactions.filter(transaction => {
            const transactionMonthYear = `${transaction.date.getFullYear()}-${(transaction.date.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthMatch = selectedMonths.length === 0 || selectedMonths.includes(transactionMonthYear);
            const accountMatch = selectedAccounts.length === 0 || transaction.postings.some(p => selectedAccounts.includes(p.account));
            return monthMatch && accountMatch;
        });
    }, [transactions, sortOption, selectedMonths, selectedAccounts, sortedTransactions]);

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
        return <p className="text-center p-4">Loading transactions...</p>;
    }

    if (error) {
        return <p className="text-center p-4 text-red-600">Error loading transactions: {error}</p>;
    }

    if (!transactions || transactions.length === 0) {
        return <p className="text-center p-4">No transactions found.</p>;
    }

    const transactionsToDisplay = filteredTransactions.slice(0, visibleCount);

    const sortOptions: SelectOption[] = [
        { value: 'date-desc', label: 'Date: Newest first' },
        { value: 'date-asc', label: 'Date: Oldest first' },
    ];

    const handleLoadMore = () => {
        setVisibleCount(prevCount => prevCount + 100);
    };

    const handleMonthToggle = (month: string) => {
        setSelectedMonths(prev =>
            prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
        );
    };

    const handleAccountToggle = (account: string) => {
        setSelectedAccounts(prev =>
            prev.includes(account) ? prev.filter(a => a !== account) : [...prev, account]
        );
    };

    const handleClearFilters = () => {
        setSelectedMonths([]);
        setSelectedAccounts([]);
        setVisibleCount(100);
        setIsFilterPopoverOpen(false);
    };

    return (
        <div className="transactions-container p-5">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-semibold">Transactions</h2>
                <div className="flex items-center gap-2.5">
                    <SelectMenu
                        value={sortOption}
                        onValueChange={setSortOption}
                        options={sortOptions}
                        placeholder="Sort by..."
                    />
                    <Popover
                        open={isFilterPopoverOpen}
                        onOpenChange={setIsFilterPopoverOpen}
                        trigger={
                            <button
                                className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer text-sm transition-colors duration-150"
                            >
                                Filters
                            </button>
                        }
                        align="end"
                        sideOffset={10}
                    >
                        <div className="p-2 w-72">
                            <div className="mb-3">
                                <h5 className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">By Month</h5>
                                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                                    {uniqueMonths.map(month => (
                                        <label key={month} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                                                checked={selectedMonths.includes(month)}
                                                onChange={() => handleMonthToggle(month)}
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{month}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <h5 className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">By Account</h5>
                                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                                    {uniqueAccounts.map(account => (
                                        <label key={account} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                                                checked={selectedAccounts.includes(account)}
                                                onChange={() => handleAccountToggle(account)}
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate" title={account}>{account}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={handleClearFilters}
                                    className="w-full px-3 py-2 text-sm text-black bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </Popover>
                </div>
            </div>
            <div className="transactions-list space-y-5">
                {transactionsToDisplay.map((transaction, index) => {
                    const descriptionParts = transaction.description.split("|");
                    const description = descriptionParts.length > 1 ? descriptionParts[1].trim() : transaction.description;
                    const descriptionTag = descriptionParts.length > 1 ? descriptionParts[0].trim() : "";
                    return (
                        <div
                            key={index}
                            className="transaction-card mb-5 p-4 border border-gray-300 rounded-lg shadow-md bg-white"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="mt-0 mb-2.5 text-lg font-medium">
                                    <strong className="font-bold">{formatDate(transaction.date)}</strong> - {description}
                                </h3>
                                {descriptionTag && <Tag label={descriptionTag} />}
                            </div>
                            {transaction.note && (
                                <p className="italic text-gray-600 text-sm mb-2.5">
                                    Note: {transaction.note.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br /></React.Fragment>)}
                                </p>
                            )}
                            <ul className="list-none p-0 m-0">
                                {transaction.postings.map((posting, pIndex) => (
                                    <li
                                        key={pIndex}
                                        className={`flex justify-between py-1.5 ${pIndex < transaction.postings.length - 1 ? 'border-b border-gray-200' : ''}`}
                                    >
                                        <span className="flex-grow pr-2.5">{posting.account}</span>
                                        <span className="whitespace-nowrap text-sm">
                                            {posting.amount !== null ? `${posting.amount.toFixed(2)}` : ''}
                                            {posting.currency && ` ${posting.currency}`}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                })}
            </div>
            {visibleCount < sortedTransactions.length && (
                <div className="text-center mt-5">
                    <button
                        onClick={handleLoadMore}
                        className="text-blue-600 hover:text-blue-800 underline cursor-pointer text-sm"
                    >
                        Load More Transactions
                    </button>
                </div>
            )}
        </div>
    );
};

export default Transactions; 