import React, { useEffect, useState } from 'react';
// import { useAuth0 } from '@auth0/auth0-react'; // Remove Auth0
import { useNavigate } from 'react-router'; // Corrected import
import { useAuth, AuthContextType } from '../AuthContext'; // Import AuthContextType for type assertion
import { AuthError } from 'firebase/auth';

const Login: React.FC = () => {
  // const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0(); // Remove Auth0 hooks
  const { currentUser, loading, signInWithEmailPassword, signUpWithEmailPassword, error, clearError } = useAuth() as AuthContextType;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // To toggle between Sign In and Sign Up

  // Remove Auth0 specific config check
  // const hasAuth0Config = import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID;

  useEffect(() => {
    if (currentUser) { // Check for Firebase currentUser
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Clear errors when the component unmounts or when isSignUp changes
    return () => {
      clearError();
    };
  }, [isSignUp, clearError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError(); // Clear previous errors
    let result;
    if (isSignUp) {
      result = await signUpWithEmailPassword(email, password);
    } else {
      result = await signInWithEmailPassword(email, password);
    }

    if (result && (result as AuthError).code) {
      // Error occurred, it's already set in AuthContext by the functions
      console.error("Auth Error: ", (result as AuthError).message);
    } else {
      // Successful sign-in/sign-up, navigation is handled by useEffect
    }
  };

  if (loading && !currentUser) { // Show loading only if not yet authenticated and still loading user state
    return (
      <div className="login-container">
        <div className="login-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
        <p>Please {isSignUp ? 'sign up' : 'sign in'} to continue</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {error && <p className="error-message">{error.message}</p>}
          <button type="submit" className="login-button">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <button onClick={() => { setIsSignUp(!isSignUp); clearError(); }} className="toggle-button">
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
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
          padding: 2.5rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          text-align: center;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .login-card h1 {
          margin: 0 0 0.75rem;
          font-size: 1.75rem;
          color: #111827;
        }

        .login-card p {
          margin: 0 0 1.5rem;
          color: #6b7280;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-group {
          text-align: left;
        }

        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .input-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          box-sizing: border-box;
        }
        
        .input-group input:focus {
          outline: none;
          border-color: #000;
          box-shadow: 0 0 0 1px #000;
        }

        .login-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background: #111827; /* Darker button */
          border: 1px solid transparent;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s ease;
          width: 100%;
        }

        .login-button:hover {
          background-color: #374151; /* Slightly lighter on hover */
        }

        .toggle-button {
          margin-top: 1.5rem;
          background: none;
          border: none;
          color: #4f46e5; /* Indigo color for toggle */
          font-weight: 500;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .toggle-button:hover {
          text-decoration: underline;
        }

        .error-message {
          color: #dc2626; /* Red color for errors */
          font-size: 0.875rem;
          margin-bottom: 1rem;
          text-align: left;
        }

        .login-loading {
          color: #6b7280;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}

export default Login; 