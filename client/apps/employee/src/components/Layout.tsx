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
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <header className="bg-white shadow" style={{ flexShrink: 0 }}>
                <div className="px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">
                        <Link to="/">Time Tracker</Link>
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">
                            {user?.fullName?.split(' ')[0]}
                        </span>
                        <Button variant="outline" size="sm" onClick={handleLogout} style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}>
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
