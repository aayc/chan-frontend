import React, { useEffect, useState } from 'react';
import { LedgerRepository } from '../../lib/ledger/repository';
import { LocalFileStorageService } from '../../lib/ledger/storage';
import { Budget, BudgetPeriod } from '../../lib/ledger/types';

interface ExpenseGroup {
    name: string;
    spent: number;
    budget: number;
}

export default function Expenses() {
    const [recurringExpenses, setRecurringExpenses] = useState<ExpenseGroup[]>([]);
    const [fixedExpenses, setFixedExpenses] = useState<ExpenseGroup[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadExpenses() {
            try {
                const storage = new LocalFileStorageService();
                const repo = await LedgerRepository.getInstance(storage);
                const currentDate = new Date();

                // Get all budgets and expenses for the current month
                const budgets = await repo.getBudgets();
                const expenses = await repo.getMonthlyExpenses(currentDate);

                // Process recurring (monthly) expenses
                const monthlyBudgets = budgets.filter(b => b.period === BudgetPeriod.Monthly);
                const recurring = monthlyBudgets.map(budget => ({
                    name: budget.formattedCategory,
                    spent: expenses[budget.formattedCategory] || 0,
                    budget: budget.amount
                }));

                // Process fixed (annual) expenses
                const yearlyBudgets = budgets.filter(b => b.period === BudgetPeriod.Yearly);
                const yearlyExpenses = await repo.getCumulativeMonthlyExpenses(currentDate);
                const fixed = yearlyBudgets.map(budget => ({
                    name: budget.formattedCategory,
                    spent: yearlyExpenses[budget.formattedCategory] || 0,
                    budget: budget.amount
                }));

                setRecurringExpenses(recurring);
                setFixedExpenses(fixed);
                setLastUpdated(repo.getLastModified());
                setLoading(false);
            } catch (err) {
                console.error('Error loading expenses:', err);
                setError(err instanceof Error ? err.message : 'Failed to load expenses');
                setLoading(false);
            }
        }

        loadExpenses();
    }, []);

    if (loading) {
        return <div className="p-4">Loading expenses...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">
                    {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h1>
                {lastUpdated && (
                    <div className="text-gray-500">
                        Last updated: {lastUpdated.toLocaleDateString()}
                    </div>
                )}
            </div>

            <section className="mb-8">
                <h2 className="text-xl font-bold mb-4">Recurring Expenses</h2>
                {recurringExpenses.map((expense) => (
                    <div key={expense.name} className="mb-4">
                        <div className="flex justify-between mb-1">
                            <span>{expense.name}</span>
                            <span className={expense.spent > expense.budget ? 'text-red-600' : ''}>
                                ${expense.spent.toFixed(0)} / ${expense.budget}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded">
                            <div
                                className={`h-full rounded ${expense.spent > expense.budget ? 'bg-red-500' : 'bg-blue-500'
                                    }`}
                                style={{
                                    width: `${Math.min((expense.spent / expense.budget) * 100, 100)}%`
                                }}
                            />
                        </div>
                    </div>
                ))}
            </section>

            <section>
                <h2 className="text-xl font-bold mb-4">Fixed Expenses (Annual)</h2>
                {fixedExpenses.map((expense) => (
                    <div key={expense.name} className="mb-4">
                        <div className="flex justify-between mb-1">
                            <span>{expense.name}</span>
                            <span className={expense.spent > expense.budget ? 'text-red-600' : ''}>
                                ${expense.spent.toFixed(0)} / ${expense.budget}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded">
                            <div
                                className={`h-full rounded ${expense.spent > expense.budget ? 'bg-red-500' : 'bg-blue-500'
                                    }`}
                                style={{
                                    width: `${Math.min((expense.spent / expense.budget) * 100, 100)}%`
                                }}
                            />
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
} 