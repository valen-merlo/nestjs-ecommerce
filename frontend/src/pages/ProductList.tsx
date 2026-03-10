import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, createProduct, activateProduct, deactivateProduct } from '../api/products';
import { getCategories, createCategory } from '../api/categories';
import type { Product, Category } from '../api/types';
import { ActivityFeed } from '../components/ActivityFeed';
import { LoginRequired } from '../components/LoginRequired';
import { useAuth } from '../context/AuthContext';

function loadProducts(
  setProducts: (p: Product[]) => void,
  setLoading: (v: boolean) => void,
  setError: (s: string | null) => void,
) {
  setLoading(true);
  setError(null);
  getProducts()
    .then((data) => {
      const list = data != null && Array.isArray(data) ? data : [];
      setProducts(list);
    })
    .catch((e) => {
      setError(e instanceof Error ? e.message : 'Error al cargar productos');
    })
    .finally(() => setLoading(false));
}

export function ProductList() {
  const { token, isAuthenticated, user, canManageProducts } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createCategoryId, setCreateCategoryId] = useState(1);
  const [createTitle, setCreateTitle] = useState('');
  const [createCode, setCreateCode] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createAbout, setCreateAbout] = useState('');
  const [createAsActive, setCreateAsActive] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryId, setNewCategoryId] = useState(3);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryCreateLoading, setCategoryCreateLoading] = useState(false);
  const [categoryCreateError, setCategoryCreateError] = useState<string | null>(null);
  const [categoryCreateSuccess, setCategoryCreateSuccess] = useState(false);
  const [showCreateCategoryForm, setShowCreateCategoryForm] = useState(false);
  const [showCreateProductForm, setShowCreateProductForm] = useState(false);

  const refreshCatalog = React.useCallback(() => {
    loadProducts(setProducts, setLoading, setError);
  }, []);

  const handleCreateProduct = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token) return;
      const aboutArr = createAbout
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (!createTitle.trim() || !createDescription.trim() || aboutArr.length === 0) {
        setCreateError('Título, descripción y al menos un ítem en About son obligatorios.');
        return;
      }
      setCreateLoading(true);
      setCreateError(null);
      setCreateSuccess(false);
      try {
        const product = await createProduct(
          {
            categoryId: createCategoryId,
            title: createTitle.trim(),
            code: createCode.trim() || `COD-${Date.now()}`,
            description: createDescription.trim(),
            about: aboutArr,
            variationType: 'NONE',
          },
          token,
        );
        if (createAsActive && product?.id) {
          await activateProduct(product.id, token);
        }
        setCreateSuccess(true);
        setCreateTitle('');
        setCreateCode('');
        setCreateDescription('');
        setCreateAbout('');
        refreshCatalog();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al crear producto';
        const isForbidden = /not allowed|401|Unauthorized/i.test(msg);
        setCreateError(
          isForbidden
            ? 'Solo usuarios Admin o Merchant pueden crear productos. Inicia sesión con admin@admin.com para probar.'
            : msg,
        );
      } finally {
        setCreateLoading(false);
      }
    },
    [token, createCategoryId, createTitle, createCode, createDescription, createAbout, createAsActive, refreshCatalog],
  );

  const handleToggleActive = React.useCallback(
    async (p: Product) => {
      if (!token) return;
      setTogglingId(p.id);
      setToggleError(null);
      try {
        if (p.isActive) {
          await deactivateProduct(p.id, token);
        } else {
          await activateProduct(p.id, token);
        }
        setToggleError(null);
        refreshCatalog();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al cambiar estado';
        const isForbidden = /not allowed|401|Unauthorized/i.test(msg);
        setToggleError(
          isForbidden
            ? 'Solo usuarios Admin o Merchant pueden activar/desactivar. Inicia sesión con admin@admin.com para probar.'
            : msg,
        );
      } finally {
        setTogglingId(null);
      }
    },
    [token, refreshCatalog],
  );

  const fetchCategories = React.useCallback(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const handleCreateCategory = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token || !newCategoryName.trim()) return;
      setCategoryCreateLoading(true);
      setCategoryCreateError(null);
      setCategoryCreateSuccess(false);
      try {
        await createCategory({ id: newCategoryId, name: newCategoryName.trim() }, token);
        setCategoryCreateSuccess(true);
        setNewCategoryName('');
        setNewCategoryId((prev) => prev + 1);
        fetchCategories();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al crear categoría (solo Admin)';
        const isForbidden = /not allowed|401|Unauthorized/i.test(msg);
        setCategoryCreateError(
          isForbidden
            ? 'Solo usuarios Admin pueden crear categorías. Inicia sesión con admin@admin.com para probar.'
            : msg,
        );
      } finally {
        setCategoryCreateLoading(false);
      }
    },
    [token, newCategoryId, newCategoryName, fetchCategories],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProducts()
      .then((data) => {
        if (cancelled) return;
        const list = data != null && Array.isArray(data) ? data : [];
        setProducts(list);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar productos');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (canManageProducts) fetchCategories();
  }, [fetchCategories, canManageProducts]);

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

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Catálogo de productos</h1>
        <p className="page-subtitle">
          {canManageProducts
            ? 'Si creas un producto desde aquí, el listado se actualiza solo. Si creas por API o Postman, usa el botón para refrescar el catálogo.'
            : 'Listado de productos. Refresca para ver cambios.'}
        </p>
      </div>

      <div className={canManageProducts ? 'main-grid' : ''}>
        <main className="main-content">
          <div className="toolbar">
            <button
              type="button"
              className="btn btn-primary"
              onClick={refreshCatalog}
              disabled={loading}
            >
              {loading ? 'Cargando…' : 'Refrescar catálogo'}
            </button>
          </div>

          {canManageProducts && token && (
            <>
              <div className="toolbar" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowCreateCategoryForm((v) => !v);
                    if (showCreateProductForm) setShowCreateProductForm(false);
                  }}
                  aria-expanded={showCreateCategoryForm}
                >
                  {showCreateCategoryForm ? 'Ocultar formulario categoría' : '+ Crear categoría'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowCreateProductForm((v) => !v);
                    if (showCreateCategoryForm) setShowCreateCategoryForm(false);
                  }}
                  aria-expanded={showCreateProductForm}
                >
                  {showCreateProductForm ? 'Ocultar formulario producto' : '+ Crear producto'}
                </button>
              </div>

              {showCreateCategoryForm && (
                <div className="card" style={{ maxWidth: '28rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 className="card__title" style={{ marginBottom: 0 }}>Crear categoría</h3>
                    <button type="button" className="btn btn-sm" onClick={() => setShowCreateCategoryForm(false)} aria-label="Cerrar">
                      Cerrar
                    </button>
                  </div>
                  <p className="card__subtitle">
                    Solo usuarios con rol Admin pueden crear categorías. El id debe ser un número que no exista (ej. 3, 4…).
                  </p>
                  <form onSubmit={handleCreateCategory}>
                    <div className="form-group">
                      <label htmlFor="newCategoryId">ID de la categoría</label>
                      <input
                        id="newCategoryId"
                        type="number"
                        min={1}
                        value={newCategoryId}
                        onChange={(e) => setNewCategoryId(Number(e.target.value) || 1)}
                        style={{ maxWidth: '8rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="newCategoryName">Nombre</label>
                      <input
                        id="newCategoryName"
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Ej. Electronics"
                      />
                    </div>
                    {categoryCreateError && <p className="error">{categoryCreateError}</p>}
                    {categoryCreateSuccess && <p className="success-msg">Categoría creada. Ya puedes elegirla al crear un producto.</p>}
                    <button type="submit" className="btn btn-primary" disabled={categoryCreateLoading}>
                      {categoryCreateLoading ? 'Creando…' : 'Crear categoría'}
                    </button>
                  </form>
                </div>
              )}

              {showCreateProductForm && (
                <div className="card" style={{ maxWidth: '28rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 className="card__title" style={{ marginBottom: 0 }}>Crear producto</h3>
                    <button type="button" className="btn btn-sm" onClick={() => setShowCreateProductForm(false)} aria-label="Cerrar">
                      Cerrar
                    </button>
                  </div>
                  <p className="card__subtitle">
                    Completa todos los campos; el producto podrás activarlo o desactivarlo con el botón en la ficha.
                  </p>
                  <form onSubmit={handleCreateProduct}>
                    <div className="form-group">
                      <label htmlFor="categoryId">Categoría *</label>
                      <select
                        id="categoryId"
                        value={createCategoryId}
                        onChange={(e) => setCreateCategoryId(Number(e.target.value))}
                      >
                        {categories.length > 0
                          ? categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.id} – {c.name}</option>
                            ))
                          : (
                            <>
                              <option value={1}>1 – Computers</option>
                              <option value={2}>2 – Fashion</option>
                            </>
                          )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="createTitle">Título *</label>
                      <input
                        id="createTitle"
                        type="text"
                        value={createTitle}
                        onChange={(e) => setCreateTitle(e.target.value)}
                        placeholder="Ej. Mi producto"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="createCode">Código (opcional)</label>
                      <input
                        id="createCode"
                        type="text"
                        value={createCode}
                        onChange={(e) => setCreateCode(e.target.value)}
                        placeholder="Ej. COD-001"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="createDescription">Descripción *</label>
                      <input
                        id="createDescription"
                        type="text"
                        value={createDescription}
                        onChange={(e) => setCreateDescription(e.target.value)}
                        placeholder="Descripción del producto"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="createAbout">Puntos destacados o características *</label>
                      <input
                        id="createAbout"
                        type="text"
                        value={createAbout}
                        onChange={(e) => setCreateAbout(e.target.value)}
                        placeholder="Ej: Pantalla 15 pulgadas, 8 GB RAM, WiFi"
                      />
                      <p className="card__subtitle" style={{ marginTop: '0.25rem', marginBottom: 0 }}>
                        Al menos un ítem. Si pones varios, sepáralos con coma.
                      </p>
                    </div>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={createAsActive}
                          onChange={(e) => setCreateAsActive(e.target.checked)}
                        />
                        Crear como activo
                      </label>
                    </div>
                    {createError && <p className="error">{createError}</p>}
                    {createSuccess && <p className="success-msg">Producto creado. Usa Activar/Desactivar en la ficha para cambiar el estado.</p>}
                    <button type="submit" className="btn btn-primary btn--block" disabled={createLoading}>
                      {createLoading ? 'Creando…' : 'Crear producto'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

          {loading && products.length === 0 && (
            <div className="loading-placeholder">Cargando productos…</div>
          )}
          {error && <p className="error">{error}</p>}
          {!loading && !error && products.length === 0 && (
            <div className="empty-state">
              No hay productos. El listado se obtiene del backend (GET /product).
            </div>
          )}
          {toggleError && <p className="error">{toggleError}</p>}

          {!loading && products.length > 0 && (
            <div className="product-grid">
              {products.map((p) => (
                <div key={p.id} className="product-card">
                  <Link to={`/product/${p.id}`} className="product-card__link">
                    <h3 className="product-card__title">{p.title || `Producto #${p.id}`}</h3>
                    <div className="product-card__meta">
                      ID: {p.id} · {p.category?.name ?? `Categoría ${p.categoryId}`}
                    </div>
                    <span className={`badge ${p.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {p.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </Link>
                  {canManageProducts && token && (
                    <div className="product-card__actions">
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleActive(p);
                        }}
                        disabled={togglingId === p.id}
                      >
                        {togglingId === p.id ? '…' : p.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        {canManageProducts && (
          <aside className="sidebar">
            <ActivityFeed />
          </aside>
        )}
      </div>
    </div>
  );
}
