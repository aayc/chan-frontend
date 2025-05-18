import React, { useState } from 'react';
import Expenses from '../components/ledger/Expenses';
import Transactions from '../components/ledger/Transactions';
import Income from '../components/ledger/Income';
import {
    HiOutlineCurrencyDollar,
    HiOutlineArrowsRightLeft,
    HiOutlineBuildingOffice2,
    HiOutlineChartPie,
    HiOutlineChartBarSquare,
    HiOutlineCreditCard,
    HiOutlineBanknotes
} from 'react-icons/hi2';
// Import other components like Assets, Investments when they are ready

const SidebarItem: React.FC<{ title: string; isActive: boolean; onClick: () => void; icon?: React.ReactNode }> = ({ title, isActive, onClick, icon }) => (
    <li
        className={`px-4 py-3 flex items-center cursor-pointer rounded-lg transition-colors mb-1
                    ${isActive ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
        onClick={onClick}
    >
        {icon && <span className="mr-3 text-xl">{icon}</span>}
        {title}
    </li>
);

export default function LedgerRouteContent() {
    const [activeView, setActiveView] = useState<'expenses' | 'transactions' | 'assets' | 'income'>('expenses');

    const renderView = () => {
        switch (activeView) {
            case 'expenses':
                return <Expenses />;
            case 'transactions':
                return <Transactions />;
            // Add cases for 'assets', 'income' later
            case 'income':
                return <Income />;
            default:
                return <Expenses />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-5 shadow-lg flex-shrink-0">
                <div className="mb-10 text-2xl font-bold text-green-600 flex items-center">
                    <HiOutlineChartBarSquare className="text-3xl mr-2 text-green-500" />
                    Ledger Finance
                </div>
                <nav>
                    <ul className="space-y-1">
                        <SidebarItem
                            title="Expenses"
                            isActive={activeView === 'expenses'}
                            onClick={() => setActiveView('expenses')}
                            icon={<HiOutlineCurrencyDollar />}
                        />
                        <SidebarItem
                            title="Transactions"
                            isActive={activeView === 'transactions'}
                            onClick={() => setActiveView('transactions')}
                            icon={<HiOutlineArrowsRightLeft />}
                        />
                        <SidebarItem
                            title="Assets"
                            isActive={activeView === 'assets'}
                            onClick={() => setActiveView('assets')}
                            icon={<HiOutlineBuildingOffice2 />}
                        />
                        <SidebarItem
                            title="Income"
                            isActive={activeView === 'income'}
                            onClick={() => setActiveView('income')}
                            icon={<HiOutlineBanknotes />}
                        />
                    </ul>
                </nav>
            </aside>

            {/* Main Content Wrapper for Centering */}
            <div className="flex-1 flex justify-center items-start">
                {/* Actual Main Content Area */}
                <main className="max-w-5xl w-full p-8">
                    {renderView()}
                </main>
            </div>
        </div>
    );
} 