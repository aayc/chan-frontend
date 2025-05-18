import React, { useEffect, useState, useMemo } from 'react';
import { BudgetPeriod, LedgerTransaction } from '../../lib/ledger/types';
import { LedgerParser } from '../../lib/ledger/parser';
import { SelectMenu, SelectOption } from '../shared/Select';

interface ExpenseGroup {
    name: string;
    spent: number;
    budget: number;
    color?: string;
}

const categoryColors: Record<string, string> = {
    'Housing': 'bg-blue-500',
    'Food & Dining': 'bg-green-500',
    'Transportation': 'bg-yellow-500',
    'Entertainment': 'bg-purple-500',
    'Utilities': 'bg-pink-500',
    'Healthcare': 'bg-red-500',
    'Personal Care': 'bg-indigo-500',
    'Default': 'bg-gray-500',
};

const getCategoryColor = (categoryName: string) => {
    return categoryColors[categoryName] || categoryColors['Default'];
}

// Helper function for Title Case
const toTitleCase = (str: string): string => {
    if (!str) return '';
    // A more robust title case for things like "food & dining"
    return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase()).replace(/& (\w)/g, (match, p1) => `& ${p1.toUpperCase()}`);
};

export default function Expenses() {
    const [monthlyBudgetsDisplay, setMonthlyBudgetsDisplay] = useState<ExpenseGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'monthly' | 'categories' | 'trends'>('monthly');

    const [totalBudget, setTotalBudget] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);

    // State for Yearly Expenses & Budgets (dynamic)
    const [yearlyBudgetsDisplay, setYearlyBudgetsDisplay] = useState<ExpenseGroup[]>([]);

    const initialCurrentMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
    const [selectedMonth, setSelectedMonth] = useState<string>(initialCurrentMonth);
    const [allTransactions, setAllTransactions] = useState<LedgerTransaction[]>([]);
    const [allBudgets, setAllBudgets] = useState<any[]>([]); // Using any for now, replace with Budget[] from types

    const uniqueMonthsForDropdown = useMemo(() => {
        if (allTransactions.length === 0) return [];
        const monthsSet = new Set<string>();
        allTransactions.forEach(t => {
            const monthYear = `${t.date.getFullYear()}-${(t.date.getMonth() + 1).toString().padStart(2, '0')}`;
            monthsSet.add(monthYear);
        });
        const sortedMonthKeys = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
        return sortedMonthKeys.map(monthStr => ({
            value: monthStr,
            label: new Date(parseInt(monthStr.split('-')[0]), parseInt(monthStr.split('-')[1]) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        }));
    }, [allTransactions]);

    useEffect(() => {
        async function initialLoad() {
            setLoading(true);
            try {
                const response = await fetch('/src/assets/sample.ledger');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const ledgerContent = await response.text();
                const parser = new LedgerParser();
                setAllTransactions(parser.parse(ledgerContent));
                setAllBudgets(parser.parseBudgets(ledgerContent));
                setError(null);
            } catch (err) {
                console.error('Error loading initial data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load initial data');
            } finally {
                // Initial loading false will be set by the processing effect if allTransactions is populated
            }
        }
        initialLoad();
    }, []);

    useEffect(() => {
        if (allTransactions.length === 0 || allBudgets.length === 0) {
            // Don't process until initial data is loaded
            if (!loading && allTransactions.length > 0 && allBudgets.length > 0) setLoading(false);
            return;
        }
        setLoading(true);

        const [year, month] = selectedMonth.split('-').map(Number);
        const targetDateForExpenses = new Date(year, month - 1);
        const targetYear = targetDateForExpenses.getFullYear();

        const calculateMonthlyExpenses = (targetDate: Date, currentTransactions: LedgerTransaction[]): Record<string, number> => {
            const monthly: Record<string, number> = {};
            for (const transaction of currentTransactions) {
                if (transaction.date.getFullYear() === targetDate.getFullYear() &&
                    transaction.date.getMonth() === targetDate.getMonth()) {
                    for (const posting of transaction.postings) {
                        const expenseAccountMatch = posting.account.match(/(?:[^:]+:)?expenses:([^;]+)/);
                        if (posting.amount && posting.amount > 0 && expenseAccountMatch) {
                            const category = expenseAccountMatch[1];
                            monthly[category] = (monthly[category] || 0) + posting.amount;
                        }
                    }
                }
            }
            return monthly;
        };

        const currentMonthExpenses = calculateMonthlyExpenses(targetDateForExpenses, allTransactions);
        const monthlyBudgetsData = allBudgets.filter(b => b.period === BudgetPeriod.Monthly);

        const recurring = monthlyBudgetsData.map(budget => ({
            name: toTitleCase(budget.formattedCategory),
            spent: currentMonthExpenses[budget.formattedCategory] || 0,
            budget: budget.amount,
            color: getCategoryColor(budget.formattedCategory) // Use original for color mapping
        }));

        setMonthlyBudgetsDisplay(recurring);
        const currentTotalBudget = recurring.reduce((sum, b) => sum + b.budget, 0);
        const currentTotalSpent = recurring.reduce((sum, b) => sum + b.spent, 0);
        setTotalBudget(currentTotalBudget);
        setTotalSpent(currentTotalSpent);

        // Calculate and set dynamic Yearly Budgets and Spent
        const yearlyBudgetsData = allBudgets.filter(b => b.period === BudgetPeriod.Yearly);
        const dynamicYearlyDisplay: ExpenseGroup[] = [];

        for (const budget of yearlyBudgetsData) {
            let yearlySpentForCategory = 0;
            const categoryKey = budget.formattedCategory; // e.g., 'travel', 'insurance', 'car:maintenance'
            // Construct the account prefix to search for, assuming joint expenses for these yearly items
            // This might need to be more flexible if yearly budgets aren't always for 'joint:expenses:'
            const accountToTrack = `joint:expenses:${categoryKey}`;

            for (const transaction of allTransactions) {
                if (transaction.date.getFullYear() === targetYear) {
                    for (const posting of transaction.postings) {
                        if (posting.amount && posting.amount > 0 && posting.account.startsWith(accountToTrack)) {
                            yearlySpentForCategory += posting.amount;
                        }
                    }
                }
            }
            dynamicYearlyDisplay.push({
                name: toTitleCase(categoryKey),
                spent: yearlySpentForCategory,
                budget: budget.amount,
                color: getCategoryColor(categoryKey) // Use original category key for color consistency
            });
        }
        setYearlyBudgetsDisplay(dynamicYearlyDisplay.sort((a, b) => b.budget - a.budget)); // Sort by budget amount, highest to lowest

        setError(null);
        setLoading(false);

    }, [selectedMonth, allTransactions, allBudgets, loading]);

    if (loading && monthlyBudgetsDisplay.length === 0) {
        return <div className="p-6">Loading expenses data...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600">Error: {error}</div>;
    }

    const remainingBudget = totalBudget - totalSpent;
    const budgetUsedPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const SummaryCard: React.FC<{ title: string; amount?: number; text?: string; isPercentage?: boolean; subtext?: string, currency?: string }> = ({ title, amount, text, isPercentage, subtext, currency = '$' }) => (
        <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            </div>
            {amount !== undefined && (
                <div className="mb-4">
                    <p className="flex items-baseline text-3xl font-bold text-gray-800">
                        <span className="text-xl text-gray-600 mr-0.5" style={{ lineHeight: '1' }}>$</span>
                        <span>{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </p>
                </div>
            )}
            {text && !isPercentage && <p className="text-3xl font-bold">{text}</p>}
            {text && isPercentage && (
                <>
                    <p className="text-3xl font-bold">{parseFloat(text).toFixed(1)}%</p>
                    <div className="mt-2 h-2.5 w-full bg-gray-200 rounded-full">
                        <div className="bg-black h-2.5 rounded-full" style={{ width: `${parseFloat(text).toFixed(1)}%` }}></div>
                    </div>
                </>
            )}
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
    );

    const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void; }> = ({ title, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 mr-2 rounded-lg font-medium transition-colors
                        ${isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
        >
            {title}
        </button>
    );

    const targetYearForDisplay = selectedMonth.split('-')[0];

    return (
        <div className="space-y-8">
            <div className="flex justify-end mb-6 h-10 items-center">
                {uniqueMonthsForDropdown.length > 0 && (
                    <SelectMenu
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                        options={uniqueMonthsForDropdown}
                        placeholder="Select Month"
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Total Budget" amount={totalBudget} subtext="Monthly allocation" />
                <SummaryCard title="Total Spent" amount={totalSpent} subtext="This month" />
                <SummaryCard title="Remaining" amount={remainingBudget} subtext="Available to spend" />
                <SummaryCard title="Budget Used" text={`${budgetUsedPercentage.toFixed(1)}`} isPercentage={true} currency="" />
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                    <TabButton title="Monthly Budgets" isActive={activeTab === 'monthly'} onClick={() => setActiveTab('monthly')} />
                    <TabButton title="Categories" isActive={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
                    <TabButton title="Trends" isActive={activeTab === 'trends'} onClick={() => setActiveTab('trends')} />
                </nav>
            </div>

            <div>
                {activeTab === 'monthly' && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <div className="space-y-5">
                            {monthlyBudgetsDisplay.map((expense) => (
                                <div key={expense.name}>
                                    <div className="flex items-center mb-1.5">
                                        <span className={`w-3 h-3 rounded-full mr-3 ${expense.color}`}></span>
                                        <span className="text-sm font-medium text-gray-700 flex-1">{expense.name}</span>
                                        <div className="text-right">
                                            <span className={`text-sm font-medium ${expense.spent > expense.budget ? 'text-red-600' : 'text-gray-700'}`}>
                                                ${expense.spent.toFixed(0)}
                                            </span>
                                            <span className="text-xs text-gray-500"> / ${expense.budget.toFixed(0)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden relative" style={{ marginLeft: '1.75rem' }}>
                                            <div
                                                className={`h-full ${expense.spent > expense.budget ? 'bg-red-500' : 'bg-blue-600'}`}
                                                style={{ width: `${Math.min((expense.spent / expense.budget) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 ml-3 w-10 text-right">
                                            {expense.budget > 0 ? Math.round((expense.spent / expense.budget) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'categories' && <div className="p-4">Categories content will go here.</div>}
                {activeTab === 'trends' && <div className="p-4">Trends content will go here.</div>}
            </div>

            {/* Yearly Expenses Section */}
            <div className="bg-white p-6 rounded-xl shadow mt-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Yearly Budgets ({targetYearForDisplay})</h2>
                <div className="space-y-5">
                    {yearlyBudgetsDisplay.length > 0 ? (
                        yearlyBudgetsDisplay.map((expense) => (
                            <div key={expense.name}>
                                <div className="flex items-center mb-1.5">
                                    <span className={`w-3 h-3 rounded-full mr-3 ${expense.color}`}></span>
                                    <span className="text-sm font-medium text-gray-700 flex-1">{expense.name.replace(':', ' ')}</span>
                                    <div className="text-right">
                                        <span className={`text-sm font-medium ${expense.spent > expense.budget && expense.budget > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                                            ${expense.spent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </span>
                                        {expense.budget > 0 &&
                                            <span className="text-xs text-gray-500"> / ${expense.budget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                        }
                                    </div>
                                </div>
                                {expense.budget > 0 && (
                                    <div className="flex items-center">
                                        <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden relative" style={{ marginLeft: '1.75rem' }}>
                                            <div
                                                className={`h-full ${expense.spent > expense.budget ? 'bg-red-500' : 'bg-blue-600'}`}
                                                style={{ width: `${Math.min((expense.spent / expense.budget) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 ml-3 w-10 text-right">
                                            {Math.round((expense.spent / expense.budget) * 100)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No yearly budgets defined or found for {targetYearForDisplay}.</p>
                    )}
                </div>
            </div>
        </div>
    );
} 