/**
 * @fileoverview Admin application root component
 * @module App
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AuthGuard from './components/AuthGuard';
import AssignmentsPage from './pages/AssignmentsPage';
import HourReportPage from './pages/HourReportPage';

/**
 * @description Main Admin application component with routing
 * @returns {React.JSX.Element} Application component
 */
function App(): React.JSX.Element {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/assignments" replace />} />
                <Route
                    path="/assignments"
                    element={
                        <AuthGuard>
                            <AssignmentsPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/hour-report"
                    element={
                        <AuthGuard>
                            <HourReportPage />
                        </AuthGuard>
                    }
                />
                <Route path="*" element={<Navigate to="/assignments" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
