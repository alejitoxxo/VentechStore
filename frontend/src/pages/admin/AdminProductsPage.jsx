// src/pages/admin/AdminProductsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff,
  Package, ToggleLeft, ToggleRight, Star, RefreshCw
} from 'lucide-react';
import {
  getAdminProducts, deleteProduct,
  toggleProductActive, toggleProductStock, toggleProductFeatured,
  getAdminCategories
} from '../../services/api';
import { formatPrice } from '../../utils/format';
import { TableSkeleton } from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.search = search;
    if (categoryFilter) params.category = categoryFilter;
    if (activeFilter !== '') params.active = activeFilter;
    if (stockFilter !== '') params.inStock = stockFilter;

    getAdminProducts(params)
      .then(r => { setProducts(r.data.products); setPagination(r.data.pagination); })
      .finally(() => setLoading(false));
  }, [search, categoryFilter, activeFilter, stockFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { getAdminCategories().then(r => setCategories(r.data)); }, []);

  const handleToggleActive = async (id) => {
    try {
      await toggleProductActive(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    } catch { toast.error('Error al cambiar estado'); }
  };

  const handleToggleStock = async (id) => {
    try {
      await toggleProductStock(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
    } catch { toast.error('Error al cambiar stock'); }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await toggleProductFeatured(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, featured: !p.featured } : p));
    } catch { toast.error('Error'); }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(confirm.id);
      toast.success('Producto eliminado');
      setConfirm(null);
      fetchProducts();
    } catch { toast.error('Error al eliminar'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark">Productos</h1>
          {pagination.total !== undefined && (
            <p className="text-muted text-sm">{pagination.total} productos en total</p>
          )}
        </div>
        <Link to="/admin/productos/nuevo" className="btn-primary">
          <Plus size={16} /> Nuevo producto
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9"
          />
        </div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="input w-auto min-w-40">
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">Estado: todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <select value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">Stock: todos</option>
          <option value="true">Con stock</option>
          <option value="false">Sin stock</option>
        </select>
        <button onClick={fetchProducts} className="btn-ghost">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4"><TableSkeleton rows={8} cols={6} /></div>
        ) : products.length === 0 ? (
          <EmptyState title="Sin productos" description="No hay productos que coincidan con los filtros." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Precio</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide hidden sm:table-cell">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide hidden sm:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide hidden lg:table-cell">Dest.</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted">{p.code}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-dark text-sm line-clamp-1 max-w-[200px]">{p.name}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs badge-blue">{p.category?.name}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-sm">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <button
                        onClick={() => handleToggleActive(p.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${p.active ? 'text-emerald-600 hover:text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}
                        title={p.active ? 'Click para desactivar' : 'Click para activar'}
                      >
                        {p.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        {p.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <button
                        onClick={() => handleToggleStock(p.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${p.inStock ? 'text-emerald-600 hover:text-emerald-700' : 'text-red-500 hover:text-red-600'}`}
                        title="Click para cambiar stock"
                      >
                        {p.inStock ? '✓ Stock' : '✗ Sin stock'}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <button
                        onClick={() => handleToggleFeatured(p.id)}
                        className={`transition-colors ${p.featured ? 'text-amber-500 hover:text-amber-400' : 'text-gray-300 hover:text-amber-400'}`}
                        title="Destacado"
                      >
                        <Star size={16} fill={p.featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/productos/${p.id}/editar`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => setConfirm({ id: p.id, name: p.name })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!confirm}
        title="Eliminar producto"
        message={`¿Seguro que querés eliminar "${confirm?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
