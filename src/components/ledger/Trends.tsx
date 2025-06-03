import React, { useState, useMemo } from 'react';
import { useLedgerData } from '../../hooks/useLedgerData';
import { SelectMenu, SelectOption } from '../shared/Select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TrendsSkeleton from '../skeletons/TrendsSkeleton';
import {
    processIncomeTransactions,
    processExpenseTransactions,
    getBudgetedCategories,
    toTitleCase,
    MonthlyTrendData
} from '../../lib/ledger/calculations';

interface MonthlyDataProcessor {
    (transactions: any[], month: number): Record<string, number>;
}

export default function TrendsPage() {
    const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());
    const { data, isLoading, error } = useLedgerData(selectedYear ? parseInt(selectedYear) : undefined);

    const allTransactions = data?.transactions ?? [];
    const allBudgets = data?.budgets ?? [];

    const yearOptions = useMemo<SelectOption[]>(() => {
        const years = new Set<string>();

        // Add a fixed base range of years
        const baseStartYear = 2020;
        const baseEndYear = 2025;
        for (let i = baseEndYear; i >= baseStartYear; i--) {
            years.add(i.toString());
        }

        // Add years from transactions if available
        if (allTransactions.length > 0) {
            allTransactions.forEach(t => {
                years.add(t.date.getFullYear().toString());
            });
        }

        // Ensure current selectedYear is an option
        if (selectedYear) {
            years.add(selectedYear);
        }

        return Array.from(years)
            .sort((a, b) => b.localeCompare(a)) // Sort descending
            .map(year => ({
                value: year,
                label: year
            }));
    }, [allTransactions, selectedYear]);

    const processedChartData = useMemo(() => {
        if (!selectedYear || allTransactions.length === 0) {
            return { incomeData: [], expenseData: [], incomeKeys: [], expenseKeys: [] };
        }

        const yearNum = parseInt(selectedYear);
        const budgetedCategories = getBudgetedCategories(allBudgets);

        // Filter transactions for the selected year
        const yearTransactions = allTransactions.filter(t =>
            t.date.getFullYear() === yearNum
        );

        // Process income data by month
        const incomeProcessor: MonthlyDataProcessor = (transactions, monthIndex) => {
            const monthTransactions = transactions.filter(t =>
                t.date.getMonth() === monthIndex
            );
            return processIncomeTransactions(monthTransactions, true); // filter joint only
        };

        // Process expense data by month  
        const expenseProcessor: MonthlyDataProcessor = (transactions, monthIndex) => {
            const monthTransactions = transactions.filter(t =>
                t.date.getMonth() === monthIndex
            );
            return processExpenseTransactions(monthTransactions, {
                filterJointOnly: true,
                excludeRent: true,
                budgetedCategoriesOnly: true,
                budgetedCategories
            });
        };

        // Build monthly data for both income and expenses
        const incomeCategories = new Set<string>();
        const expenseCategories = new Set<string>();
        const monthlyDataMap: Record<number, { income: Record<string, number>; expenses: Record<string, number> }> = {};

        // Process each month
        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
            const incomeData = incomeProcessor(yearTransactions, monthIndex);
            const expenseData = expenseProcessor(yearTransactions, monthIndex);

            monthlyDataMap[monthIndex] = { income: incomeData, expenses: expenseData };

            // Collect categories
            Object.keys(incomeData).forEach(cat => incomeCategories.add(cat));
            Object.keys(expenseData).forEach(cat => expenseCategories.add(cat));
        }

        // Helper to get month name
        const getMonthName = (monthNumber: number): string => {
            const date = new Date();
            date.setMonth(monthNumber);
            return date.toLocaleString('en-US', { month: 'short' });
        };

        // Build chart data
        const chartData: MonthlyTrendData[] = [];
        for (let i = 0; i < 12; i++) {
            const monthEntry: MonthlyTrendData = { month: getMonthName(i) };
            const monthData = monthlyDataMap[i] || { income: {}, expenses: {} };

            // Add income data
            incomeCategories.forEach(category => {
                monthEntry[category] = monthData.income[category] || 0;
            });

            // Add expense data
            expenseCategories.forEach(category => {
                monthEntry[category] = monthData.expenses[category] || 0;
            });

            chartData.push(monthEntry);
        }

        const sortedIncomeKeys = Array.from(incomeCategories).sort();
        const sortedExpenseKeys = Array.from(expenseCategories).sort();

        return {
            incomeData: chartData.map(m => {
                const entry: MonthlyTrendData = { month: m.month };
                sortedIncomeKeys.forEach(k => entry[k] = m[k] || 0);
                return entry;
            }),
            expenseData: chartData.map(m => {
                const entry: MonthlyTrendData = { month: m.month };
                sortedExpenseKeys.forEach(k => entry[k] = m[k] || 0);
                return entry;
            }),
            incomeKeys: sortedIncomeKeys,
            expenseKeys: sortedExpenseKeys
        };
    }, [selectedYear, allTransactions, allBudgets]);

    const lineColors = [
        '#1f77b4',  // muted blue
        '#ff7f0e',  // safety orange
        '#2ca02c',  // cooked asparagus green
        '#d62728',  // brick red
        '#9467bd',  // muted purple
        '#8c564b',  // chestnut brown
        '#e377c2',  // raspberry yogurt pink
        '#7f7f7f',  // middle gray
        '#bcbd22',  // curry yellow-green
        '#17becf',  // blue-teal
        '#aec7e8',  // light blue
        '#ffbb78',  // light orange
        '#98df8a',  // light green
        '#ff9896',  // light red
        '#c5b0d5',  // light purple
        '#c49c94',  // light brown
        '#f7b6d2',  // light pink
        '#c7c7c7'   // light gray
    ];

    if (isLoading) {
        return <TrendsSkeleton />;
    }

    if (error) {
        return <div className="p-6 text-red-500">Error loading data: {error.message}</div>;
    }

    const { incomeData, expenseData, incomeKeys, expenseKeys } = processedChartData;

    const renderChart = (title: string, data: MonthlyTrendData[], keys: string[], type: 'Income' | 'Expense') => {
        if (keys.length === 0) {
            return <p className="text-gray-500 mt-4">No {type.toLowerCase()} data available for {selectedYear}.</p>;
        }
        return (
            <div className="mb-12 p-6 bg-white rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">{title} - {selectedYear}</h2>
                <ResponsiveContainer width="100%" height={600}>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        <Legend />
                        {keys.map((key, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                name={toTitleCase(key)}
                                stroke={lineColors[index % lineColors.length]}
                                activeDot={{ r: 8 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div className="space-y-8 w-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Financial Trends</h3>
                {yearOptions.length > 0 && (
                    <div className="w-48">
                        <SelectMenu
                            value={selectedYear}
                            onValueChange={setSelectedYear}
                            options={yearOptions}
                            placeholder="Select Year"
                        />
                    </div>
                )}
            </div>

            {allTransactions.length === 0 && !isLoading && (
                <div className="bg-white p-6 rounded-xl shadow text-center">
                    <p className="text-gray-600">No transaction data available to display trends.</p>
                    {selectedYear && <p className="text-sm text-gray-500 mt-1">Selected year: {selectedYear}</p>}
                </div>
            )}

            {allTransactions.length > 0 && (
                <>
                    {renderChart("Income Over Time", incomeData, incomeKeys, 'Income')}
                    {renderChart("Expenses Over Time", expenseData, expenseKeys, 'Expense')}
                </>
            )}
        </div>
    );
} 