import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@client/ui';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import HomePage from './pages/HomePage';
import AbsencePage from './pages/AbsencePage';
import AbsenceRangePage from './pages/AbsenceRangePage';

import '@client/ui/styles/tokens.css';
import './index.css';

// Create a client for TanStack Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30000,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />

                        <Route element={<ProtectedRoute />}>
                            <Route element={<Layout />}>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/change-password" element={<ChangePasswordPage />} />
                                <Route path="/absences" element={<AbsencePage />} />
                                <Route path="/absences/range" element={<AbsenceRangePage />} />
                                {/* Add more protected routes here */}
                            </Route>
                        </Route>

                        {/* Fallback route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </ToastProvider>
        </QueryClientProvider>
    );
}

export default App;
