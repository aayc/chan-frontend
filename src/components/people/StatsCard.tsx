import React from 'react';

interface StatsCardProps {
    title: string;
    value: string;
    change: string;
    icon: string; // Placeholder for icon, ideally an SVG component or similar
}

export default function StatsCard({ title, value, change, icon }: StatsCardProps) {
    // A simple way to map icon names to SVG paths or components
    // This should be expanded for more icons
    const iconMap: { [key: string]: React.ReactNode } = {
        users: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" />
            </svg>
        ),
        gift: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0L12 4m8 8L12 20m0-16v16" />
            </svg>
        ),
        clock: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                    <p className="text-xs text-gray-400">{change}</p>
                </div>
                {iconMap[icon] || <div>Icon</div>}{/* Fallback for unmapped icons */}
            </div>
        </div>
    );
} 