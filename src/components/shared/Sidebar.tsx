import React, { useState } from 'react';
import {
    HiOutlineCurrencyDollar,
    HiOutlineArrowsRightLeft,
    HiOutlineBuildingOffice2,
    HiOutlineChartBarSquare,
    HiOutlineBanknotes,
    HiOutlineUsers, // Added for People link
    HiOutlineArrowLeftOnRectangle,
    HiOutlineBars3,
    HiOutlineXMark
} from 'react-icons/hi2';

interface SidebarItemProps {
    title: string;
    isActive?: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
    className?: string;
}

// Exporting SidebarItem in case it's needed by other components, though primarily used by Sidebar here.
export const SidebarItem: React.FC<SidebarItemProps> = ({ title, isActive, onClick, icon, className }) => (
    <li
        className={`px-4 py-3 flex items-center cursor-pointer rounded-lg transition-colors mb-1 ${className || ''}
                ${isActive ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
        onClick={onClick}
    >
        {icon && <span className="mr-3 text-xl">{icon}</span>}
        {title}
    </li>
);

interface SidebarProps {
    currentUser: any; // Should be replaced with a specific User type from your AuthContext
    activeView: string | null;
    onSignOut: () => Promise<void>;
    onNavigate: (view: string) => void; // Handles navigation logic from the parent
    appName?: string;
    appIcon?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentUser,
    activeView,
    onSignOut,
    onNavigate,
    appName = "Ledger Finance", // Default app name
    appIcon = <HiOutlineChartBarSquare className="text-3xl mr-2 text-green-500" /> // Default app icon
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleNavigateAndCloseMobile = (view: string) => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-md bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
                >
                    {isMobileMenuOpen ? (
                        <HiOutlineXMark className="h-6 w-6 text-gray-600" />
                    ) : (
                        <HiOutlineBars3 className="h-6 w-6 text-gray-600" />
                    )}
                </button>
            </div>

            {/* Mobile backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 lg:z-10
                w-64 bg-white shadow-lg flex flex-col flex-shrink-0 h-screen
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-5">
                    <div className="mb-10 text-xl lg:text-2xl font-bold flex items-center">
                        <span className="text-2xl lg:text-3xl mr-2">
                            {appIcon}
                        </span>
                        <span className="hidden sm:block">{appName}</span>
                    </div>
                    <nav>
                        <ul className="space-y-1">
                            <SidebarItem
                                title="Expenses"
                                isActive={activeView === 'expenses'}
                                onClick={() => handleNavigateAndCloseMobile('expenses')}
                                icon={<HiOutlineCurrencyDollar />}
                            />
                            <SidebarItem
                                title="Transactions"
                                isActive={activeView === 'transactions'}
                                onClick={() => handleNavigateAndCloseMobile('transactions')}
                                icon={<HiOutlineArrowsRightLeft />}
                            />
                            <SidebarItem
                                title="Assets"
                                isActive={activeView === 'assets'}
                                onClick={() => handleNavigateAndCloseMobile('assets')}
                                icon={<HiOutlineBuildingOffice2 />}
                            />
                            <SidebarItem
                                title="Income"
                                isActive={activeView === 'income'}
                                onClick={() => handleNavigateAndCloseMobile('income')}
                                icon={<HiOutlineBanknotes />}
                            />
                            <SidebarItem
                                title="Trends"
                                isActive={activeView === 'trends'}
                                onClick={() => handleNavigateAndCloseMobile('trends')}
                                icon={<HiOutlineChartBarSquare />}
                            />
                            <SidebarItem
                                title="People"
                                isActive={activeView === 'people'}
                                onClick={() => handleNavigateAndCloseMobile('people')}
                                icon={<HiOutlineUsers />}
                            />
                        </ul>
                    </nav>
                </div>
                {/* Spacer to push logout to bottom */}
                <div className="mt-auto p-5">
                    {currentUser && (
                        <SidebarItem
                            title="Sign out"
                            onClick={() => {
                                onSignOut();
                                setIsMobileMenuOpen(false);
                            }}
                            icon={<HiOutlineArrowLeftOnRectangle />}
                            className="hover:bg-red-100 hover:text-red-700 text-red-500"
                        />
                    )}
                </div>
            </aside>
        </>
    );
}; 