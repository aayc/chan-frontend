import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string;
    height?: string;
    style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width, height, style }) => (
    <div
        className={`animate-pulse bg-gray-200 rounded ${className}`}
        style={{ width, height, ...style }}
    />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow ${className}`}>
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
    </div>
);

export const SkeletonButton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Skeleton className={`h-10 w-24 ${className}`} />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
    lines = 3,
    className = ''
}) => (
    <div className={className}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                className={`h-4 mb-2 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
            />
        ))}
    </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
    rows = 5,
    cols = 4
}) => (
    <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-20" />
                ))}
            </div>
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4 border-b last:border-b-0">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 w-full" />
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow ${className}`}>
        <div className="flex justify-center items-center" style={{ height: '400px' }}>
            <div className="relative">
                <Skeleton className="w-48 h-48 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton className="w-24 h-24 rounded-full bg-gray-100" />
                </div>
            </div>
        </div>
    </div>
);

export const SkeletonAssetCard: React.FC = () => (
    <div className="bg-white p-4 rounded-lg shadow-md h-36 flex flex-col justify-between">
        <Skeleton className="h-4 w-3/4" />
        <div>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-3 w-20" />
        </div>
    </div>
);

export const SkeletonTransactionCard: React.FC = () => (
    <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full mb-3" />
        <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    </div>
); 