// src/pages/public/CatalogPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { getProducts, getCategories } from '../../services/api';
import ProductCard from '../../components/public/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';

export default function CatalogPage() {
  const { slug: categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = categorySlug || searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortDir = searchParams.get('sortDir') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');
  const featured = searchParams.get('featured') || '';
  const isNew = searchParams.get('isNew') || '';

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 24, sortBy, sortDir };
    if (search) params.search = search;
    if (category) params.category = category;
    if (featured) params.featured = featured;
    if (isNew) params.isNew = isNew;

    getProducts(params)
      .then(res => {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [search, category, sortBy, sortDir, page, featured, isNew]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { getCategories().then(r => setCategories(r.data)); }, []);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeFiltersCount = [search, category, sortBy !== 'createdAt', featured, isNew].filter(Boolean).length;

  const currentCat = categories.find(c => c.slug === category);

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">
          {currentCat ? currentCat.name : featured ? '⭐ Destacados' : isNew ? '✨ Novedades' : 'Catálogo'}
        </h1>
        {pagination.total !== undefined && (
          <p className="text-muted text-sm">{pagination.total} productos encontrados</p>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        {/* Search */}
        <div className="flex-1 min-w-48">
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={e => updateParam('search', e.target.value)}
            className="input"
          />
        </div>

        {/* Category */}
        {!categorySlug && (
          <select
            value={category}
            onChange={e => updateParam('category', e.target.value)}
            className="input w-auto min-w-40"
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        )}

        {/* Sort */}
        <select
          value={`${sortBy}-${sortDir}`}
          onChange={e => {
            const [sb, sd] = e.target.value.split('-');
            const next = new URLSearchParams(searchParams);
            next.set('sortBy', sb);
            next.set('sortDir', sd);
            next.delete('page');
            setSearchParams(next);
          }}
          className="input w-auto min-w-48"
        >
          <option value="createdAt-desc">Más recientes</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name-asc">Nombre A-Z</option>
          <option value="name-desc">Nombre Z-A</option>
        </select>

        {/* Clear */}
        {activeFiltersCount > 0 && (
          <button onClick={clearFilters} className="btn-ghost text-sm text-red-500 hover:text-red-600 hover:bg-red-50">
            <X size={15} /> Limpiar
          </button>
        )}
      </div>

      {/* Category chips */}
      {!categorySlug && categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => updateParam('category', '')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!category ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-muted hover:border-primary hover:text-primary'}`}
          >
            Todos
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => updateParam('category', c.slug)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${category === c.slug ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-muted hover:border-primary hover:text-primary'}`}
            >
              {c.name}
              <span className="ml-1.5 opacity-60 text-xs">({c._count?.products || 0})</span>
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="Sin productos"
          description="No encontramos productos con esos filtros. Intentá con otros términos."
          action={<button onClick={clearFilters} className="btn-primary">Limpiar filtros</button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={p => updateParam('page', p)} />
        </>
      )}
    </div>
  );
}
