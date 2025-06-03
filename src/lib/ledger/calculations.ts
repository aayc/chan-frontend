import { LedgerTransaction, Budget, BudgetPeriod } from './types';

// Helper function for Title Case
export const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase()).replace(/& (\w)/g, (match, p1) => `& ${p1.toUpperCase()}`);
};

// Helper to normalize category names (e.g., bundle travel categories)
export const normalizeCategoryName = (category: string): string => {
    const normalized = category.toLowerCase();

    // Bundle all travel-related categories
    if (normalized.startsWith('travel')) {
        return 'travel';
    }

    return normalized;
};

// Calculate income amount from a posting, handling negative amounts, null amounts, and implicit calculation
export const calculateIncomeAmount = (posting: any, transaction: LedgerTransaction): number | null => {
    const { amount } = posting;

    if (amount !== null && amount < 0) {
        // Income amounts are typically negative in double-entry bookkeeping
        return Math.abs(amount);
    } else if (amount === 0 || amount === null) {
        // Calculate implicit amount if it's zero or null
        let sumOfOtherPostings = 0;
        transaction.postings.forEach(otherPosting => {
            if (otherPosting !== posting && otherPosting.amount !== null) {
                sumOfOtherPostings += otherPosting.amount;
            }
        });
        // The income posting balances the sum of others
        if (sumOfOtherPostings !== 0) {
            return Math.abs(sumOfOtherPostings);
        }
    } else if (amount > 0) {
        // Handle positive income amounts as well
        return amount;
    }

    return null;
};

// Filter transactions by month (YYYY-MM format)
export const filterTransactionsByMonth = (
    transactions: LedgerTransaction[],
    selectedMonths: string[]
): LedgerTransaction[] => {
    if (selectedMonths.length === 0) {
        return transactions;
    }

    return transactions.filter(transaction => {
        const transactionMonthYear = `${transaction.date.getFullYear()}-${(transaction.date.getMonth() + 1).toString().padStart(2, '0')}`;
        return selectedMonths.includes(transactionMonthYear);
    });
};

// Process income transactions and aggregate by category
export interface IncomeData {
    [category: string]: number;
}

export const processIncomeTransactions = (
    transactions: LedgerTransaction[],
    filterJointOnly: boolean = true
): IncomeData => {
    const incomeData: IncomeData = {};

    transactions.forEach(transaction => {
        transaction.postings.forEach(posting => {
            const accountMatch = posting.account.match(/(?:joint:)*income:([^;]+)/i);

            if (accountMatch) {
                // Filter by joint accounts if required
                if (filterJointOnly && !posting.account.startsWith('joint:')) {
                    return;
                }

                const incomeAmount = calculateIncomeAmount(posting, transaction);

                if (incomeAmount !== null && incomeAmount > 0) {
                    const category = normalizeCategoryName(accountMatch[1]);
                    incomeData[category] = (incomeData[category] || 0) + incomeAmount;
                }
            }
        });
    });

    return incomeData;
};

// Process expense transactions with filtering and aggregation
export interface ExpenseData {
    [category: string]: number;
}

export interface ExpenseCalculationOptions {
    filterJointOnly?: boolean;
    excludeRent?: boolean;
    budgetedCategoriesOnly?: boolean;
    budgetedCategories?: Set<string>;
}

export const processExpenseTransactions = (
    transactions: LedgerTransaction[],
    options: ExpenseCalculationOptions = {}
): ExpenseData => {
    const {
        filterJointOnly = true,
        excludeRent = true,
        budgetedCategoriesOnly = false,
        budgetedCategories = new Set()
    } = options;

    const expenseData: ExpenseData = {};

    transactions.forEach(transaction => {
        transaction.postings.forEach(posting => {
            const expenseMatch = posting.account.match(/(?:[^:]+:)?expenses:([^;]+)/);

            if (expenseMatch && posting.amount !== null) {
                // Filter by joint accounts if required
                if (filterJointOnly && !posting.account.startsWith('joint:')) {
                    return;
                }

                // Exclude rent if required
                if (excludeRent && posting.account.endsWith(':rent')) {
                    return;
                }

                let category = normalizeCategoryName(expenseMatch[1]);

                // Filter by budgeted categories if required
                if (budgetedCategoriesOnly && !budgetedCategories.has(category)) {
                    return;
                }

                expenseData[category] = (expenseData[category] || 0) + posting.amount;
            }
        });
    });

    return expenseData;
};

