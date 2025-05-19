import React, { useEffect, useState, useMemo } from 'react';
import { LedgerTransaction } from '../../lib/ledger/types';
import { LedgerParser } from '../../lib/ledger/parser';
// Placeholder for a potential shared SummaryCard, or we can define one locally
// import { SummaryCard } from '../shared/SummaryCard'; 

// Define types for structured asset data
interface Asset {
    accountName: string; // e.g., "Ally Savings", "Vanguard VTSAX"
    fullAccountPath: string; // e.g., "assets:savings:ally"
    balance: number;
}

interface CategorizedAssets {
    [category: string]: Asset[];
}

const ASSET_CATEGORIES_CONFIG: { [key: string]: { title: string; keywords: string[] } } = {
    SAVINGS: { title: 'Savings', keywords: ['assets:bank:savings', 'assets:savings', 'assets:liquid', 'assets:cash'] },
    INVESTMENTS: { title: 'Investments', keywords: ['assets:brokerage', 'assets:investments', 'assets:stocks', 'assets:crypto', 'assets:retirement'] },
    BONDS: { title: 'Treasury Bonds', keywords: ['assets:bonds', 'assets:fixed:bonds', 'assets:treasury'] },
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


// Placeholder AssetCard component
const AssetCard: React.FC<{ asset: Asset }> = ({ asset }) => (
    <div className="bg-white p-4 rounded-lg shadow-md min-w-[200px] max-w-[250px] flex-shrink-0 mr-4 h-32 flex flex-col justify-between">
        <div>
            <h4 className="text-sm font-semibold text-gray-700 truncate" title={asset.accountName}>{asset.accountName}</h4>
        </div>
        <div>
            <p className="text-xl font-bold text-gray-900">
                ${asset.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
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
            <div className="flex overflow-x-auto pb-4 -mb-4"> {/* pb-4 and -mb-4 for scrollbar visibility without increasing div size */}
                {assets.map(asset => (
                    <AssetCard key={asset.fullAccountPath} asset={asset} />
                ))}
                {/* Add a spacer at the end if needed for better scroll experience */}
                <div className="flex-shrink-0 w-1"></div>
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
    const [categorizedAssets, setCategorizedAssets] = useState<CategorizedAssets>({});
    const [totalAssets, setTotalAssets] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadAssetData() {
            setLoading(true);
            try {
                const response = await fetch('/src/assets/sample.ledger');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const ledgerContent = await response.text();
                const parser = new LedgerParser();
                const transactions = parser.parse(ledgerContent);

                processTransactionsForAssets(transactions);
                setError(null);
            } catch (err) {
                console.error('Error loading asset data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load asset data');
            } finally {
                setLoading(false);
            }
        }

        const processTransactionsForAssets = (transactions: LedgerTransaction[]) => {
            const accountBalances: Record<string, number> = {};
            transactions.forEach(transaction => {
                transaction.postings.forEach(posting => {
                    if (posting.amount !== null) {
                        accountBalances[posting.account] = (accountBalances[posting.account] || 0) + posting.amount;
                    }
                });
            });

            const allAssets: Asset[] = [];
            for (const accountPath in accountBalances) {
                if (accountPath.startsWith('assets:')) {
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
                    if (catConfig.keywords.some(keyword => asset.fullAccountPath.startsWith(keyword))) {
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

            setCategorizedAssets(newCategorizedAssets);
            setTotalAssets(allAssets.reduce((sum, asset) => sum + asset.balance, 0));
        };

        loadAssetData();
    }, []);

    if (loading) {
        return <div className="p-6">Loading assets data...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="space-y-8">
            {/* Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Total Assets" amount={totalAssets} subtext="Current estimated value" />
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