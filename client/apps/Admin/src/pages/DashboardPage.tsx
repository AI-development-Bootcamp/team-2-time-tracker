/**
 * @fileoverview Admin dashboard page
 * @module pages/DashboardPage
 */

import { AdminLayout } from '../components/AdminLayout';
import { DashboardHeader } from '../components/DashboardHeader';
import './DashboardPage.css';

/**
 * @description Admin dashboard page with logout functionality
 * @returns {React.JSX.Element} Dashboard page component
 */
function DashboardPage(): React.JSX.Element {
    const { user, logout } = useAuthStore();


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
