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
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgb(242, 242, 247)'
        }}>
            <header className="bg-white shadow" style={{ flexShrink: 0 }}>
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
            <main style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Outlet />
            </main>
        </div>
    );
}
