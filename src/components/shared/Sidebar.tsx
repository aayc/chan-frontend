import React from 'react';
import {
    HiOutlineCurrencyDollar,
    HiOutlineArrowsRightLeft,
    HiOutlineBuildingOffice2,
    HiOutlineChartBarSquare,
    HiOutlineBanknotes,
    HiOutlineUsers, // Added for People link
    HiOutlineArrowLeftOnRectangle
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
    return (
        <aside className="w-64 bg-white p-5 shadow-lg flex flex-col flex-shrink-0 h-screen sticky top-0 z-10">
            <div>
                <div className="mb-10 text-2xl font-bold text-green-600 flex items-center">
                    {appIcon}
                    {appName}
                </div>
                <nav>
                    <ul className="space-y-1">
                        <SidebarItem
                            title="Expenses"
                            isActive={activeView === 'expenses'}
                            onClick={() => onNavigate('expenses')}
                            icon={<HiOutlineCurrencyDollar />}
                        />
                        <SidebarItem
                            title="Transactions"
                            isActive={activeView === 'transactions'}
                            onClick={() => onNavigate('transactions')}
                            icon={<HiOutlineArrowsRightLeft />}
                        />
                        <SidebarItem
                            title="Assets"
                            isActive={activeView === 'assets'}
                            onClick={() => onNavigate('assets')}
                            icon={<HiOutlineBuildingOffice2 />}
                        />
                        <SidebarItem
                            title="Income"
                            isActive={activeView === 'income'}
                            onClick={() => onNavigate('income')}
                            icon={<HiOutlineBanknotes />}
                        />
                        <SidebarItem
                            title="People"
                            isActive={activeView === 'people'}
                            onClick={() => onNavigate('people')}
                            icon={<HiOutlineUsers />}
                        />
                    </ul>
                </nav>
            </div>
            {/* Spacer to push logout to bottom */}
            <div className="mt-auto">
                {currentUser && (
                    <SidebarItem
                        title="Sign out"
                        onClick={onSignOut} // Direct pass-through
                        icon={<HiOutlineArrowLeftOnRectangle />}
                        className="hover:bg-red-100 hover:text-red-700 text-red-500"
                    />
                )}
            </div>
        </aside>
    );
}; 