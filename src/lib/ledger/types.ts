export enum BudgetPeriod {
    Monthly = 'monthly',
    Yearly = 'yearly'
}

export interface LedgerPosting {
    account: string;
    amount: number | null;
    currency: string | null;

    // These will be computed as getters in the parser
    isJointExpense: boolean;
    isJointIncome: boolean;
    category: string;
    subcategory: string;
    owner: string;
}

export interface LedgerTransaction {
    date: Date;
    description: string;
    postings: LedgerPosting[];
    note: string | null;
}

export interface Budget {
    category: string;
    amount: number;
    period: BudgetPeriod;

    // This will be computed as a getter in the parser
    formattedCategory: string;
}

export interface StorageService {
    fetchLedgerContent(): Promise<string>;
    lastModified: Date | null;
} 