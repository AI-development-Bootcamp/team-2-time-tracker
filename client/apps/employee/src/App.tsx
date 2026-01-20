import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@client/ui';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import { TimeEntryHistoryPage } from './pages/TimeEntryHistoryPage';
import { DailyReportPage } from './pages/DailyReportPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

import '@client/ui/styles/tokens.css';
import './index.css';

function App() {
    return (
        <div className="mobile-simulation-root">
            <div className="mobile-simulation-frame">
                <ToastProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />

                            <Route element={<ProtectedRoute />}>
                                <Route element={<Layout />}>
                                    <Route path="/" element={<DailyReportPage />} />
                                    <Route path="/history" element={<TimeEntryHistoryPage />} />
                                    <Route path="/change-password" element={<ChangePasswordPage />} />
                                    {/* Add more protected routes here */}
                                </Route>
                            </Route>

                            {/* Fallback route */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </BrowserRouter>
                </ToastProvider>
            </div>
        </div>
    );
}

export default App;
