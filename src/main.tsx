import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './AuthContext';

import Root from './routes/Root';
import ErrorPage from './routes/ErrorPage';
import Home from './routes/Home';
import Ledger from './routes/Ledger';
import Expenses from './components/ledger/Expenses';
import Transactions from './components/ledger/Transactions';
import Assets from './components/ledger/Assets';
import Income from './components/ledger/Income';
import Login from './routes/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import People from './routes/People';

import './index.css';
import { componentStyles } from './components/shared/styles';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: (failureCount, error) => {
                // Don't retry on auth errors
                if (error.message.includes('not authenticated')) {
                    return false;
                }
                return failureCount < 3;
            },
        },
    },
});

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <Home /> },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: 'ledger',
                        element: <Ledger />,
                        children: [
                            { index: true, element: <Navigate to="/ledger/expenses" replace /> },
                            {
                                path: 'expenses',
                                element: <Expenses />,
                            },
                            {
                                path: 'transactions',
                                element: <Transactions />,
                            },
                            {
                                path: 'assets',
                                element: <Assets />,
                            },
                            {
                                path: 'income',
                                element: <Income />,
                            },
                        ],
                    },
                    {
                        path: 'people',
                        element: <People />
                    }
                ]
            },
            { path: 'login', element: <Login /> },
        ],
    },
]);

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
                <ReactQueryDevtools initialIsOpen={false} />
            </AuthProvider>
        </QueryClientProvider>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <style>{componentStyles}</style>
        <App />
    </React.StrictMode>
); 