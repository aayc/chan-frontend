import React from 'react';
import { Link, Outlet } from 'react-router';

const menuItems = [
    { path: 'expenses', label: 'Expenses', icon: '💸' },
    { path: 'income', label: 'Income', icon: '📈' },
    { path: 'assets', label: 'Assets', icon: '🏦' },
    { path: 'investments', label: 'Investments', icon: '📊' },
    { path: 'transactions', label: 'Transactions', icon: '💰' },
];

export default function Ledger() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r border-gray-200 p-6">
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900">Ledger</h2>
                </div>
                <nav className="flex flex-col gap-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
} 