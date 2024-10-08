import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');

    // If no token is found, redirect to HR Sign-in page
    if (!token) {
        return <Navigate to="/hr-signin" />;
    }

    // Check token expiration
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds

    if (decodedToken.exp < currentTime) {
        // Token is expired, remove it from localStorage and redirect to sign-in
        localStorage.removeItem('access_token');
        return <Navigate to="/hr-signin" />;
    }

    // Otherwise, render the component (e.g., HrDashboard)
    return children;
};

export default ProtectedRoute;
