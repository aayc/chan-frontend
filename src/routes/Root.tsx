import React from 'react';
import { Outlet, Link } from 'react-router';

const Root: React.FC = () => {
    return (
        <div className="root w-full min-h-screen">
            <nav>
            </nav>

            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default Root; 