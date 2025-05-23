import { useQuery } from '@tanstack/react-query';
import { LedgerTransaction, Budget } from '../lib/ledger/types';
import { LedgerParser } from '../lib/ledger/parser';
import { ServerStorageService } from '../lib/ledger/storage';
import { createAuthTokenGetter } from '../lib/utils/auth';
import { useAuth } from '../AuthContext';

interface LedgerData {
    transactions: LedgerTransaction[];
    budgets: Budget[];
}

export const useLedgerData = () => {
    const { currentUser } = useAuth();

    return useQuery({
        queryKey: ['ledger-data', currentUser?.uid],
        queryFn: async (): Promise<LedgerData> => {
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const storageService = new ServerStorageService(
                'http://localhost:8000',
                new Date().getFullYear(),
                createAuthTokenGetter(currentUser)
            );

            const ledgerContent = await storageService.fetchLedgerContent();
            const parser = new LedgerParser();

            const transactions = parser.parse(ledgerContent);
            const budgets = parser.parseBudgets(ledgerContent);

            return { transactions, budgets };
        },
        enabled: !!currentUser, // Only run query if user is authenticated
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
        retry: 3, // Retry failed requests 3 times
        refetchOnWindowFocus: true, // Refetch when user returns to tab
        refetchOnMount: 'always', // Always check for fresh data on mount
    });
};

// Convenience hooks for specific data
export const useLedgerTransactions = () => {
    const { data, ...rest } = useLedgerData();
    return {
        transactions: data?.transactions ?? [],
        ...rest
    };
};

export const useLedgerBudgets = () => {
    const { data, ...rest } = useLedgerData();
    return {
        budgets: data?.budgets ?? [],
        ...rest
    };
}; 