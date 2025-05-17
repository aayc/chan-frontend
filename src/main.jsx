import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';

import Root from './routes/Root';
import Home from './routes/Home';
import Login from './routes/Login';
import Ledger from './routes/Ledger';
import ErrorPage from './routes/ErrorPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      {
        path: 'ledger',
        element: <Ledger />,
        children: [
          { index: true, element: <div>Select a section from the sidebar</div> },
          { path: 'transactions', element: <div>Transactions</div> },
          { path: 'expenses', element: <div>Expenses</div> },
          { path: 'income', element: <div>Income</div> },
          { path: 'assets', element: <div>Assets</div> },
          { path: 'investments', element: <div>Investments</div> },
          { path: 'budget', element: <div>Budget</div> },
          { path: 'reports', element: <div>Reports</div> },
        ]
      }
    ]
  }
]);

// Check if Auth0 credentials are present
const hasAuth0Config = import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID;

const App = () => {
  // If Auth0 is configured, wrap with Auth0Provider
  if (hasAuth0Config) {
    return (
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin
        }}
      >
        <RouterProvider router={router} />
      </Auth0Provider>
    );
  }

  // If no Auth0 config, render without authentication
  return <RouterProvider router={router} />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
