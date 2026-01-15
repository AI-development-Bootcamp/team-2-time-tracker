import { useState, useEffect } from 'react';

// Health check response type
interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch server health status on mount
  useEffect(() => {
    fetch('/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setError('לא ניתן להתחבר לשרת'));
  }, []);

  return (
    <main className="container">
      <h1>מעקב שעות</h1>
      <p>מערכת דיווח שעות עבודה</p>

      <section className="status-card">
        <h2>סטטוס שרת</h2>
        {error && <p className="error">{error}</p>}
        {health && (
          <dl>
            <dt>סטטוס</dt>
            <dd>{health.status === 'ok' ? 'תקין' : 'שגיאה'}</dd>
            <dt>זמן פעילות</dt>
            <dd>{Math.floor(health.uptime)} שניות</dd>
          </dl>
        )}
        {!health && !error && <p>טוען...</p>}
      </section>
    </main>
  );
}
