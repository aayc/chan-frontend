import { useEffect, useState, useMemo } from 'react';
import Popover from '../shared/Popover';
import { useLedgerTransactions } from '../../hooks/useLedgerData';
import IncomeSkeleton from '../skeletons/IncomeSkeleton';

interface IncomeEntry {
    id: string; // Can be date + description hash or similar for uniqueness
    date: string;
    description: string;
    category: string;
    amount: number;
}

interface IncomeCategory {
    name: string;
    value: number;
}

// Helper function for Title Case (can be moved to a shared utils file)
const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
};

// Custom label renderer for the Pie chart
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, name } = props;

    // Hide label for very small slices
    if (percent < 0.02) {
        return null;
    }

    // Calculate positions for line and text
    const lineStartX = cx + (outerRadius + 3) * Math.cos(-midAngle * RADIAN); // Start line slightly outside the slice
    const lineStartY = cy + (outerRadius + 3) * Math.sin(-midAngle * RADIAN);
    const lineEndX = cx + (outerRadius + 18) * Math.cos(-midAngle * RADIAN);   // End line further out
    const lineEndY = cy + (outerRadius + 18) * Math.sin(-midAngle * RADIAN);
    const textX = cx + (outerRadius + 23) * Math.cos(-midAngle * RADIAN);    // Position text after the line end
    const textY = cy + (outerRadius + 23) * Math.sin(-midAngle * RADIAN);

    return (
        <>
            <path d={`M${lineStartX},${lineStartY}L${lineEndX},${lineEndY}`} stroke="#888" fill="none" strokeWidth={1} />
            <text
                x={textX}
                y={textY}
                fill="#333"
                textAnchor={textX > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize="12px"
            >
                {`${name} (${(percent * 100).toFixed(0)}%)`}
            </text>
        </>
    );
};

