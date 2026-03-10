import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';

function Nav() {
  const { isAuthenticated, logout } = useAuth();
  return (
    <header className="nav">
      <div className="nav__brand">
        <Link to="/">Catálogo</Link>
      </div>
      <div className="nav__links">
        {isAuthenticated && (
          <button type="button" className="btn btn--ghost btn-sm" onClick={logout}>
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  );
}

function App() {
  return (
    <div className="app-layout">
      <Nav />
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
