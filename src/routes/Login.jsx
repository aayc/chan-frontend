import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router';

export default function Login() {
    const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
    const navigate = useNavigate();

    // Check if Auth0 is configured
    const hasAuth0Config = import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID;

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    if (isLoading && hasAuth0Config) {
        return (
            <div className="login-container">
                <div className="login-loading">Loading...</div>
            </div>
        );
    }

    const handleLogin = () => {
        if (hasAuth0Config) {
            loginWithRedirect();
        } else {
            // For local development without Auth0
            console.log('Auth0 not configured - skipping authentication');
            navigate('/');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Welcome</h1>
                <p>Please sign in to continue</p>
                <button
                    className="login-button"
                    onClick={handleLogin}
                >
                    {hasAuth0Config ? 'Sign In' : 'Continue (No Auth)'}
                </button>
            </div>

            <style>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .login-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          text-align: center;
          max-width: 400px;
          width: 90%;
        }

        .login-card h1 {
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
          color: #111827;
        }

        .login-card p {
          margin: 0 0 1.5rem;
          color: #6b7280;
        }

        .login-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          color: #111827;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .login-button:hover {
          border-color: #000;
        }

        .login-loading {
          color: #6b7280;
          font-size: 1rem;
        }
      `}</style>
        </div>
    );
} 