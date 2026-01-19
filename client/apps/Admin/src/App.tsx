/**
 * @fileoverview Admin application root component
 * @module App
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AuthGuard from './components/AuthGuard';
import DashboardPage from './pages/DashboardPage';

/**
 * @description Main Admin application component with routing
 * @returns Application component
 */
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/"
                    element={
                        <AuthGuard>
                            <DashboardPage />
                        </AuthGuard>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
