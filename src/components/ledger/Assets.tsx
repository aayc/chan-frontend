import React, { useEffect, useState, useMemo } from 'react';
import { LedgerTransaction } from '../../lib/ledger/types';
import { LedgerParser } from '../../lib/ledger/parser';
import { ServerStorageService } from '../../lib/ledger/storage';
import { useAuth } from '../../AuthContext';
import { createAuthTokenGetter } from '../../lib/utils/auth';
import { useLedgerTransactions } from '../../hooks/useLedgerData';
import AssetsSkeleton from '../skeletons/AssetsSkeleton';
// Placeholder for a potential shared SummaryCard, or we can define one locally
// import { SummaryCard } from '../shared/SummaryCard'; 

// Define types for structured asset data
interface Asset {
    accountName: string; // e.g., "Ally Savings", "Vanguard VTSAX"
    fullAccountPath: string; // e.g., "assets:savings:ally"
    balance: number;
    lastUpdated: string; // Date of the last transaction affecting this asset
}

interface CategorizedAssets {
    [category: string]: Asset[];
}

interface AssetsProps {
    transactionsData?: LedgerTransaction[];
}

const ASSET_CATEGORIES_CONFIG: { [key: string]: { title: string; keywords: string[] } } = {
    SAVINGS: { title: 'Bank & Cash Savings', keywords: ['assets:bank', 'assets:savings', 'assets:liquid', 'assets:cash'] },
    INVESTMENTS: { title: 'Investment Accounts', keywords: ['assets:investments', 'assets:brokerage', 'assets:stocks', 'assets:crypto', 'assets:retirement'] },
    BONDS: { title: 'Bonds', keywords: ['assets:bonds', 'assets:fixed:bonds', 'assets:treasury'] },
    POSSESSIONS: { title: 'Possessions', keywords: ['assets:realestate', 'assets:home', 'assets:car', 'assets:vehicle', 'assets:valuables'] },
};

// Helper to get a human-friendly name from an account path
const formatAccountName = (accountPath: string): string => {
    const parts = accountPath.split(':');
    let namePart = parts.length > 1 ? parts.slice(-2).join(' ') : parts.slice(-1)[0];
    if (parts.length > 2 && (parts.slice(-2)[0].length < 4 || parts.slice(-2)[0] === 'bank')) {
        namePart = parts.slice(-3).join(' ');
    }
    namePart = namePart.replace(/_/g, ' ');
    // Using direct regex literals as in Expenses.tsx for toTitleCase
    return namePart.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase()).replace(/& (\w)/g, (match, p1) => `& ${p1.toUpperCase()}`);
};

// Helper function to find common prefix for display
const getDisplayPrefixToRemove = (names: string[]): string => {
    if (!names || names.length < 2) {
        return "";
    }

    let commonChars = names[0];
    for (let i = 1; i < names.length; i++) {
        while (names[i].indexOf(commonChars) !== 0) {
            commonChars = commonChars.substring(0, commonChars.length - 1);
            if (commonChars === "") return "";
        }
    }

    if (commonChars === "" || commonChars.trim().length < 3) return ""; // Too short or only whitespace

    let isFullWordPrefixForAll = true;
    for (const name of names) {
        if (name.length > commonChars.length) {
            if (name.charAt(commonChars.length) !== ' ') {
                isFullWordPrefixForAll = false;
                break;
            }
        }
    }

    if (isFullWordPrefixForAll) {
        if (commonChars.charAt(commonChars.length - 1) !== ' ') {
            let canAddSpace = true;
            for (const name of names) {
                if (name !== commonChars && !name.startsWith(commonChars + " ")) {
                    canAddSpace = false;
                    break;
                }
            }
            if (canAddSpace && names.some(name => name.startsWith(commonChars + " "))) {
                return commonChars + " ";
            } else if (names.every(name => name === commonChars)) {
                const lastSpace = commonChars.lastIndexOf(' ');
                if (lastSpace > 0) {
                    const p = commonChars.substring(0, lastSpace + 1);
                    if (p.trim().length >= 3) return p;
                }
                return "";
            }
            if (commonChars.charAt(commonChars.length - 1) === ' ' && commonChars.trim().length >= 3) return commonChars;
            return "";
        } else {
            if (commonChars.trim().length >= 3) return commonChars;
            return "";
        }
    } else {
        const lastSpace = commonChars.lastIndexOf(' ');
        if (lastSpace >= 0) { // Allow prefix like "US " where lastSpace is 2 (index)
            const s = commonChars.substring(0, lastSpace + 1);
            if (s.trim().length >= 2) return s; // Adjusted for prefixes like "US "
        }
    }
    return "";
};

