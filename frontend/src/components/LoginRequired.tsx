import React from 'react';
import { Link } from 'react-router-dom';

export function LoginRequired() {
  return (
    <div className="login-required">
      <div className="login-required__card card">
        <h2 className="card__title">Debes iniciar sesión</h2>
        <p className="card__subtitle">
          Inicia sesión o regístrate para ver el catálogo y el contenido.
        </p>
        <div className="login-required__actions">
          <Link to="/login" className="btn btn-primary">
            Iniciar sesión
          </Link>
          <Link to="/register" className="btn">
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}
