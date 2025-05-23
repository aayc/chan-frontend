import React from 'react';
import { SkeletonButton, SkeletonChart, SkeletonTable, Skeleton } from '../shared/Skeleton';

const IncomeSkeleton: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <SkeletonButton className="w-20" />
            </div>

            {/* Pie Chart */}
            <SkeletonChart className="mb-8" />

            {/* Table */}
            <SkeletonTable rows={6} cols={4} />
        </div>
    );
};

export default IncomeSkeleton; 