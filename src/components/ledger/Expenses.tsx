import React, { useEffect, useState } from 'react';
import { BudgetPeriod, LedgerTransaction } from '../../lib/ledger/types';
import { LedgerParser } from '../../lib/ledger/parser';

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

export default function Expenses() {
    const [monthlyBudgetsDisplay, setMonthlyBudgetsDisplay] = useState<ExpenseGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'monthly' | 'categories' | 'trends'>('monthly');

    const [totalBudget, setTotalBudget] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);

    useEffect(() => {
        async function loadDataAndProcessExpenses() {
            setLoading(true);
            try {
                const response = await fetch('/src/assets/sample.ledger');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const ledgerContent = await response.text();
                const parser = new LedgerParser();
                const transactions = parser.parse(ledgerContent);
                const budgets = parser.parseBudgets(ledgerContent);

                const currentDate = new Date();

                const calculateMonthlyExpenses = (targetDate: Date, allTransactions: LedgerTransaction[]): Record<string, number> => {
                    const monthly: Record<string, number> = {};
                    for (const transaction of allTransactions) {
                        if (transaction.date.getFullYear() === targetDate.getFullYear() &&
                            transaction.date.getMonth() === targetDate.getMonth()) {
                            for (const posting of transaction.postings) {
                                if (posting.amount && posting.amount > 0 && posting.account.startsWith('expenses:')) {
                                    const category = posting.account.split(':').slice(1).join(':');
                                    monthly[category] = (monthly[category] || 0) + posting.amount;
                                }
                            }
                        }
                    }
                    return monthly;
                };

                const currentMonthExpenses = calculateMonthlyExpenses(currentDate, transactions);

                const monthlyBudgetsData = budgets.filter(b => b.period === BudgetPeriod.Monthly);
                const recurring = monthlyBudgetsData.map(budget => ({
                    name: budget.formattedCategory,
                    spent: currentMonthExpenses[budget.formattedCategory] || 0,
                    budget: budget.amount,
                    color: getCategoryColor(budget.formattedCategory)
                }));

                setMonthlyBudgetsDisplay(recurring);

                const currentTotalBudget = recurring.reduce((sum, b) => sum + b.budget, 0);
                const currentTotalSpent = recurring.reduce((sum, b) => sum + b.spent, 0);
                setTotalBudget(currentTotalBudget);
                setTotalSpent(currentTotalSpent);

                setError(null);
            } catch (err) {
                console.error('Error loading or processing expenses:', err);
                setError(err instanceof Error ? err.message : 'Failed to load expenses');
                setMonthlyBudgetsDisplay([]);
            } finally {
                setLoading(false);
            }
        }

        loadDataAndProcessExpenses();
    }, []);

    if (loading) {
        return <div className="p-6">Loading expenses data...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600">Error: {error}</div>;
    }

    const remainingBudget = totalBudget - totalSpent;
    const budgetUsedPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const SummaryCard: React.FC<{ title: string; amount?: number; text?: string; isPercentage?: boolean; subtext?: string, currency?: string }> = ({ title, amount, text, isPercentage, subtext, currency = '$' }) => (
        <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                {(amount !== undefined || text !== undefined) && currency && !isPercentage && <span className="text-gray-400 text-lg">{currency}</span>}
            </div>
            {amount !== undefined && <p className="text-3xl font-bold">${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>}
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


    return (
        <div className="space-y-8">
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
                        <h2 className="text-xl font-semibold mb-1 text-gray-800">Monthly Budgets</h2>
                        <p className="text-sm text-gray-500 mb-6">Track your spending against monthly budget allocations.</p>
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
                                                className={`h-full ${expense.spent > expense.budget ? 'bg-red-500' : 'bg-black'}`}
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
        </div>
    );
} 