// Calculate monthly expenses for a specific target date
export const calculateMonthlyExpenses = (
    targetDate: Date,
    transactions: LedgerTransaction[],
    options: ExpenseCalculationOptions = {}
): ExpenseData => {
    const monthlyTransactions = transactions.filter(transaction =>
        transaction.date.getFullYear() === targetDate.getFullYear() &&
        transaction.date.getMonth() === targetDate.getMonth()
    );

    return processExpenseTransactions(monthlyTransactions, options);
};

// Calculate monthly income for a specific target date
export const calculateMonthlyIncome = (
    targetDate: Date,
    transactions: LedgerTransaction[],
    filterJointOnly: boolean = true
): IncomeData => {
    const monthlyTransactions = transactions.filter(transaction =>
        transaction.date.getFullYear() === targetDate.getFullYear() &&
        transaction.date.getMonth() === targetDate.getMonth()
    );

    return processIncomeTransactions(monthlyTransactions, filterJointOnly);
};

// Get budgeted categories from budgets
export const getBudgetedCategories = (budgets: Budget[]): Set<string> => {
    const budgetedCategories = new Set<string>();

    budgets.forEach(budget => {
        if (budget.period === BudgetPeriod.Yearly || budget.period === BudgetPeriod.Monthly) {
            budgetedCategories.add(normalizeCategoryName(budget.formattedCategory));
        }
    });

    return budgetedCategories;
};

// Aggregate data by monthly periods for trend analysis
export interface MonthlyTrendData {
    month: string; // e.g., "Jan", "Feb"
    [category: string]: number | string;
}

export const aggregateDataByMonth = (
    transactions: LedgerTransaction[],
    year: number,
    dataProcessor: (transactions: LedgerTransaction[], month: number) => Record<string, number>
): { data: MonthlyTrendData[]; categories: string[] } => {
    const monthlyDataMap: Record<number, Record<string, number>> = {};
    const allCategories = new Set<string>();

    // Process each month
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthData = dataProcessor(transactions, monthIndex);
        monthlyDataMap[monthIndex] = monthData;

        // Collect all categories
        Object.keys(monthData).forEach(category => allCategories.add(category));
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
        const monthTotals = monthlyDataMap[i] || {};

        allCategories.forEach(category => {
            monthEntry[category] = monthTotals[category] || 0;
        });

        chartData.push(monthEntry);
    }

    const sortedCategories = Array.from(allCategories).sort();

    return {
        data: chartData,
        categories: sortedCategories
    };
};

// Get unique months from transactions (for filter dropdowns)
export interface MonthOption {
    value: string;
    label: string;
}

export const getUniqueMonthsFromTransactions = (
    transactions: LedgerTransaction[],
    accountFilter?: string
): MonthOption[] => {
    const months = new Set<string>();

    transactions.forEach(transaction => {
        let hasRelevantAccount = !accountFilter;

        // Check if transaction has the relevant account type
        if (accountFilter) {
            for (const posting of transaction.postings) {
                if (posting.account.includes(accountFilter)) {
                    hasRelevantAccount = true;
                    break;
                }
            }
        }

        if (hasRelevantAccount) {
            const monthYear = `${transaction.date.getFullYear()}-${(transaction.date.getMonth() + 1).toString().padStart(2, '0')}`;
            months.add(monthYear);
        }
    });

    return Array.from(months)
        .sort((a, b) => b.localeCompare(a)) // Sort newest first
        .map(monthStr => ({
            value: monthStr,
            label: new Date(
                parseInt(monthStr.split('-')[0]),
                parseInt(monthStr.split('-')[1]) - 1
            ).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        }));
}; 