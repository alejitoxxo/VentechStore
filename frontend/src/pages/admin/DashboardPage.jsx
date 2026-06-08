// src/pages/admin/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, CheckCircle, XCircle, AlertCircle,
  Tag, Star, Clock, ArrowRight
} from 'lucide-react';
import { getDashboardStats } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/format';
import { StatSkeleton } from '../../components/ui/Skeleton';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-muted font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="font-display text-3xl font-bold text-dark">{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-dark">Dashboard</h1>
        <p className="text-muted text-sm">Resumen de tu tienda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={Package} label="Total productos" value={stats.totalProducts}
              color="bg-blue-50 text-blue-600" />
            <StatCard icon={CheckCircle} label="Activos" value={stats.activeProducts}
              color="bg-emerald-50 text-emerald-600"
              sub={`${stats.totalProducts ? Math.round(stats.activeProducts / stats.totalProducts * 100) : 0}% del total`} />
            <StatCard icon={AlertCircle} label="Sin stock" value={stats.outOfStock}
              color="bg-amber-50 text-amber-600" />
            <StatCard icon={XCircle} label="Inactivos" value={stats.inactiveProducts}
              color="bg-red-50 text-red-600" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard icon={Tag} label="Categorías" value={stats.totalCategories}
              color="bg-purple-50 text-purple-600" />
            <StatCard icon={Star} label="Destacados" value={stats.featuredProducts}
              color="bg-yellow-50 text-yellow-600" />
          </>
        )}
      </div>

      {/* Recent products */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted" />
            <h2 className="font-semibold text-dark">Últimos productos agregados</h2>
          </div>
          <Link to="/admin/productos" className="btn-ghost text-sm">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex gap-3">
                <div className="w-10 h-10 shimmer rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 shimmer rounded w-48" />
                  <div className="h-3 shimmer rounded w-24" />
                </div>
              </div>
            ))
          ) : stats?.recentProducts?.length === 0 ? (
            <p className="p-8 text-center text-muted text-sm">No hay productos aún</p>
          ) : (
            stats?.recentProducts?.map(p => (
              <div key={p.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted">{p.category?.name} · {formatDate(p.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-dark">{formatPrice(p.price)}</p>
                  <span className={`badge text-xs ${p.inStock ? 'badge-green' : 'badge-red'}`}>
                    {p.inStock ? 'Con stock' : 'Sin stock'}
                  </span>
                </div>
                <Link to={`/admin/productos/${p.id}/editar`} className="btn-ghost p-1.5 ml-2">
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/admin/productos/nuevo', label: 'Nuevo producto', icon: '➕' },
          { to: '/admin/categorias', label: 'Categorías', icon: '🏷️' },
          { to: '/admin/importar', label: 'Importar CSV/JSON', icon: '📤' },
          { to: '/admin/configuracion', label: 'Configuración', icon: '⚙️' },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="card p-4 flex flex-col items-center gap-2 text-center hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="text-xs font-semibold text-dark">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
