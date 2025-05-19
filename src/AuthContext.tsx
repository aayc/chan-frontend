import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    AuthError
} from 'firebase/auth';
import { auth as firebaseAuth } from './firebase';

export interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signUpWithEmailPassword: (email: string, password: string) => Promise<User | null | AuthError>;
    signInWithEmailPassword: (email: string, password: string) => Promise<User | null | AuthError>;
    signOut: () => Promise<void>;
    error: AuthError | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AuthError | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const clearError = () => setError(null);

    const signUpWithEmailPassword = async (email: string, password: string): Promise<User | null | AuthError> => {
        setLoading(true);
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            // onAuthStateChanged will set currentUser
            setLoading(false);
            return userCredential.user;
        } catch (err) {
            setError(err as AuthError);
            setLoading(false);
            return err as AuthError;
        }
    };

    const signInWithEmailPassword = async (email: string, password: string): Promise<User | null | AuthError> => {
        setLoading(true);
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            // onAuthStateChanged will set currentUser
            setLoading(false);
            return userCredential.user;
        } catch (err) {
            setError(err as AuthError);
            setLoading(false);
            return err as AuthError;
        }
    };

    const signOut = async () => {
        setLoading(true);
        setError(null);
        try {
            await firebaseSignOut(firebaseAuth);
            // onAuthStateChanged will set currentUser to null
        } catch (err) {
            setError(err as AuthError);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        currentUser,
        loading,
        signUpWithEmailPassword,
        signInWithEmailPassword,
        signOut,
        error,
        clearError
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 