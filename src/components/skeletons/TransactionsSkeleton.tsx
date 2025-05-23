import React from 'react';
import { SkeletonButton, SkeletonTransactionCard } from '../shared/Skeleton';

const TransactionsSkeleton: React.FC = () => {
    return (
        <div className="transactions-container p-5">
            {/* Header with controls */}
            <div className="flex justify-between items-center mb-5">
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="flex items-center gap-2.5">
                    <SkeletonButton className="w-32" />
                    <SkeletonButton className="w-20" />
                </div>
            </div>

            {/* Transaction cards */}
            <div className="transactions-list space-y-5">
                {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonTransactionCard key={i} />
                ))}
            </div>

            {/* Load more button */}
            <div className="text-center mt-5">
                <div className="inline-block h-4 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    );
};

export default TransactionsSkeleton; 