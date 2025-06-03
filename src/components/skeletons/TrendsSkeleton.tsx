import React from 'react';
import { SkeletonButton, Skeleton } from '../shared/Skeleton';

const TrendsSkeleton: React.FC = () => {
    return (
        <div className="space-y-8 w-full">
            {/* Header with title and year selector */}
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-7 w-48" />
                <SkeletonButton className="w-48" />
            </div>

            {/* Income Chart Skeleton */}
            <div className="mb-12 p-6 bg-white rounded-xl shadow">
                <Skeleton className="h-6 w-64 mb-6" />
                <div className="relative" style={{ height: '600px' }}>
                    {/* Chart area */}
                    <div className="w-full h-full bg-gray-50 rounded-lg p-4">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-8 pr-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-3 w-8" />
                            ))}
                        </div>

                        {/* Chart lines simulation */}
                        <div className="ml-12 mr-8 h-5/6 relative">
                            {/* Grid lines */}
                            <div className="absolute inset-0">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="border-b border-gray-200" style={{ top: `${i * 20}%` }} />
                                ))}
                            </div>

                            {/* Simulated trend lines */}
                            <svg className="w-full h-full absolute inset-0">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <path
                                        key={i}
                                        d={`M 0 ${30 + i * 15} Q 100 ${20 + i * 10} 200 ${40 + i * 20} T 400 ${25 + i * 15}`}
                                        stroke="rgb(209, 213, 219)"
                                        strokeWidth="2"
                                        fill="none"
                                        className="animate-pulse"
                                    />
                                ))}
                            </svg>
                        </div>

                        {/* X-axis labels */}
                        <div className="flex justify-between mt-2 ml-12 mr-8">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <Skeleton key={i} className="h-3 w-6" />
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center mt-4 space-x-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center">
                                <Skeleton className="w-4 h-0.5 mr-2" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Expenses Chart Skeleton */}
            <div className="mb-12 p-6 bg-white rounded-xl shadow">
                <Skeleton className="h-6 w-64 mb-6" />
                <div className="relative" style={{ height: '600px' }}>
                    {/* Chart area */}
                    <div className="w-full h-full bg-gray-50 rounded-lg p-4">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-8 pr-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-3 w-8" />
                            ))}
                        </div>

                        {/* Chart lines simulation */}
                        <div className="ml-12 mr-8 h-5/6 relative">
                            {/* Grid lines */}
                            <div className="absolute inset-0">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="border-b border-gray-200" style={{ top: `${i * 20}%` }} />
                                ))}
                            </div>

                            {/* Simulated trend lines */}
                            <svg className="w-full h-full absolute inset-0">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <path
                                        key={i}
                                        d={`M 0 ${40 + i * 12} Q 150 ${35 + i * 8} 300 ${45 + i * 18} T 500 ${30 + i * 12}`}
                                        stroke="rgb(209, 213, 219)"
                                        strokeWidth="2"
                                        fill="none"
                                        className="animate-pulse"
                                    />
                                ))}
                            </svg>
                        </div>

                        {/* X-axis labels */}
                        <div className="flex justify-between mt-2 ml-12 mr-8">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <Skeleton key={i} className="h-3 w-6" />
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center mt-4 space-x-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center">
                                <Skeleton className="w-4 h-0.5 mr-2" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendsSkeleton; 