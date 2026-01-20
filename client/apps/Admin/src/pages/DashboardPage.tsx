/**
 * @fileoverview Admin dashboard page
 * @module pages/DashboardPage
 */

import { AdminLayout } from '../components/AdminLayout';
import { DashboardHeader } from '../components/DashboardHeader';
import './DashboardPage.css';

/**
 * @description Admin dashboard page with logout functionality
 * @returns Dashboard page component
 */
function DashboardPage() {
    const { user, logout } = useAuthStore();

    async function handleLogout(): Promise<void> {
        await logout();
    }

    return (
        <AdminLayout>
            <DashboardHeader
                title="ניהול פרויקטים"
                showAddButton={true}
            />
            <div className="dashboard-page__content">
                {/* Future: Table/content goes here */}
                <p>Content placeholder</p>
            </div>
        </AdminLayout>
    );
}

export default DashboardPage;
