import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router';
import './index.css';

import Root from './routes/Root';
import Home from './routes/Home';
import ErrorPage from './routes/ErrorPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,          // contains <Outlet/>
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },      // /
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);