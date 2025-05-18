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
            const postingMatch = trimmedLine.match(/^([^;]+?)(?:\s+([$])?\s*([-+]?\d{1,3}(?:,\d{3})*(?:\.\d+)?|[-+]?\d*(?:\.\d+)?)?)?$/);
            if (postingMatch && currentTransaction?.postings !== undefined) {
                const account = postingMatch[1].trim();
                const dollarSymbol = postingMatch[2]; // Matched '$' symbol or undefined
                let amountString = postingMatch[3]; // Amount as string or undefined

                if (amountString) {
                    amountString = amountString.replace(/,/g, ''); // Remove commas before parsing
                }

                const amount = amountString ? parseFloat(amountString) : null;
                // Prioritize dollar symbol, then null
                const currency = dollarSymbol ? dollarSymbol : null;

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
        let currentPeriod: BudgetPeriod | null = null;

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('~ Monthly')) {
                currentPeriod = BudgetPeriod.Monthly;
                continue;
            } else if (trimmedLine.startsWith('~ Yearly')) {
                currentPeriod = BudgetPeriod.Yearly;
                continue;
            }

            if (currentPeriod && !trimmedLine.startsWith('~')) {
                // Budget line: budget:expenses:dining               $200.00
                const budgetMatch = trimmedLine.match(/^([^$]+)\$([\d,]+\.?\d*)$/);

                if (budgetMatch) {
                    const category = budgetMatch[1].trim();
                    const amountString = budgetMatch[2].replace(/,/g, ''); // Remove commas for parsing
                    const amount = parseFloat(amountString);

                    if (!isNaN(amount)) {
                        const budget: Budget = {
                            category,
                            amount,
                            period: currentPeriod,
                            get formattedCategory() {
                                const parts = category.split(':');
                                // Assuming format like budget:expenses:category or budget:income:category
                                if (parts.length >= 3 && parts[0] === 'budget' && (parts[1] === 'expenses' || parts[1] === 'income')) {
                                    return parts.slice(2).join(':');
                                }
                                return category;
                            }
                        };
                        budgets.push(budget);
                    }
                } else if (trimmedLine.toLowerCase() === 'budget:monthly' || trimmedLine.toLowerCase() === 'budget:yearly') {
                    // This line indicates the end of a budget period definition in the new format
                    // but might also be a way to clear currentPeriod if not inside a section.
                    // For now, we can just continue as the period is already set by ~ Monthly/Yearly
                    continue;
                }
            }
        }
        return budgets;
    }
} 