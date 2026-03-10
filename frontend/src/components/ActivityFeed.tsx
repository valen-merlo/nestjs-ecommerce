import React, { useEffect, useState } from 'react';
import { getActivity } from '../api/activity';
import { useAuth } from '../context/AuthContext';
import type { ActivityItem } from '../api/types';

const POLL_INTERVAL_MS = 4000;

const EVENT_LABELS: Record<ActivityItem['type'], string> = {
  'product.created': 'Producto creado',
  'product.activated': 'Producto activado',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatTimeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffH < 24) return `hace ${diffH} h`;
  if (diffDays < 7) return `hace ${diffDays} día${diffDays === 1 ? '' : 's'}`;
  return formatTime(iso);
}

export function ActivityFeed() {
  const { token } = useAuth();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = React.useCallback(async () => {
    try {
      const data = await getActivity(token);
      setItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cargar actividad';
      const isGeneric = /something went wrong|500|Internal Server/i.test(msg);
      setError(
        isGeneric
          ? 'Error al cargar actividad. Ejecuta en el backend: npm run migration:run (crea la tabla activity_log) y reinicia el servidor.'
          : msg,
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchActivity();
    const id = setInterval(fetchActivity, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchActivity]);

  if (loading && items.length === 0) {
    return (
      <div className="card">
        <h3 className="card__title">Actividad reciente</h3>
        <p className="card__subtitle">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card__title">Actividad reciente</h3>
      <p className="card__subtitle">
        Se actualiza cada {POLL_INTERVAL_MS / 1000}s. Se muestran hasta las últimas 100 acciones (guardadas en base de datos; persisten al reiniciar).
      </p>
      {error && <p className="error">{error}</p>}
      {items.length === 0 && !error && (
        <p className="card__subtitle" style={{ marginBottom: 0 }}>
          No hay actividad aún. Crea o activa productos para ver eventos aquí.
        </p>
      )}
      {items.length > 0 && (
        <div>
          {items.map((item, i) => (
            <div key={`${item.at}-${i}`} className="activity-item">
              <strong>
                {EVENT_LABELS[item.type] ?? item.type}
              </strong>
              {' — '}
              id: {item.payload.productId}, merchant: {item.payload.merchantId}
              {item.payload.title != null && item.payload.title !== '' && (
                <> — "{item.payload.title}"</>
              )}
              {' '}
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }} title={formatTime(item.at)}>
                {formatTimeAgo(item.at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
