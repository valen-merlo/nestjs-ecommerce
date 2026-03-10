import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, activateProduct, deactivateProduct } from '../api/products';
import type { Product } from '../api/types';
import { LoginRequired } from '../components/LoginRequired';
import { useAuth } from '../context/AuthContext';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { token, isAuthenticated, user, canManageProducts } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const fetchProduct = useCallback(() => {
    if (!id) return;
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) {
      setError('ID inválido');
      setLoading(false);
      return;
    }
    setLoading(true);
    getProduct(numId)
      .then(setProduct)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleToggleActive = useCallback(async () => {
    if (!product || !token) return;
    setToggling(true);
    setToggleError(null);
    try {
      if (product.isActive) {
        await deactivateProduct(product.id, token);
      } else {
        await activateProduct(product.id, token);
      }
      setToggleError(null);
      fetchProduct();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar estado';
      const isForbidden = /not allowed|401|Unauthorized/i.test(msg);
      setToggleError(
        isForbidden
          ? 'Solo usuarios Admin o Merchant pueden activar/desactivar. Inicia sesión con admin@admin.com para probar.'
          : msg,
      );
    } finally {
      setToggling(false);
    }
  }, [product, token, fetchProduct]);

  if (!isAuthenticated) {
    return <LoginRequired />;
  }
  if (user === null) {
    return (
      <div className="container">
        <div className="loading-placeholder">Cargando…</div>
      </div>
    );
  }
  if (loading && !product) {
    return (
      <div className="container">
        <div className="loading-placeholder">Cargando producto…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container">
        <Link to="/" className="back-link">← Volver al catálogo</Link>
        <p className="error">{error}</p>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="container">
        <Link to="/" className="back-link">← Volver al catálogo</Link>
        <div className="empty-state">Producto no encontrado</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '720px' }}>
      <Link to="/" className="back-link">← Volver al catálogo</Link>
      <div className="card">
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>{product.title || `Producto #${product.id}`}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className={`badge ${product.isActive ? 'badge-active' : 'badge-inactive'}`}>
              {product.isActive ? 'Activo' : 'Inactivo'}
            </span>
            {product.code && <span className="card__subtitle" style={{ margin: 0 }}>Código: {product.code}</span>}
          </div>
        </div>

        <div className="detail-section">
          <div className="detail-section__label">ID</div>
          <div className="detail-section__value">{product.id}</div>
        </div>
        <div className="detail-section">
          <div className="detail-section__label">Categoría</div>
          <div className="detail-section__value">{product.category?.name ?? product.categoryId}</div>
        </div>
        {product.description && (
          <div className="detail-section">
            <div className="detail-section__label">Descripción</div>
            <div className="detail-section__value">{product.description}</div>
          </div>
        )}
        {product.about && product.about.length > 0 && (
          <div className="detail-section">
            <div className="detail-section__label">Puntos destacados</div>
            <ul className="detail-about-list">
              {product.about.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {canManageProducts && token && (
          <div className="detail-section" style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            {toggleError && <p className="error">{toggleError}</p>}
            <button
              type="button"
              className={`btn ${product.isActive ? '' : 'btn-primary'}`}
              onClick={handleToggleActive}
              disabled={toggling}
            >
              {toggling ? '…' : product.isActive ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
