import React, { useEffect, useState, useMemo } from 'react';
import { BudgetPeriod, LedgerTransaction, Budget } from '../../lib/ledger/types';
import { SelectMenu, SelectOption } from '../shared/Select';
import Popover from '../shared/Popover';
import Transactions from './Transactions';
import { useLedgerData } from '../../hooks/useLedgerData';
import ExpensesSkeleton from '../skeletons/ExpensesSkeleton';
import { calculateMonthlyExpenses, toTitleCase } from '../../lib/ledger/calculations';

interface ExpenseGroup {
    name: string;
    spent: number;
    budget: number;
    color?: string;
    formattedCategory?: string;
}

interface TrendCategory {
    name: string;
    formattedCategory: string;
    percentageChange: number;
    currentSpent: number;
    previousSpent: number;
}

const categoryColors: Record<string, string> = {
    'rent': 'bg-blue-500',
    'dining': 'bg-green-500',
    'groceries': 'bg-yellow-500',
    'commute': 'bg-purple-500',
    'gifts': 'bg-pink-500',
    'travel': 'bg-blue-500',
    'gas': 'bg-indigo-500',
    'insurance': 'bg-orange-500',
    'car:maintenance': 'bg-teal-500',
    'Default': 'bg-gray-500',
};

const getCategoryColor = (categoryName: string) => {
    return categoryColors[categoryName] || categoryColors['Default'];
}

