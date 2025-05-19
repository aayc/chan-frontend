import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBdE8AQYUhNlwlKwIpHxs3Exz7zSIcKIRU",
    authDomain: "aaronchandev-af161.firebaseapp.com",
    projectId: "aaronchandev-af161",
    storageBucket: "aaronchandev-af161.firebasestorage.app",
    messagingSenderId: "733357166118",
    appId: "1:733357166118:web:8e4948588bd39aff9860e7",
    measurementId: "G-D3LVW64L6P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app; 