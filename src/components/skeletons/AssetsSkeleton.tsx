import React from 'react';
import { SkeletonCard, SkeletonAssetCard, Skeleton } from '../shared/Skeleton';

const AssetsSkeleton: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>

            {/* Asset categories */}
            {Array.from({ length: 3 }).map((_, categoryIndex) => (
                <div key={categoryIndex} className="mb-8">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {Array.from({ length: Math.floor(Math.random() * 4) + 2 }).map((_, cardIndex) => (
                            <SkeletonAssetCard key={cardIndex} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AssetsSkeleton; 