/**
 * @fileoverview Admin dashboard page (placeholder)
 * @module pages/DashboardPage
 */

import { useAuthStore } from '../stores/authStore';
import './DashboardPage.css';

/**
 * @description Admin dashboard page with logout functionality
 * @returns {JSX.Element} Dashboard page component
 */
function DashboardPage(): JSX.Element {
    const { user, logout } = useAuthStore();

    async function handleLogout(): Promise<void> {
        await logout();
    }

    return (
        <div className="dashboard">
            <header className="dashboard__header">
                <h1 className="dashboard__title">לוח בקרה</h1>
                <div className="dashboard__user-info">
                    <span className="dashboard__user-name">{user?.fullName}</span>
                    <button
                        className="dashboard__logout-btn"
                        onClick={handleLogout}
                    >
                        התנתקות
                    </button>
                </div>
            </header>

            <main className="dashboard__content">
                <div className="dashboard__welcome">
                    <h2>שלום, {user?.fullName}!</h2>
                    <p>מערכת דיווח שעות - פאנל ניהול</p>
                </div>
            </main>
        </div>
    );
}

export default DashboardPage;
