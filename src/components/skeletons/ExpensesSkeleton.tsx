import React from 'react';
import { SkeletonCard, SkeletonButton, Skeleton } from '../shared/Skeleton';

const ExpensesSkeleton: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Month selector */}
            <div className="flex justify-end mb-6 h-10 items-center">
                <SkeletonButton className="w-40" />
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Budgets Card (2 columns) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
                    <Skeleton className="h-6 w-40 mb-6" />
                    <div className="space-y-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i}>
                                <div className="flex items-center mb-2">
                                    <Skeleton className="w-3 h-3 rounded-full mr-3" />
                                    <Skeleton className="h-4 flex-1 mr-4" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <div className="flex items-center ml-6">
                                    <div className="flex-grow h-2 bg-gray-200 rounded-full mr-3">
                                        <Skeleton className="h-2 rounded-full" style={{ width: `${Math.random() * 80 + 20}%` }} />
                                    </div>
                                    <Skeleton className="h-3 w-8" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trends Card (1 column) */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i}>
                                <div className="flex items-center">
                                    <Skeleton className="w-2.5 h-2.5 rounded-full mr-3" />
                                    <Skeleton className="h-4 flex-grow mr-2" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                                <Skeleton className="h-3 w-24 ml-5 mt-1" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Yearly Budgets Section */}
            <div className="bg-white p-6 rounded-xl shadow">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                            <div className="flex items-center mb-2">
                                <Skeleton className="w-3 h-3 rounded-full mr-3" />
                                <Skeleton className="h-4 flex-1 mr-4" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex items-center ml-6">
                                <div className="flex-grow h-2 bg-gray-200 rounded-full mr-3">
                                    <Skeleton className="h-2 rounded-full" style={{ width: `${Math.random() * 70 + 30}%` }} />
                                </div>
                                <Skeleton className="h-3 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExpensesSkeleton; 