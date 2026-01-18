import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@client/ui';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AbsencePage from './pages/AbsencePage';

import '@client/ui/styles/tokens.css';
import './index.css';

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Temporary: Preview route without authentication (for testing) */}
                    <Route path="/test/absences" element={<AbsencePage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<div className="p-4">ברוכים הבאים למערכת דיווח שעות</div>} />
                            <Route path="/change-password" element={<ChangePasswordPage />} />
                            <Route path="/absences" element={<AbsencePage />} />
                            {/* Add more protected routes here */}
                        </Route>
                    </Route>

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;
