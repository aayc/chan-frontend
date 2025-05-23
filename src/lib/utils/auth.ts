import type { User } from 'firebase/auth';

/**
 * Gets the Firebase ID token for the provided user
 * @param currentUser - The current Firebase user from useAuth hook
 * @returns Promise that resolves to the ID token or null if unable to get token
 */
export const getFirebaseAuthToken = async (currentUser: User | null): Promise<string | null> => {
    if (!currentUser) {
        console.warn('No current user provided to getFirebaseAuthToken');
        return null;
    }

    try {
        return await currentUser.getIdToken();
    } catch (error) {
        console.error('Error getting Firebase ID token:', error);
        return null;
    }
};

/**
 * Creates a token getter function that can be passed to ServerStorageService
 * @param currentUser - The current Firebase user from useAuth hook
 * @returns Function that returns a promise resolving to the auth token
 */
export const createAuthTokenGetter = (currentUser: User | null) => {
    return () => getFirebaseAuthToken(currentUser);
}; 