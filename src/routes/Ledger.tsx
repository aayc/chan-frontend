import React from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router';
import {
    HiOutlineCurrencyDollar,
    HiOutlineArrowsRightLeft,
    HiOutlineBuildingOffice2,
    HiOutlineChartBarSquare,
    HiOutlineBanknotes,
    HiOutlineArrowLeftOnRectangle
} from 'react-icons/hi2';
import { useAuth } from '../AuthContext';

const SidebarItem: React.FC<{ title: string; isActive?: boolean; onClick: () => void; icon?: React.ReactNode, className?: string }> =
    ({ title, isActive, onClick, icon, className }) => (
        <li
            className={`px-4 py-3 flex items-center cursor-pointer rounded-lg transition-colors mb-1 ${className || ''}
                    ${isActive ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
            onClick={onClick}
        >
            {icon && <span className="mr-3 text-xl">{icon}</span>}
            {title}
        </li>
    );

export default function LedgerRouteContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, currentUser } = useAuth();

    // Determine active view based on current path
    const getActiveView = () => {
        const path = location.pathname;
        if (path.includes('/expenses')) return 'expenses';
        if (path.includes('/transactions')) return 'transactions';
        if (path.includes('/assets')) return 'assets';
        if (path.includes('/income')) return 'income';
        return null; // No specific view, show the outlet default
    };

    const activeView = getActiveView();

    const handleSignOut = async () => {
        try {
            await signOut();
            // Navigation to /login will be handled by ProtectedRoute due to currentUser becoming null
        } catch (error) {
            console.error("Error signing out: ", error);
            // Handle logout error if needed
        }
    };

    const handleNavigation = (view: string) => {
        navigate(`/ledger/${view}`);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-5 shadow-lg flex flex-col flex-shrink-0 h-screen sticky top-0 z-10">
                <div>
                    <div className="mb-10 text-2xl font-bold text-green-600 flex items-center">
                        <HiOutlineChartBarSquare className="text-3xl mr-2 text-green-500" />
                        Ledger Finance
                    </div>
                    <nav>
                        <ul className="space-y-1">
                            <SidebarItem
                                title="Expenses"
                                isActive={activeView === 'expenses'}
                                onClick={() => handleNavigation('expenses')}
                                icon={<HiOutlineCurrencyDollar />}
                            />
                            <SidebarItem
                                title="Transactions"
                                isActive={activeView === 'transactions'}
                                onClick={() => handleNavigation('transactions')}
                                icon={<HiOutlineArrowsRightLeft />}
                            />
                            <SidebarItem
                                title="Assets"
                                isActive={activeView === 'assets'}
                                onClick={() => handleNavigation('assets')}
                                icon={<HiOutlineBuildingOffice2 />}
                            />
                            <SidebarItem
                                title="Income"
                                isActive={activeView === 'income'}
                                onClick={() => handleNavigation('income')}
                                icon={<HiOutlineBanknotes />}
                            />
                        </ul>
                    </nav>
                </div>
                {/* Spacer to push logout to bottom */}
                <div className="mt-auto">
                    {currentUser && (
                        <SidebarItem
                            title="Sign out"
                            onClick={handleSignOut}
                            icon={<HiOutlineArrowLeftOnRectangle />}
                            className="hover:bg-red-100 hover:text-red-700 text-red-500"
                        />
                    )}
                </div>
            </aside>

            {/* Main Content Wrapper for Centering and Scrolling */}
            <div className="flex-1 flex justify-center items-start overflow-y-auto h-screen">
                {/* Actual Main Content Area */}
                <main className="max-w-5xl w-full p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
} 