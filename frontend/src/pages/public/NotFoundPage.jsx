// src/pages/public/NotFoundPage.jsx
import { Link } from 'react-router-dom';
import { Home, Zap } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center px-4">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Zap size={36} className="text-primary" />
        </div>
        <h1 className="font-display text-8xl font-extrabold text-dark/10 mb-2">404</h1>
        <h2 className="font-display text-2xl font-bold text-dark mb-3">Página no encontrada</h2>
        <p className="text-muted mb-8 max-w-sm mx-auto">
          La página que buscás no existe o fue movida a otro lugar.
        </p>
        <Link to="/" className="btn-primary">
          <Home size={18} />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