export default function Expenses() {
    const [currentDisplayYear, setCurrentDisplayYear] = useState<string>(''); // "YYYY"

    const { data, isLoading, error } = useLedgerData(currentDisplayYear ? parseInt(currentDisplayYear) : undefined);
    const allTransactions = data?.transactions ?? [];
    const allBudgets = data?.budgets ?? [];

    const [monthlyBudgetsDisplay, setMonthlyBudgetsDisplay] = useState<ExpenseGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [totalBudget, setTotalBudget] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);

    // State for Yearly Expenses & Budgets (dynamic)
    const [yearlyBudgetsDisplay, setYearlyBudgetsDisplay] = useState<ExpenseGroup[]>([]);

    // New state for Top Spend and Trends
    const [topSpendCategories, setTopSpendCategories] = useState<ExpenseGroup[]>([]);
    const [trendCategories, setTrendCategories] = useState<TrendCategory[]>([]);
    const [activePopoverCategory, setActivePopoverCategory] = useState<string | null>(null);
    const [activeYearlyPopoverCategory, setActiveYearlyPopoverCategory] = useState<string | null>(null);

    // selectedMonth is the source of truth for filtering, format "YYYY-MM"
    const [selectedMonth, setSelectedMonth] = useState<string>('');

    const sortedUniqueYearMonths = useMemo(() => {
        if (allTransactions.length === 0) return [];
        const monthsSet = new Set<string>();
        allTransactions.forEach(t => {
            const monthYear = `${t.date.getFullYear()}-${(t.date.getMonth() + 1).toString().padStart(2, '0')}`;
            monthsSet.add(monthYear);
        });
        return Array.from(monthsSet).sort((a, b) => b.localeCompare(a)); // Sorts descending, "2023-12" before "2023-11"
    }, [allTransactions]);

    // Effect to initialize selectedMonth and currentDisplayYear, and keep them in sync.
    useEffect(() => {
        // If selectedMonth is not set, initialize it.
        if (!selectedMonth) {
            if (sortedUniqueYearMonths.length > 0) {
                const latestMonthYear = sortedUniqueYearMonths[0]; // sorted data is descending
                setSelectedMonth(latestMonthYear);
                setCurrentDisplayYear(latestMonthYear.split('-')[0]);
            } else {
                // No transactions to derive from, default to current system month/year
                const today = new Date();
                const year = today.getFullYear().toString();
                const month = (today.getMonth() + 1).toString().padStart(2, '0');
                setSelectedMonth(`${year}-${month}`);
                setCurrentDisplayYear(year);
            }
        } else {
            // selectedMonth is set. Ensure currentDisplayYear matches its year part.
            // This handles syncing currentDisplayYear if selectedMonth was changed by other means
            // or if currentDisplayYear didn't update immediately with selectedMonth.
            const yearFromSelectedMonth = selectedMonth.split('-')[0];
            if (yearFromSelectedMonth !== currentDisplayYear) {
                setCurrentDisplayYear(yearFromSelectedMonth);
            }
            // Optional: Future logic could go here to reset selectedMonth if it becomes truly invalid
            // (e.g., the month-year combo is no longer possible with current filters/data), 
            // but for now, we trust handleYearChange/handleMonthChange and the dropdown options.
        }
    }, [selectedMonth, sortedUniqueYearMonths, currentDisplayYear]); // Dependencies


    const yearOptions = useMemo<SelectOption[]>(() => {
        const years = new Set<string>();

        // Add the fixed range of years
        for (let i = 2025; i >= 2020; i--) {
            years.add(i.toString());
        }

        // Add years from transactions
        sortedUniqueYearMonths.forEach(ym => {
            years.add(ym.split('-')[0]);
        });

        // Ensure currentDisplayYear is an option, especially if it's based on current system time and no transactions yet
        if (currentDisplayYear && currentDisplayYear !== '') {
            years.add(currentDisplayYear);
        }

        // If, after all this, the set is somehow empty (e.g., currentDisplayYear was also empty),
        // add current system year as a last resort. (This is highly defensive and might be unnecessary given fixed years)
        if (years.size === 0) {
            years.add(new Date().getFullYear().toString());
        }

        return Array.from(years)
            .sort((a, b) => b.localeCompare(a)) // Sort descending "2025", "2024", ...
            .map(year => ({
                value: year,
                label: year
            }));
    }, [sortedUniqueYearMonths, currentDisplayYear]);

    const monthOptions = useMemo<SelectOption[]>(() => {
        if (!currentDisplayYear) return [];
        const monthsForSelectedYear = sortedUniqueYearMonths
            .filter(ym => ym.startsWith(currentDisplayYear + '-'))
            .map(ym => {
                const monthNum = parseInt(ym.split('-')[1]);
                return {
                    value: monthNum.toString().padStart(2, '0'), // "01", "02", ... "12"
                    label: new Date(parseInt(currentDisplayYear), monthNum - 1).toLocaleDateString('en-US', { month: 'long' })
                };
            });
        // If no transactions for currentDisplayYear, but we have a currentDisplayYear (e.g. from initial load)
        // provide all months for that year.
        if (monthsForSelectedYear.length === 0 && currentDisplayYear) {
            return Array.from({ length: 12 }, (_, i) => ({
                value: (i + 1).toString().padStart(2, '0'),
                label: new Date(parseInt(currentDisplayYear), i).toLocaleDateString('en-US', { month: 'long' })
            }));
        }
        return monthsForSelectedYear;
    }, [sortedUniqueYearMonths, currentDisplayYear]);


    const handleYearChange = (newYear: string) => {
        // Preserve the current month when changing the year.
        // selectedMonth is "YYYY-MM". currentMonthPadded will be "MM".
        const currentMonthPadded = selectedMonth ? selectedMonth.split('-')[1] : '01'; // Default to January if selectedMonth is somehow not set
        setCurrentDisplayYear(newYear);
        setSelectedMonth(`${newYear}-${currentMonthPadded}`);
    };

    const handleMonthChange = (newMonthPadded: string) => { // newMonthPadded is "01", "02" etc.
        if (currentDisplayYear) {
            setSelectedMonth(`${currentDisplayYear}-${newMonthPadded}`);
        }
    };

    // Derived state for the month dropdown's value, e.g., "01", "12"
    const selectedMonthValueForDropdown = useMemo(() => {
        if (!selectedMonth) return '';
        return selectedMonth.split('-')[1] || '';
    }, [selectedMonth]);

    useEffect(() => {
        if (!selectedMonth) {
            // Not yet initialized, or an invalid state we shouldn't process.
            // Ensure loading is false if we bail here to prevent stuck skeleton.
            // setLoading(false); // Consider if this is needed or if skeleton handles it.
            return;
        }

        // isLoading is from useLedgerData for the currentDisplayYear
        if (isLoading) {
            setLoading(true); // Sync local processing loader with data fetching loader
            return; // Wait for data to finish loading
        }

        // At this point, isLoading is false. Data fetching for currentDisplayYear is complete.
        // setLoading(true) here would mean we are starting client-side processing.
        // The original code set it here, so we maintain that pattern.
        setLoading(true);

        if (!data || (data.transactions.length === 0 && data.budgets.length === 0)) {
            // Data loaded, but it's empty for the selected period.
            setMonthlyBudgetsDisplay([]);
            setYearlyBudgetsDisplay([]);
            setTrendCategories([]);
            setTopSpendCategories([]);
            setTotalBudget(0);
            setTotalSpent(0);
            setLoading(false); // Processing finished (nothing to process)
            return;
        }

        // allTransactions and allBudgets are derived from `data` in the render body.
        // They will be up-to-date here if `data` is.
        const currentAllTransactions = data.transactions;
        const currentAllBudgets = data.budgets;

        const [year, month] = selectedMonth.split('-').map(Number);
        const targetDateForExpenses = new Date(year, month - 1);
        const targetYear = targetDateForExpenses.getFullYear();

        const currentMonthExpenses = calculateMonthlyExpenses(targetDateForExpenses, currentAllTransactions, {
            filterJointOnly: true,
            excludeRent: false, // Don't exclude rent for the main expenses calculation
            budgetedCategoriesOnly: false // Show all categories, not just budgeted ones
        });
        const monthlyBudgetsData = currentAllBudgets.filter(b => b.period === BudgetPeriod.Monthly);

        const recurring = monthlyBudgetsData.map(budget => ({
            name: toTitleCase(budget.formattedCategory),
            spent: currentMonthExpenses[budget.formattedCategory] || 0,
            budget: budget.amount,
            color: getCategoryColor(budget.formattedCategory),
            formattedCategory: budget.formattedCategory
        }));

        setMonthlyBudgetsDisplay(recurring);
        const currentTotalBudget = recurring.reduce((sum, b) => sum + b.budget, 0);
        const currentTotalSpent = recurring.reduce((sum, b) => sum + b.spent, 0);
        setTotalBudget(currentTotalBudget);
        setTotalSpent(currentTotalSpent);

        // Calculate Top Spend (Top 5 by spent amount)
        const sortedBySpend = [...recurring].sort((a, b) => b.spent - a.spent);
        setTopSpendCategories(sortedBySpend.slice(0, 5));

        // Calculate Trends based on average of all previous months
        const averagePreviousMonthsExpenses: Record<string, number> = {};
        const categoryTotalsAcrossPreviousMonths: Record<string, number> = {};
        const previousMonthYearKeys = new Set<string>();
        const firstDayOfSelectedMonth = new Date(year, month - 1, 1); // year, month are from selectedMonth

        for (const transaction of currentAllTransactions) {
            if (transaction.date < firstDayOfSelectedMonth) {
                const transactionMonthYear = `${transaction.date.getFullYear()}-${(transaction.date.getMonth() + 1).toString().padStart(2, '0')}`;
                previousMonthYearKeys.add(transactionMonthYear);

                for (const posting of transaction.postings) {
                    const expenseAccountMatch = posting.account.match(/(?:[^:]+:)?expenses:([^;]+)/);
                    if (posting.amount && posting.amount > 0 && expenseAccountMatch) {
                        const category = expenseAccountMatch[1];
                        categoryTotalsAcrossPreviousMonths[category] = (categoryTotalsAcrossPreviousMonths[category] || 0) + posting.amount;
                    }
                }
            }
        }

        const numberOfUniquePreviousMonths = previousMonthYearKeys.size;

        if (numberOfUniquePreviousMonths > 0) {
            for (const categoryKey in categoryTotalsAcrossPreviousMonths) {
                averagePreviousMonthsExpenses[categoryKey] = categoryTotalsAcrossPreviousMonths[categoryKey] / numberOfUniquePreviousMonths;
            }
        }

        const trends: TrendCategory[] = [];
        const allCategoryKeysForTrends = new Set<string>();
        Object.keys(currentMonthExpenses).forEach(key => allCategoryKeysForTrends.add(key));
        Object.keys(averagePreviousMonthsExpenses).forEach(key => allCategoryKeysForTrends.add(key));

        allCategoryKeysForTrends.forEach(categoryKey => {
            const currentCategoryData = recurring.find(r => r.formattedCategory === categoryKey);
            const currentSpent = currentMonthExpenses[categoryKey] || 0;
            const avgPrevSpent = averagePreviousMonthsExpenses[categoryKey] || 0;
            const categoryName = currentCategoryData?.name || toTitleCase(categoryKey);

            if (avgPrevSpent > 0) {
                const percentageChange = (currentSpent - avgPrevSpent) / avgPrevSpent;
                // Show trend if change is > 20% or if spending dropped to 0 from a positive average
                if (Math.abs(percentageChange) > 0.20 || (currentSpent === 0 && avgPrevSpent > 0)) {
                    trends.push({
                        name: categoryName,
                        formattedCategory: categoryKey,
                        percentageChange: percentageChange,
                        currentSpent: currentSpent,
                        previousSpent: avgPrevSpent, // This field now holds the average of previous months
                    });
                }
            } else if (currentSpent > 0) { // avgPrevSpent is 0 or undefined, but currentSpent > 0
                trends.push({
                    name: categoryName,
                    formattedCategory: categoryKey,
                    percentageChange: Infinity, // Signifies a new or newly significant expense
                    currentSpent: currentSpent,
                    previousSpent: 0,
                });
            }
        });

        // Sort trends: New items (Infinity%) first (by current spend), then by largest absolute percentage change
        setTrendCategories(trends.sort((a, b) => {
            const isAInfinity = a.percentageChange === Infinity;
            const isBInfinity = b.percentageChange === Infinity;

            if (isAInfinity && !isBInfinity) return -1;
            if (!isAInfinity && isBInfinity) return 1;
            if (isAInfinity && isBInfinity) {
                return b.currentSpent - a.currentSpent; // Sort new items by current spend desc
            }
            return Math.abs(b.percentageChange) - Math.abs(a.percentageChange);
        }));

        // Calculate and set dynamic Yearly Budgets and Spent
        const yearlyBudgetsData = currentAllBudgets.filter(b => b.period === BudgetPeriod.Yearly);
        const dynamicYearlyDisplay: ExpenseGroup[] = [];

        for (const budget of yearlyBudgetsData) {
            let yearlySpentForCategory = 0;
            const categoryKey = budget.formattedCategory;
            const accountToTrack = `joint:expenses:${categoryKey}`;

            for (const transaction of currentAllTransactions) {
                if (transaction.date.getFullYear() === targetYear) {
                    for (const posting of transaction.postings) {
                        if (posting.amount !== null && posting.account.startsWith(accountToTrack)) {
                            yearlySpentForCategory += posting.amount;
                        }
                    }
                }
            }
            dynamicYearlyDisplay.push({
                name: toTitleCase(categoryKey),
                spent: yearlySpentForCategory,
                budget: budget.amount,
                color: getCategoryColor(categoryKey),
                formattedCategory: categoryKey // Ensure formattedCategory is populated
            });
        }
        setYearlyBudgetsDisplay(dynamicYearlyDisplay.sort((a, b) => b.budget - a.budget));

        setLoading(false);

    }, [selectedMonth, data, isLoading]); // Updated dependencies

    if (isLoading && monthlyBudgetsDisplay.length === 0) {
        return <ExpensesSkeleton />;
    }

    if (error) {
        return <div className="p-6 text-red-600">Error: {error.message}</div>;
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

    const targetYearForDisplay = selectedMonth.split('-')[0];

    return (
        <div className="space-y-8">
            <div className="flex justify-end mb-6 h-10 items-center space-x-2">
                {yearOptions.length > 0 && (
                    <SelectMenu
                        value={currentDisplayYear}
                        onValueChange={handleYearChange}
                        options={yearOptions}
                        placeholder="Year"
                    />
                )}
                {monthOptions.length > 0 && (
                    <SelectMenu
                        value={selectedMonthValueForDropdown}
                        onValueChange={handleMonthChange}
                        options={monthOptions}
                        placeholder="Month"
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Total Budget" amount={totalBudget} subtext="Monthly allocation" />
                <SummaryCard title="Total Spent" amount={totalSpent} subtext="This month" />
                <SummaryCard title="Remaining" amount={remainingBudget} subtext="Available to spend" />
                <SummaryCard title="Budget Used" text={`${budgetUsedPercentage.toFixed(1)}`} isPercentage={true} currency="" />
            </div>

            {/* New Layout for Monthly, Top Spend, and Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Budgets Card (takes 2 columns on large screens) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800">Monthly Budgets</h2>
                    <div className="space-y-5">
                        {monthlyBudgetsDisplay.map((expense) => (
                            <div key={expense.name}>
                                <div className="flex items-center mb-1.5">
                                    <span className={`w-3 h-3 rounded-full mr-3 ${expense.color}`}></span>
                                    <Popover
                                        className="flex-1 min-w-0"
                                        open={!!expense.formattedCategory && activePopoverCategory === expense.formattedCategory}
                                        onOpenChange={(isOpen) => {
                                            if (isOpen && expense.formattedCategory) {
                                                setActivePopoverCategory(expense.formattedCategory);
                                            } else {
                                                setActivePopoverCategory(null);
                                            }
                                        }}
                                        trigger={
                                            <span className="block w-full text-sm font-medium text-gray-700 cursor-pointer hover:underline truncate">
                                                {expense.name}
                                            </span>
                                        }
                                        align="start"
                                        sideOffset={5}
                                    >
                                        {expense.formattedCategory && (
                                            <div className="" style={{ width: '600px', maxHeight: '400px', overflowY: 'auto' }}>
                                                <Transactions
                                                    initialMonthFilter={selectedMonth}
                                                    initialAccountFilter={`joint:expenses:${expense.formattedCategory}`}
                                                />
                                            </div>
                                        )}
                                    </Popover>
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
                                            className={`h-full ${expense.spent > expense.budget ? 'bg-red-500' : expense.color ? expense.color.replace('bg-', 'bg-') : 'bg-blue-600'}`}
                                            style={{ width: `${expense.budget > 0 ? Math.min((expense.spent / expense.budget) * 100, 100) : 0}%` }}
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

                {/* Right column for stacked cards */}
                <div className="space-y-6">
                    {/* Trends Card */}
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Spending Trends</h2>
                        {trendCategories.length > 0 ? (
                            <ul className="space-y-3">
                                {trendCategories.slice(0, 8).map((trend) => (
                                    <li key={trend.name} className="text-sm">
                                        <div className="flex items-center">
                                            <span className={`w-2.5 h-2.5 rounded-full mr-3 ${getCategoryColor(trend.formattedCategory)}`}></span>
                                            <span className="flex-grow text-gray-700">{trend.name}</span>
                                            <span className={`font-medium ${trend.percentageChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                {trend.percentageChange > 0 ? '+' : ''}{(trend.percentageChange * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 ml-[1.375rem] mt-0.5">
                                            ${trend.previousSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} → ${trend.currentSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No significant spending changes compared to historical averages.</p>
                        )}
                    </div>
                </div>
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
                                    <Popover
                                        className="flex-1 min-w-0"
                                        open={!!expense.formattedCategory && activeYearlyPopoverCategory === expense.formattedCategory}
                                        onOpenChange={(isOpen) => {
                                            if (isOpen && expense.formattedCategory) {
                                                setActiveYearlyPopoverCategory(expense.formattedCategory);
                                            } else {
                                                setActiveYearlyPopoverCategory(null);
                                            }
                                        }}
                                        trigger={
                                            <span className="block w-full text-sm font-medium text-gray-700 cursor-pointer hover:underline truncate">
                                                {expense.name.replace(':', ' ')}
                                            </span>
                                        }
                                        align="start"
                                        sideOffset={5}
                                    >
                                        {expense.formattedCategory && (
                                            <div className="" style={{ width: '600px', maxHeight: '400px', overflowY: 'auto' }}>
                                                <Transactions
                                                    initialAccountFilter={`joint:expenses:${expense.formattedCategory}`}
                                                // No initialMonthFilter, so it shows all transactions for the account
                                                />
                                            </div>
                                        )}
                                    </Popover>
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
                                                className={`h-full ${expense.spent > expense.budget ? 'bg-red-500' : expense.color ? expense.color.replace('bg-', 'bg-') : 'bg-blue-600'}`}
                                                style={{ width: `${expense.budget > 0 ? Math.min((expense.spent / expense.budget) * 100, 100) : 0}%` }}
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