// Placeholder AssetCard component
const AssetCard: React.FC<{ asset: Asset }> = ({ asset }) => (
    <div className="bg-white p-4 rounded-lg shadow-md h-36 flex flex-col justify-between w-full">
        <div>
            <h4 className="text-sm font-semibold text-gray-700 truncate" title={asset.accountName}>{asset.accountName}</h4>
        </div>
        <div>
            <p className="text-xl font-bold text-gray-900">
                ${asset.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {asset.lastUpdated && asset.lastUpdated !== 'N/A' && (
                <p className="text-xs text-gray-500 mt-1">
                    Last updated: {new Date(asset.lastUpdated).toLocaleDateString()}
                </p>
            )}
        </div>
    </div>
);

// Placeholder AssetCarousel component
const AssetCarousel: React.FC<{ title: string; assets: Asset[] }> = ({ title, assets }) => {
    if (assets.length === 0) {
        return null; // Don't render if no assets for this category
    }
    return (
        <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {assets.map(asset => (
                    <AssetCard key={asset.fullAccountPath} asset={asset} />
                ))}
            </div>
        </div>
    );
};

// Local SummaryCard for this component
const SummaryCard: React.FC<{ title: string; amount: number; subtext?: string; }> = ({ title, amount, subtext }) => (
    <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-800">
            ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
);

export default function Assets() {
    const { transactions, isLoading, error } = useLedgerTransactions();
    const { currentUser } = useAuth();
    const [categorizedAssets, setCategorizedAssets] = useState<CategorizedAssets>({});
    const [totalAssets, setTotalAssets] = useState<number>(0);
    const [yearToDateChange, setYearToDateChange] = useState<number | null>(null);
    const [projectedEoyAssets, setProjectedEoyAssets] = useState<number | null>(null);
    const [displayCurrentYear, setDisplayCurrentYear] = useState<number | null>(null);
    const [baselineDateForChanges, setBaselineDateForChanges] = useState<string | null>(null);

    const processTransactionsForAssets = (transactions: LedgerTransaction[]) => {
        if (transactions.length === 0) {
            setTotalAssets(0);
            setCategorizedAssets({});
            setYearToDateChange(null);
            setProjectedEoyAssets(null);
            setDisplayCurrentYear(new Date().getFullYear());
            setBaselineDateForChanges(null);
            return;
        }

        // Determine latest transaction date and current calendar year
        let latestTransactionDateOverall = new Date(transactions[0].date);
        transactions.forEach(t => {
            const d = new Date(t.date);
            if (d > latestTransactionDateOverall) latestTransactionDateOverall = d;
        });
        const currentCalendarYear = latestTransactionDateOverall.getFullYear();
        setDisplayCurrentYear(currentCalendarYear);

        // Find "Opening Balances" transaction and calculate balances at that point
        let openingBalancesTransactionDate: Date | null = null;
        const balancesAtOpening: Record<string, number> = {};
        let valueAtBaseline = 0;
        let openingBalancesFound = false;

        // Sort transactions by date to ensure correct accumulation for opening balances
        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (const t of sortedTransactions) {
            const transactionDate = new Date(t.date);
            t.postings.forEach(p => {
                if ((p.account.includes(':assets:') || p.account.startsWith('assets:')) && p.amount !== null) {
                    balancesAtOpening[p.account] = (balancesAtOpening[p.account] || 0) + p.amount;
                }
            });

            if (t.description.toLowerCase().includes('opening balances')) {
                openingBalancesTransactionDate = transactionDate;
                // Create a snapshot of positive asset balances at this point
                valueAtBaseline = Object.values(balancesAtOpening)
                    .filter(bal => bal > 0)
                    .reduce((sum, bal) => sum + bal, 0);
                openingBalancesFound = true;
                // Important: Stop accumulating further into balancesAtOpening for the baseline after this point.
                // The valueAtBaseline is now fixed.
                // However, we continue iterating all transactions for current balances below.
            }
        }

        if (openingBalancesFound && openingBalancesTransactionDate) {
            setBaselineDateForChanges(openingBalancesTransactionDate.toISOString().split('T')[0]);
        } else {
            // Fallback if no "Opening Balances" transaction is found: use start of current year like before
            // This part can be refined or removed if "Opening Balances" is guaranteed
            console.warn("'Opening Balances' transaction not found. Calculations will use start of year as baseline.");
            openingBalancesTransactionDate = new Date(currentCalendarYear, 0, 0); // Effectively Jan 0, to capture all of Jan 1
            sortedTransactions.forEach(t => {
                const tDate = new Date(t.date);
                if (tDate < new Date(currentCalendarYear, 0, 1)) {
                    t.postings.forEach(p => {
                        if ((p.account.includes(':assets:') || p.account.startsWith('assets:')) && p.amount !== null) {
                            balancesAtOpening[p.account] = (balancesAtOpening[p.account] || 0) + p.amount; // Re-accumulate for this fallback
                        }
                    });
                }
            });
            valueAtBaseline = Object.values(balancesAtOpening)
                .filter(bal => bal > 0)
                .reduce((sum, bal) => sum + bal, 0);
            setBaselineDateForChanges(`${currentCalendarYear}-01-01`);
        }

        // --- Existing logic for current balances and categorization (uses all transactions) --- 
        const accountBalances: Record<string, number> = {};
        const accountLastTransactionDate: Record<string, string> = {};

        transactions.forEach(transaction => {
            transaction.postings.forEach(posting => {
                if (posting.amount !== null) {
                    accountBalances[posting.account] = (accountBalances[posting.account] || 0) + posting.amount;

                    // Update last transaction date
                    // Ensure we only consider asset accounts for "last updated" date relevant to asset cards
                    if (posting.account.includes(':assets:') || posting.account.startsWith('assets:')) {
                        const transactionDate = new Date(transaction.date);
                        if (!accountLastTransactionDate[posting.account] || transactionDate > new Date(accountLastTransactionDate[posting.account])) {
                            accountLastTransactionDate[posting.account] = transactionDate.toISOString(); // Store as ISO string
                        }
                    }
                }
            });
        });

        const getCategorizablePath = (fullPath: string): string => {
            const parts = fullPath.split(':');
            const assetsKeywordIndex = parts.indexOf('assets');
            if (assetsKeywordIndex !== -1) {
                return parts.slice(assetsKeywordIndex).join(':');
            }
            // Fallback for paths that might not fit the expected "owner:assets:..." structure
            // but are still considered assets. If 'assets:' is at the start, it's already categorizable.
            if (fullPath.startsWith('assets:')) {
                return fullPath;
            }
            // This case implies an asset path that doesn't include "assets" as a segment,
            // which might be an edge case or an issue with how assets are defined/filtered.
            // console.warn(`Asset path does not conform to expected pattern for categorization: ${fullPath}`);
            return fullPath;
        };

        const allAssets: Asset[] = [];
        for (const accountPath in accountBalances) {
            // Include paths like 'joint:assets:...' or 'assets:...'
            if (accountPath.includes(':assets:') || accountPath.startsWith('assets:')) {
                // Ensure we only consider accounts with a final positive balance for typical assets
                // or any balance if specific asset types can be negative (e.g. margin accounts, though not typical for this view)
                // For simplicity, let's assume asset values are generally non-negative or their ledger representation is a positive final balance.
                // If a ledger shows a negative balance for an asset, it usually means it's overdrawn or acting like a liability.
                // We might want to filter out zero/negative balances unless explicitly needed.
                if (accountBalances[accountPath] > 0) { // Only include assets with positive balance
                    allAssets.push({
                        fullAccountPath: accountPath,
                        accountName: formatAccountName(accountPath),
                        balance: accountBalances[accountPath],
                        lastUpdated: accountLastTransactionDate[accountPath] || 'N/A', // Add last updated date
                    });
                }
            }
        }

        const newCategorizedAssets: CategorizedAssets = {};
        Object.values(ASSET_CATEGORIES_CONFIG).forEach(catConfig => {
            newCategorizedAssets[catConfig.title] = [];
        });

        allAssets.forEach(asset => {
            let assigned = false;
            for (const catKey in ASSET_CATEGORIES_CONFIG) {
                const catConfig = ASSET_CATEGORIES_CONFIG[catKey];
                const categorizablePath = getCategorizablePath(asset.fullAccountPath);
                if (catConfig.keywords.some(keyword => categorizablePath.startsWith(keyword))) {
                    newCategorizedAssets[catConfig.title].push(asset);
                    assigned = true;
                    break;
                }
            }
            if (!assigned) {
                console.warn(`Asset not categorized: ${asset.fullAccountPath}`);
            }
        });

        // Sort assets within each category by balance (descending)
        for (const category in newCategorizedAssets) {
            newCategorizedAssets[category].sort((a, b) => b.balance - a.balance);
        }

        // Simplify account names by removing common prefixes within categories
        for (const categoryTitle in newCategorizedAssets) {
            const assetsInThisCategory = newCategorizedAssets[categoryTitle];
            if (assetsInThisCategory.length > 1) {
                const accountNames = assetsInThisCategory.map(asset => asset.accountName);
                const prefixToRemove = getDisplayPrefixToRemove(accountNames);

                if (prefixToRemove) {
                    assetsInThisCategory.forEach(asset => {
                        if (asset.accountName.startsWith(prefixToRemove)) {
                            const newName = asset.accountName.substring(prefixToRemove.length).trim();
                            // Keep original if new name is empty and original is just the prefix (slightly adjusted)
                            if (newName === "" && asset.accountName.trim() === prefixToRemove.trim()) {
                                // This case is tricky: if name was "Vanguard" and prefix "Vanguard ", newName is "".
                                // If name was "Vanguard" and prefix was "Vanguard", it would also be "".
                                // Let's ensure we don't make it empty if it was a single word that matched the prefix base.
                                // If prefixToRemove is "Vanguard " and name is "Vanguard", it won't start with it.
                                // If name is "Vanguard", and prefix derived becomes "Vanguard ", it shouldn't be removed.
                                // The current startsWith check handles this. If newName is empty, it means original name was prefix.
                                asset.accountName = newName; // Allow it to be empty, or use original if really needed
                            } else if (newName !== "") {
                                asset.accountName = newName;
                            }
                            // If newName is empty and it wasn't just the prefix, it implies an issue or an asset named like the prefix.
                            // For now, if it becomes empty, it means the asset name was exactly the prefix.
                        }
                    });
                }
            }
        }

        setCategorizedAssets(newCategorizedAssets);
        const currentTotalAssets = allAssets.reduce((sum, asset) => sum + asset.balance, 0);
        setTotalAssets(currentTotalAssets);

        // --- New calculations for Change and Projection based on Baseline ---
        setYearToDateChange(currentTotalAssets - valueAtBaseline);

        // Project end of year assets based on current change rate
        const dayOfYear = Math.floor((Date.now() - new Date(currentCalendarYear, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const remainingDays = 365 - dayOfYear;
        if (dayOfYear > 0 && remainingDays > 0) {
            const dailyChangeRate = (currentTotalAssets - valueAtBaseline) / dayOfYear;
            setProjectedEoyAssets(currentTotalAssets + (dailyChangeRate * remainingDays));
        } else {
            setProjectedEoyAssets(null);
        }
    };

    useEffect(() => {
        if (transactions.length > 0) {
            processTransactionsForAssets(transactions);
        }
    }, [transactions]);

    if (isLoading) {
        return <AssetsSkeleton />;
    }

    if (error) {
        return <div className="p-6 text-red-600">Error: {error.message}</div>;
    }

    return (
        <div className="space-y-8">
            {/* Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Total Assets" amount={totalAssets} subtext="Current estimated value" />
                {yearToDateChange !== null && baselineDateForChanges && (
                    <SummaryCard title="Value Change" amount={yearToDateChange} subtext={`Since ${baselineDateForChanges}`} />
                )}
                {projectedEoyAssets !== null && displayCurrentYear && (
                    <SummaryCard title="Projected EOY Assets" amount={projectedEoyAssets} subtext={`Est. by ${displayCurrentYear}-12-31`} />
                )}
                {/* Add more summary cards if needed */}
            </div>

            {/* Asset Carousels by Category */}
            {Object.keys(ASSET_CATEGORIES_CONFIG).map(catKey => {
                const categoryTitle = ASSET_CATEGORIES_CONFIG[catKey].title;
                const assetsForCategory = categorizedAssets[categoryTitle] || [];
                // Render carousel only if there are assets for this category
                if (assetsForCategory.length > 0) {
                    return <AssetCarousel key={categoryTitle} title={categoryTitle} assets={assetsForCategory} />;
                }
                return null;
            })}

            {/* Optional: Display 'Other Assets' if any were collected and not categorized explicitly */}
            {/* {categorizedAssets['Other Assets'] && categorizedAssets['Other Assets'].length > 0 && (
                <AssetCarousel title="Other Assets" assets={categorizedAssets['Other Assets']} />
            )} */}
        </div>
    );
} 