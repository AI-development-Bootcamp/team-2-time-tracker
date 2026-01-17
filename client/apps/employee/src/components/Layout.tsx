import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../app/stores/auth.store';
import { Button } from '@client/ui';

export default function Layout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 direction-rtl">
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        <Link to="/">Time Tracker</Link>
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            שלום, {user?.fullName}
                        </span>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            התנתק
                        </Button>
                    </div>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
