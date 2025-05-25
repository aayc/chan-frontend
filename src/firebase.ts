import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// Validate that all required environment variables are set
const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID'
];

let firebaseConfig;

const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingEnvVars.length > 0) {
    console.error(`Error: Missing Firebase environment variables: ${missingEnvVars.join(', ')}`);
    console.error("Firebase will not be initialized. Please set these variables in your .env file.");
    // Depending on the app's needs, you might throw an error here or allow the app to continue with Firebase disabled.
    // For this example, we'll proceed with an undefined firebaseConfig, which will cause Firebase init to fail if not handled.
    firebaseConfig = undefined;
} else {
    firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

if (firebaseConfig) {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);
} else {
    // If Firebase is not configured, app and auth will be undefined.
    // Components using auth should handle this gracefully (e.g., disable Firebase-dependent features).
    console.warn("Firebase is not configured. Authentication and other Firebase services will be unavailable.");
}

export { app, auth }; // Export possibly undefined app and auth 