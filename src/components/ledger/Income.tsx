import React, { useEffect, useState, useMemo } from 'react';
import { LedgerTransaction } from '../../lib/ledger/types';
import { LedgerParser } from '../../lib/ledger/parser';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IncomeEntry {
    id: string; // Can be date + description hash or similar for uniqueness
    date: string;
    description: string;
    category: string;
    amount: number;
}

interface PieChartDataPoint {
    name: string;
    value: number;
    // color will be assigned dynamically or via a predefined map
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF84E7', '#82ca9d', '#ffc658'];

// Helper function for Title Case (can be moved to a shared utils file)
const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
};

export default function Income() {
    const [allLedgerTransactions, setAllLedgerTransactions] = useState<LedgerTransaction[]>([]);
    const [incomeTableData, setIncomeTableData] = useState<IncomeEntry[]>([]);
    const [pieChartData, setPieChartData] = useState<PieChartDataPoint[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const response = await fetch('/src/assets/sample.ledger');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const ledgerContent = await response.text();
                const parser = new LedgerParser();
                const parsedTransactions = parser.parse(ledgerContent);
                setAllLedgerTransactions(parsedTransactions);
                setError(null);
            } catch (err) {
                console.error('Error loading ledger data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load ledger data');
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (allLedgerTransactions.length === 0 && !error) {
            if (!loading && !error) {
            } else if (loading && allLedgerTransactions.length === 0 && !error) {
                return;
            }
        }

        setLoading(true);

        const processedIncomeEntries: IncomeEntry[] = [];
        const incomeCategories: Record<string, number> = {};

        allLedgerTransactions.forEach((transaction, txIndex) => {
            transaction.postings.forEach((posting, pIndex) => {
                // Income is typically a credit (negative amount in ledger) to an income account
                if (posting.account.startsWith('joint:income:') && posting.amount && posting.amount < 0) {
                    const category = posting.account.split(':')[2] || 'Unknown'; // e.g., joint:income:salary -> salary
                    const amount = Math.abs(posting.amount); // Display as positive

                    processedIncomeEntries.push({
                        id: `${transaction.date.toISOString()}-${txIndex}-${pIndex}`,
                        date: transaction.date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                        description: transaction.description || 'N/A',
                        category: toTitleCase(category),
                        amount: amount,
                    });

                    incomeCategories[category] = (incomeCategories[category] || 0) + amount;
                }
            });
        });

        // Sort table data by date, most recent first
        processedIncomeEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setIncomeTableData(processedIncomeEntries);

        const formattedPieData: PieChartDataPoint[] = Object.entries(incomeCategories)
            .map(([name, value]) => ({ name: toTitleCase(name), value }))
            .sort((a, b) => b.value - a.value); // Sort by value descending

        setPieChartData(formattedPieData);
        setLoading(false);
        setError(null);

    }, [allLedgerTransactions, error]);

    if (loading && incomeTableData.length === 0 && pieChartData.length === 0) {
        return <div className="p-6 text-center">Loading income data...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600 text-center">Error: {error}</div>;
    }

    // Placeholder for Pie Chart rendering
    const renderPieChart = () => (
        <div className="bg-white p-6 rounded-xl shadow mb-8" style={{ height: '450px' }}>
            {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Amount"]} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex justify-center items-center h-full bg-gray-100 rounded-lg">
                    <p className="text-gray-500">No income data available for chart.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            <h3 className="text-3xl font-bold text-gray-800">Income</h3>

            {renderPieChart()}

            <div className="bg-white p-6 rounded-xl shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {incomeTableData.length > 0 ? (
                                incomeTableData.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-right">
                                            ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No income transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 