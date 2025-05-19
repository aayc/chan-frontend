import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AuthProvider } from './AuthContext';

import Root from './routes/Root';
import ErrorPage from './routes/ErrorPage';
import Home from './routes/Home';
import Ledger from './routes/Ledger';
import Expenses from './components/ledger/Expenses';
import Transactions from './components/ledger/Transactions';
import Login from './routes/Login';

import './index.css';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <Home /> },
            {
                path: 'ledger',
                element: <Ledger />,
                children: [
                    { index: true, element: <div>Select a category from the sidebar.</div> },
                    {
                        path: 'expenses',
                        element: <Expenses />,
                    },
                    {
                        path: 'transactions',
                        element: <Transactions />,
                    },
                ],
            },
            { path: 'login', element: <Login /> },
        ],
    },
]);

const App: React.FC = () => {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 