import React from 'react';
import { Outlet, Link } from 'react-router';

export default function Root() {
    return (
        <div className="root">
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/about">About</Link>
                    </li>
                </ul>
            </nav>

            <main>
                <Outlet />
            </main>
        </div>
    );
} 