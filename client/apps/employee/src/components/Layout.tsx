/**
 * @fileoverview Layout Component
 *
 * Provides the main application structure for authenticated users.
 * Main Content Area renders the active route component via <Outlet />.
 */

import { Outlet } from 'react-router-dom';

/**
 * Layout Component
 *
 * Wraps all protected routes.
 */
export default function Layout() {
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <main style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Outlet />
            </main>
        </div>
    );
}
