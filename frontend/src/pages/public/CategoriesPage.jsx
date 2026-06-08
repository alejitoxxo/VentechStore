// src/pages/public/CategoriesPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../services/api';
import { ChevronRight } from 'lucide-react';

const CATEGORY_EMOJIS = {
  auriculares: '🎧', cables: '🔌', parlantes: '🔊', gaming: '🎮',
  celulares: '📱', cargadores: '⚡', accesorios: '🛍️', teclados: '⌨️',
};

function getEmoji(slug) {
  for (const [k, v] of Object.entries(CATEGORY_EMOJIS)) {
    if (slug?.includes(k)) return v;
  }
  return '📦';
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container py-8">
      <h1 className="section-title mb-2">Categorías</h1>
      <p className="text-muted mb-8">Explorá nuestro catálogo por categoría</p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-6 aspect-square shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/catalogo/${cat.slug}`}
              className="card p-6 flex flex-col items-center gap-3 text-center group hover:border-primary/40 hover:shadow-md transition-all"
            >
              <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
                {getEmoji(cat.slug)}
              </span>
              <div>
                <h2 className="font-display font-bold text-dark text-sm">{cat.name}</h2>
                <p className="text-muted text-xs mt-1">{cat._count?.products || 0} productos</p>
              </div>
              <ChevronRight size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