export default function Income() {
    const { transactions: allLedgerTransactions, isLoading, error } = useLedgerTransactions();

    const [incomeTableData, setIncomeTableData] = useState<IncomeEntry[]>([]);
    const [incomeCategoryData, setIncomeCategoryData] = useState<IncomeCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // State for filters
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState<boolean>(false);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

    const uniqueMonthsForFilter = useMemo(() => {
        if (allLedgerTransactions.length === 0) return [];
        const months = new Set<string>();
        allLedgerTransactions.forEach(t => {
            // Iterate through postings to find joint:income to ensure month is relevant to income
            let hasIncomeInMonth = false;
            for (const p of t.postings) {
                if (p.account.startsWith('joint:income:')) {
                    hasIncomeInMonth = true;
                    break;
                }
            }
            if (hasIncomeInMonth) {
                const monthYear = `${t.date.getFullYear()}-${(t.date.getMonth() + 1).toString().padStart(2, '0')}`;
                months.add(monthYear);
            }
        });
        return Array.from(months).sort((a, b) => b.localeCompare(a)) // Sort newest first
            .map(monthStr => ({
                value: monthStr,
                label: new Date(parseInt(monthStr.split('-')[0]), parseInt(monthStr.split('-')[1]) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
            }));
    }, [allLedgerTransactions]);

    const handleMonthToggle = (month: string) => {
        setSelectedMonths(prev =>
            prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
        );
    };

    const handleClearFilters = () => {
        setSelectedMonths([]);
        setIsFilterPopoverOpen(false);
    };

    useEffect(() => {
        if (allLedgerTransactions.length === 0 && !error) {
            if (!isLoading && !error) {
            } else if (isLoading && allLedgerTransactions.length === 0 && !error) {
                return;
            }
        }

        setLoading(true);

        // Filter transactions by selected months first
        const monthFilteredTransactions = selectedMonths.length === 0
            ? allLedgerTransactions
            : allLedgerTransactions.filter(transaction => {
                const transactionMonthYear = `${transaction.date.getFullYear()}-${(transaction.date.getMonth() + 1).toString().padStart(2, '0')}`;
                return selectedMonths.includes(transactionMonthYear);
            });

        const processedIncomeEntries: IncomeEntry[] = [];
        const incomeCategories: Record<string, number> = {};

        monthFilteredTransactions.forEach((transaction, txIndex) => {
            transaction.postings.forEach((posting, pIndex) => {
                if (posting.account.startsWith('joint:income:')) {
                    let incomeAmount: number | null = null;

                    if (posting.amount && posting.amount < 0) {
                        incomeAmount = Math.abs(posting.amount);
                    } else if (posting.amount === null || posting.amount === 0) {
                        // Calculate implicit amount if it's null or zero
                        let sumOfOtherPostings = 0;
                        transaction.postings.forEach(otherPosting => {
                            if (otherPosting !== posting && otherPosting.amount !== null) {
                                sumOfOtherPostings += otherPosting.amount;
                            }
                        });
                        // The income posting balances the sum of others.
                        // If others sum to X, income is -X. We need the absolute value.
                        if (sumOfOtherPostings !== 0) { // ensure there are other amounts to balance against
                            incomeAmount = Math.abs(sumOfOtherPostings);
                        }
                    }

                    if (incomeAmount !== null && incomeAmount > 0) {
                        const category = posting.account.split(':')[2] || 'Unknown';
                        processedIncomeEntries.push({
                            id: `${transaction.date.toISOString()}-${txIndex}-${pIndex}`,
                            date: transaction.date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                            description: transaction.description || 'N/A',
                            category: toTitleCase(category),
                            amount: incomeAmount,
                        });
                        incomeCategories[category] = (incomeCategories[category] || 0) + incomeAmount;
                    }
                }
            });
        });

        // Sort table data by date, most recent first
        processedIncomeEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setIncomeTableData(processedIncomeEntries);

        const sortedCategories = Object.entries(incomeCategories)
            .map(([name, value]) => ({ name: toTitleCase(name), value }))
            .sort((a, b) => b.value - a.value);

        let finalPieData: IncomeCategory[];
        if (sortedCategories.length > 5) {
            const top5 = sortedCategories.slice(0, 5);
            const otherValue = sortedCategories.slice(5).reduce((acc, curr) => acc + curr.value, 0);
            finalPieData = [...top5, { name: 'Other', value: otherValue }];
        } else {
            finalPieData = sortedCategories;
        }

        setIncomeCategoryData(finalPieData);
        setLoading(false);

    }, [allLedgerTransactions, error, selectedMonths]);

    if ((isLoading || loading) && incomeTableData.length === 0 && incomeCategoryData.length === 0) {
        return <IncomeSkeleton />;
    }

    if (error) {
        return <div className="p-6 text-red-600 text-center">Error: {error.message}</div>;
    }

    // Placeholder for Pie Chart rendering
    const renderPieChart = () => (
        <div className="bg-white p-6 rounded-xl shadow mb-8">
            <h4 className="text-xl font-semibold text-gray-700 mb-4">Income Sources Summary</h4>
            {incomeCategoryData.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {incomeCategoryData.map((category) => (
                                <tr key={category.name}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-right">
                                        ${category.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex justify-center items-center h-32 bg-gray-100 rounded-lg">
                    <p className="text-gray-500">No income category data available.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-3xl font-bold text-gray-800">Income Breakdown</h3>
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
                    <div className="w-72">
                        <div className="mb-4">
                            <h5 className="text-sm font-medium mb-2 text-gray-700">Filter by Month</h5>
                            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                                {uniqueMonthsForFilter.map(month => (
                                    <label key={month.value} className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-gray-100">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            checked={selectedMonths.includes(month.value)}
                                            onChange={() => handleMonthToggle(month.value)}
                                        />
                                        <span className="text-sm text-gray-600">{month.label}</span>
                                    </label>
                                ))}
                                {uniqueMonthsForFilter.length === 0 && (
                                    <p className="text-xs text-gray-400 p-1.5">No months with income data found.</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <button
                                onClick={handleClearFilters}
                                className="w-full px-3 py-2 text-sm font-medium text-black bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </Popover>
            </div>

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