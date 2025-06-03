import React from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router';
import { useAuth } from '../AuthContext';
import { Sidebar } from '../components/shared/Sidebar';

export default function LedgerRouteContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, currentUser } = useAuth();

    const getActiveView = () => {
        const path = location.pathname;
        if (path.includes('/expenses')) return 'expenses';
        if (path.includes('/transactions')) return 'transactions';
        if (path.includes('/assets')) return 'assets';
        if (path.includes('/income')) return 'income';
        if (path.includes('/people')) return 'people';
        if (path.includes('/trends')) return 'trends';
        return null;
    };

    const activeView = getActiveView();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const handleNavigation = (view: string) => {
        if (view === 'people') {
            navigate('/people');
        } else {
            navigate(`/ledger/${view}`);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                currentUser={currentUser}
                activeView={activeView}
                onSignOut={handleSignOut}
                onNavigate={handleNavigation}
            />
            <div className="flex-1 overflow-y-auto h-screen">
                <main className="w-full p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
} 