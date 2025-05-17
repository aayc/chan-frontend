import React from 'react';
import { Outlet, Link } from 'react-router';

const Root: React.FC = () => {
    return (
        <div className="root">
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/ledger">Ledger</Link>
                    </li>
                    <li>
                        <Link to="/login">Login</Link>
                    </li>
                </ul>
            </nav>

            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default Root; 