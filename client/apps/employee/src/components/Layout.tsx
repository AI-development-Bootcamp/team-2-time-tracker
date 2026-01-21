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
            height: '100vh',
            height: '100dvh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        }}>
            <main style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
            }}>
                <Outlet />
            </main>
        </div>
    );
}
