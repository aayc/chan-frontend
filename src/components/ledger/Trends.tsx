import React, { useState, useMemo } from 'react';
import { useLedgerData } from '../../hooks/useLedgerData';
import { MultiSelectMenu, SelectOption } from '../shared/Select';
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
    const [selectedYears, setSelectedYears] = useState<string[]>([new Date().getFullYear().toString()]);
    const [showIncomeTotal, setShowIncomeTotal] = useState<boolean>(false);
    const [showExpenseTotal, setShowExpenseTotal] = useState<boolean>(false);
    const [showCumulative, setShowCumulative] = useState<boolean>(false);

    // For multi-year data, we'll fetch data for the earliest year to get all transactions
    const minYear = selectedYears.length > 0 ? Math.min(...selectedYears.map(y => parseInt(y))) : new Date().getFullYear();
    const { data, isLoading, error } = useLedgerData(minYear);

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

        // Ensure current selectedYears are options
        selectedYears.forEach(year => {
            years.add(year);
        });

        return Array.from(years)
            .sort((a, b) => b.localeCompare(a)) // Sort descending
            .map(year => ({
                value: year,
                label: year
            }));
    }, [allTransactions, selectedYears]);

    // Helper function to apply cumulative calculation
    const applyCumulative = (data: MonthlyTrendData[], keys: string[]): MonthlyTrendData[] => {
        const cumulativeData: MonthlyTrendData[] = [];
        const runningTotals: Record<string, number> = {};

        // Initialize running totals
        keys.forEach(key => {
            runningTotals[key] = 0;
        });

        data.forEach(monthData => {
            const entry: MonthlyTrendData = { month: monthData.month };

            keys.forEach(key => {
                runningTotals[key] += Number(monthData[key]) || 0;
                entry[key] = runningTotals[key];
            });

            cumulativeData.push(entry);
        });

        return cumulativeData;
    };

    const processedChartData = useMemo(() => {
        if (selectedYears.length === 0 || allTransactions.length === 0) {
            return { incomeData: [], expenseData: [], incomeKeys: [], expenseKeys: [] };
        }

        const yearNums = selectedYears.map(y => parseInt(y)).sort((a, b) => a - b); // Sort years ascending
        const budgetedCategories = getBudgetedCategories(allBudgets);

        // Filter transactions for the selected years
        const yearTransactions = allTransactions.filter(t =>
            yearNums.includes(t.date.getFullYear())
        );

        // Process income data by month and year
        const incomeProcessor: MonthlyDataProcessor = (transactions, monthIndex) => {
            const monthTransactions = transactions.filter(t =>
                t.date.getMonth() === monthIndex
            );
            return processIncomeTransactions(monthTransactions, true); // filter joint only
        };

        // Process expense data by month and year
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

        // Build continuous monthly data across selected years
        const incomeCategories = new Set<string>();
        const expenseCategories = new Set<string>();
        const continuousMonthlyData: Record<string, { income: Record<string, number>; expenses: Record<string, number> }> = {};

        // Process each year and month to build continuous data
        yearNums.forEach(year => {
            const yearSpecificTransactions = yearTransactions.filter(t => t.date.getFullYear() === year);

            for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                const incomeData = incomeProcessor(yearSpecificTransactions, monthIndex);
                const expenseData = expenseProcessor(yearSpecificTransactions, monthIndex);

                // Create a unique key for year-month combination
                const monthKey = `${year}-${monthIndex.toString().padStart(2, '0')}`;
                continuousMonthlyData[monthKey] = { income: incomeData, expenses: expenseData };

                // Collect categories for selected years
                Object.keys(incomeData).forEach(cat => incomeCategories.add(cat));
                Object.keys(expenseData).forEach(cat => expenseCategories.add(cat));
            }
        });

        // Calculate averages for income categories across selected years to get top 5
        const incomeAverages: Record<string, number> = {};
        const totalSelectedMonths = yearNums.length * 12;

        Array.from(incomeCategories).forEach(category => {
            let total = 0;
            let monthsWithData = 0;

            yearNums.forEach(year => {
                const yearSpecificTransactions = yearTransactions.filter(t => t.date.getFullYear() === year);

                for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                    const monthTransactions = yearSpecificTransactions.filter(t => t.date.getMonth() === monthIndex);
                    const incomeData = processIncomeTransactions(monthTransactions, true);
                    if (incomeData[category]) {
                        total += incomeData[category];
                        monthsWithData++;
                    }
                }
            });

            // Calculate average for selected time period
            incomeAverages[category] = monthsWithData > 0 ? total / totalSelectedMonths : 0;
        });

        // Get top 5 income categories by average for selected years
        const top5IncomeKeys = Object.entries(incomeAverages)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([category]) => category);

        // Helper to get month-year label
        const getMonthYearLabel = (year: number, monthNumber: number): string => {
            const date = new Date();
            date.setFullYear(year);
            date.setMonth(monthNumber);
            return date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        };

        // Build continuous chart data
        const chartData: MonthlyTrendData[] = [];

        yearNums.forEach(year => {
            for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                const monthKey = `${year}-${monthIndex.toString().padStart(2, '0')}`;
                const monthData = continuousMonthlyData[monthKey] || { income: {}, expenses: {} };

                const monthEntry: MonthlyTrendData = {
                    month: getMonthYearLabel(year, monthIndex)
                };

                // Add income data for top 5 categories only
                top5IncomeKeys.forEach(category => {
                    monthEntry[category] = monthData.income[category] || 0;
                });

                // Add expense data
                expenseCategories.forEach(category => {
                    monthEntry[category] = monthData.expenses[category] || 0;
                });

                chartData.push(monthEntry);
            }
        });

        const sortedExpenseKeys = Array.from(expenseCategories).sort();

        // Build final data with totals
        const incomeDataWithTotals = chartData.map(m => {
            const entry: MonthlyTrendData = { month: m.month };
            let total = 0;

            top5IncomeKeys.forEach(k => {
                const value = Number(m[k]) || 0;
                entry[k] = value;
                total += value;
            });

            entry['Total Income'] = total;
            return entry;
        });

        const expenseDataWithTotals = chartData.map(m => {
            const entry: MonthlyTrendData = { month: m.month };
            let total = 0;

            sortedExpenseKeys.forEach(k => {
                const value = Number(m[k]) || 0;
                entry[k] = value;
                total += value;
            });

            entry['Total Expenses'] = total;
            return entry;
        });

        // Apply cumulative calculation if enabled
        const processedIncomeData = showCumulative ? applyCumulative(incomeDataWithTotals, [...top5IncomeKeys, 'Total Income']) : incomeDataWithTotals;
        const processedExpenseData = showCumulative ? applyCumulative(expenseDataWithTotals, [...sortedExpenseKeys, 'Total Expenses']) : expenseDataWithTotals;

        return {
            incomeData: processedIncomeData,
            expenseData: processedExpenseData,
            incomeKeys: top5IncomeKeys,
            expenseKeys: sortedExpenseKeys
        };
    }, [selectedYears, allTransactions, allBudgets, showCumulative]);

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
            return <p className="text-gray-500 mt-4">No {type.toLowerCase()} data available for selected years.</p>;
        }

        const showTotal = type === 'Income' ? showIncomeTotal : showExpenseTotal;
        const setShowTotal = type === 'Income' ? setShowIncomeTotal : setShowExpenseTotal;

        const totalKey = type === 'Income' ? 'Total Income' : 'Total Expenses';
        const allKeys = showTotal ? [...keys, totalKey] : keys;

        // Create a readable year range for the title
        const yearNums = selectedYears.map(y => parseInt(y)).sort((a, b) => a - b);
        const yearsText = yearNums.length === 1
            ? yearNums[0].toString()
            : `${yearNums[0]} - ${yearNums[yearNums.length - 1]}`;

        // Add cumulative indicator to title
        const titleSuffix = showCumulative ? ' (Cumulative)' : '';
        const fullTitle = `${title}${titleSuffix} - ${yearsText}`;

        return (
            <div className="mb-12 p-6 bg-white rounded-xl shadow">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">{fullTitle}</h2>
                    <div className="flex items-center space-x-4">
                        {type === 'Income' && (
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showCumulative}
                                    onChange={(e) => setShowCumulative(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm font-medium text-gray-700">Cumulative</span>
                            </label>
                        )}
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showTotal}
                                onChange={(e) => setShowTotal(e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm font-medium text-gray-700">Show {totalKey}</span>
                        </label>
                    </div>
                </div>
                {type === 'Income' && (
                    <p className="text-sm text-gray-500 mb-4">Showing top 5 income categories by average</p>
                )}
                <ResponsiveContainer width="100%" height={600}>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={selectedYears.length > 1 ? 2 : 0}
                        />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        <Legend />
                        {allKeys.map((key, index) => {
                            const isTotal = key === totalKey;
                            return (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    name={toTitleCase(key)}
                                    stroke={isTotal ? '#000000' : lineColors[index % lineColors.length]}
                                    strokeWidth={isTotal ? 3 : 2}
                                    strokeDasharray={isTotal ? "5 5" : undefined}
                                    activeDot={{ r: 8 }}
                                />
                            );
                        })}
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
                    <div className="w-64">
                        <MultiSelectMenu
                            values={selectedYears}
                            onValuesChange={setSelectedYears}
                            options={yearOptions}
                            placeholder="Select Years"
                        />
                    </div>
                )}
            </div>

            {allTransactions.length === 0 && !isLoading && (
                <div className="bg-white p-6 rounded-xl shadow text-center">
                    <p className="text-gray-600">No transaction data available to display trends.</p>
                    {selectedYears.length > 0 && <p className="text-sm text-gray-500 mt-1">Selected years: {selectedYears.join(', ')}</p>}
                </div>
            )}

            {allTransactions.length > 0 && selectedYears.length > 0 && (
                <>
                    {renderChart("Income Over Time", incomeData, incomeKeys, 'Income')}
                    {renderChart("Expenses Over Time", expenseData, expenseKeys, 'Expense')}
                </>
            )}
        </div>
    );
} 