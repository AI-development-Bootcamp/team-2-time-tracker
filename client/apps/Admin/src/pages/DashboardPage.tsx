/**
 * @fileoverview Admin dashboard page
 * @module pages/DashboardPage
 */

import { AdminLayout } from '../components/AdminLayout';
import { DashboardHeader } from '../components/DashboardHeader';
import './DashboardPage.css';

/**
 * @description Admin dashboard page
 * @returns {React.JSX.Element} Dashboard page component
 */
function DashboardPage(): React.JSX.Element {



    return (
        <AdminLayout>
            <DashboardHeader
                title="ניהול פרויקטים"
                showAddButton={true}
            />
            {/* Content will be added here */}
        </AdminLayout>
    );
}

export default DashboardPage;
