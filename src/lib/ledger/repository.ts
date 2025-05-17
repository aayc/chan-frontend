import { Budget, BudgetPeriod, LedgerTransaction, StorageService } from './types';
import { LedgerParser } from './parser';

export class LedgerRepository {
    private static instance: LedgerRepository | null = null;
    private cachedTransactions: LedgerTransaction[] | null = null;
    private cachedBudgets: Budget[] | null = null;

    private constructor(
        private readonly storageService: StorageService,
        private readonly parser: LedgerParser = new LedgerParser()
    ) { }

    static async getInstance(storageService: StorageService): Promise<LedgerRepository> {
        if (!this.instance) {
            this.instance = new LedgerRepository(storageService);
            // Pre-fetch transactions and budgets
            await this.instance.getTransactions();
            await this.instance.getBudgets();
        }
        return this.instance;
    }

    static clearInstance(): void {
        this.instance = null;
    }

    async getTransactions(forceRefresh = false): Promise<LedgerTransaction[]> {
        if (this.cachedTransactions && !forceRefresh) {
            return this.cachedTransactions;
        }

        const content = await this.storageService.fetchLedgerContent();
        this.cachedTransactions = this.parser.parse(content);
        return this.cachedTransactions;
    }

    getLastModified(): Date | null {
        return this.storageService.lastModified;
    }

    async getBudgets(forceRefresh = false): Promise<Budget[]> {
        if (this.cachedBudgets && !forceRefresh) {
            return this.cachedBudgets;
        }

        const content = await this.storageService.fetchLedgerContent();
        this.cachedBudgets = this.parser.parseBudgets(content);
        return this.cachedBudgets;
    }

    async getBudgetForCategory(category: string, isYearly = false): Promise<number> {
        const budgets = await this.getBudgets();
        const period = isYearly ? BudgetPeriod.Yearly : BudgetPeriod.Monthly;

        // Try exact match first
        for (const budget of budgets) {
            if (budget.formattedCategory === category && budget.period === period) {
                return budget.amount;
            }
        }

        // Try matching the last part of the category
        const simplifiedCategory = category.split(':').pop() || '';
        for (const budget of budgets) {
            const budgetSimplified = budget.formattedCategory.split(':').pop() || '';
            if (budgetSimplified === simplifiedCategory && budget.period === period) {
                return budget.amount;
            }
        }

        return 0.0; // Default fallback budget
    }

    async getMonthlyExpenses(month: Date): Promise<Record<string, number>> {
        const transactions = await this.getTransactions();
        const expenses: Record<string, number> = {};

        for (const transaction of transactions) {
            if (transaction.date.getFullYear() === month.getFullYear() &&
                transaction.date.getMonth() === month.getMonth()) {
                for (const posting of transaction.postings) {
                    let amount: number;
                    if (posting.amount !== null) {
                        amount = posting.amount;
                    } else {
                        amount = 0;
                        for (const otherPosting of transaction.postings) {
                            if (otherPosting !== posting && otherPosting.amount !== null) {
                                amount = -otherPosting.amount;
                                break;
                            }
                        }
                    }

                    if (posting.isJointExpense && amount !== 0) {
                        const category = posting.category;
                        if (category) {
                            const categories = category.split(':');
                            for (let i = 0; i < categories.length; i++) {
                                const categoryPath = categories.slice(0, i + 1).join(':');
                                expenses[categoryPath] = (expenses[categoryPath] || 0) + amount;
                            }
                        }
                    }
                }
            }
        }

        return expenses;
    }

    async getCumulativeMonthlyExpenses(month: Date): Promise<Record<string, number>> {
        const transactions = await this.getTransactions();
        const expenses: Record<string, number> = {};

        for (const transaction of transactions) {
            if (transaction.date < new Date(month.getFullYear(), month.getMonth() + 1, 1) &&
                transaction.date.getFullYear() === month.getFullYear()) {
                for (const posting of transaction.postings) {
                    let amount: number;
                    if (posting.amount !== null) {
                        amount = posting.amount;
                    } else {
                        amount = 0;
                        for (const otherPosting of transaction.postings) {
                            if (otherPosting !== posting && otherPosting.amount !== null) {
                                amount = -otherPosting.amount;
                                break;
                            }
                        }
                    }

                    if (posting.isJointExpense && amount !== 0) {
                        const category = posting.category;
                        if (category) {
                            const categories = category.split(':');
                            for (let i = 0; i < categories.length; i++) {
                                const categoryPath = categories.slice(0, i + 1).join(':');
                                expenses[categoryPath] = (expenses[categoryPath] || 0) + amount;
                            }
                        }
                    }
                }
            }
        }

        return expenses;
    }

    async getMonthlyIncome(month: Date): Promise<Record<string, number>> {
        const transactions = await this.getTransactions();
        const income: Record<string, number> = {};

        for (const transaction of transactions) {
            if (transaction.date.getFullYear() === month.getFullYear() &&
                transaction.date.getMonth() === month.getMonth()) {
                for (const posting of transaction.postings) {
                    if (posting.isJointIncome) {
                        const category = posting.category;
                        let amount: number;

                        if (posting.amount !== null) {
                            amount = posting.amount;
                        } else {
                            amount = 0;
                            for (const otherPosting of transaction.postings) {
                                if (otherPosting !== posting && otherPosting.amount !== null) {
                                    amount = -otherPosting.amount;
                                    break;
                                }
                            }
                        }

                        // Make income positive by multiplying negative ledger values by -1
                        amount *= -1;

                        if (amount !== 0 && category) {
                            income[category] = (income[category] || 0) + amount;
                        }
                    }
                }
            }
        }

        return income;
    }

    async getMonthlyTransactions(month: Date): Promise<LedgerTransaction[]> {
        const transactions = await this.getTransactions();
        return transactions
            .filter(transaction =>
                transaction.date.getFullYear() === month.getFullYear() &&
                transaction.date.getMonth() === month.getMonth()
            )
            .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
    }
} 