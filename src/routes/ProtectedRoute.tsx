import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../AuthContext';

const ProtectedRoute: React.FC = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        // You might want to render a loading spinner here
        return <div>Loading...</div>;
    }

    if (!currentUser) {
        // User not authenticated, redirect to login page
        // You can pass the current location to redirect back after login if needed
        // return <Navigate to="/login" state={{ from: location }} replace />;
        return <Navigate to="/login" replace />;
    }

    // User is authenticated, render the child components
    return <Outlet />;
};

export default ProtectedRoute; 