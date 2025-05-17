import React from 'react';
import { useRouteError, Link, isRouteErrorResponse } from 'react-router';

const ErrorPage: React.FC = () => {
    const error = useRouteError();
    let errorMessage: string;

    if (isRouteErrorResponse(error)) {
        // error is type `ErrorResponse`
        errorMessage = error.data?.message || error.statusText;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else {
        console.error(error);
        errorMessage = 'Unknown error';
    }

    return (
        <div id="error-page" className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
            <p className="text-lg text-gray-700 mb-2">Sorry, an unexpected error has occurred.</p>
            <p className="text-md text-gray-500 mb-6">
                <i>{errorMessage}</i>
            </p>
            <Link
                to="/"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Return to Home
            </Link>
        </div>
    );
}

export default ErrorPage; 