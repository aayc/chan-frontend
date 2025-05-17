import { Budget, BudgetPeriod, LedgerPosting, LedgerTransaction } from './types';

export class LedgerParser {
    parse(content: string): LedgerTransaction[] {
        const lines = content.split('\n');
        const transactions: LedgerTransaction[] = [];
        let currentTransaction: Partial<LedgerTransaction> | null = null;
        let currentNote: string | null = null;

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Skip empty lines
            if (!trimmedLine) continue;

            // Handle notes
            if (trimmedLine.startsWith(';')) {
                // If we're in a transaction, this is a note for the transaction
                if (currentTransaction) {
                    currentNote = (currentNote ? currentNote + '\n' : '') + trimmedLine.substring(1).trim();
                }
                continue;
            }

            // Check for transaction header (date and description)
            const dateMatch = trimmedLine.match(/^(\d{4}[/-]\d{2}[/-]\d{2})\s+(.+)$/);
            if (dateMatch) {
                // Save previous transaction if exists
                if (currentTransaction) {
                    transactions.push({
                        ...currentTransaction,
                        note: currentNote,
                    } as LedgerTransaction);
                }

                // Start new transaction
                currentTransaction = {
                    date: new Date(dateMatch[1]),
                    description: dateMatch[2],
                    postings: [],
                    note: null
                };
                currentNote = null;
                continue;
            }

            // Check for posting (indented line with account and amount)
            const postingMatch = trimmedLine.match(/^\s+([^;]+?)(?:\s+([-+]?\d+(?:\.\d+)?)\s*([A-Z]{3})?)?$/);
            if (postingMatch && currentTransaction?.postings !== undefined) {
                const account = postingMatch[1].trim();
                const amount = postingMatch[2] ? parseFloat(postingMatch[2]) : null;
                const currency = postingMatch[3] || null;

                const posting: LedgerPosting = {
                    account,
                    amount,
                    currency,
                    get isJointExpense() {
                        return account.startsWith('joint:expenses:');
                    },
                    get isJointIncome() {
                        return account.startsWith('joint:income:');
                    },
                    get category() {
                        if (!this.isJointExpense && !this.isJointIncome) {
                            return '';
                        }
                        const parts = account.split(':');
                        if (parts.length <= 2) return '';
                        return parts.slice(2).join(':');
                    },
                    get subcategory() {
                        if (!this.isJointExpense) return '';
                        const parts = account.split(':');
                        for (let i = 0; i < parts.length - 2; i++) {
                            if (parts[i] === 'expenses') {
                                return parts.length > i + 2 ? parts[i + 2] : '';
                            }
                        }
                        return '';
                    },
                    get owner() {
                        return account.split(':')[0];
                    }
                };

                currentTransaction.postings.push(posting);
            }
        }

        // Add the last transaction if exists
        if (currentTransaction) {
            transactions.push({
                ...currentTransaction,
                note: currentNote,
            } as LedgerTransaction);
        }

        return transactions;
    }

    parseBudgets(content: string): Budget[] {
        const budgets: Budget[] = [];
        const lines = content.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith(';')) continue;

            // Look for budget comments in the format:
            // ; budget: category: amount (monthly/yearly)
            const budgetMatch = trimmedLine.match(/;\s*budget:\s*([^:]+):\s*(\d+(?:\.\d+)?)\s*(monthly|yearly)/i);
            if (budgetMatch) {
                const category = budgetMatch[1].trim();
                const amount = parseFloat(budgetMatch[2]);
                const period = budgetMatch[3].toLowerCase() === 'yearly' ? BudgetPeriod.Yearly : BudgetPeriod.Monthly;

                const budget: Budget = {
                    category,
                    amount,
                    period,
                    get formattedCategory() {
                        const parts = category.split(':');
                        if (parts.length >= 3 && parts[0] === 'budget' && parts[1] === 'expenses') {
                            return parts.slice(2).join(':');
                        }
                        return category;
                    }
                };

                budgets.push(budget);
            }
        }

        return budgets;
    }
} 