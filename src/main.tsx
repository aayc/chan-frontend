import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Auth0Provider } from '@auth0/auth0-react';

import Root from './routes/Root';
import ErrorPage from './routes/ErrorPage';
import Home from './routes/Home';
import Ledger from './routes/Ledger';
import Expenses from './routes/Expenses';
import Login from './routes/Login';

import './index.css';
import { componentStyles } from './components/styles';

const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;

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
                    { index: true, element: <div>Select a category from the sidebar.</div> }, // Default content for /ledger
                    { path: 'expenses', element: <Expenses /> },
                    // TODO: Add other ledger sub-routes here e.g., income, assets, etc.
                    // { path: 'income', element: <Income /> }, 
                    // { path: 'assets', element: <Assets /> },
                    // { path: 'investments', element: <Investments /> },
                    // { path: 'transactions', element: <Transactions /> },
                ],
            },
            { path: 'login', element: <Login /> },
        ],
    },
]);

const App: React.FC = () => {
    if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
        console.warn(
            'Auth0 domain or client ID not set. Authentication will be disabled.'
        );
        return <RouterProvider router={router} />;
    }

    return (
        <Auth0Provider
            domain={AUTH0_DOMAIN}
            clientId={AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: window.location.origin,
            }}
        >
            <RouterProvider router={router} />
        </Auth0Provider>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <style>{componentStyles}</style>
        <App />
    </React.StrictMode>
); 