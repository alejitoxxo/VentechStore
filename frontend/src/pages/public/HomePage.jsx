// src/pages/public/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  Shield,
  Headphones,
  ChevronRight,
  PackageCheck,
  Search,
} from 'lucide-react';
import { getProducts, getCategories } from '../../services/api';
import ProductCard from '../../components/public/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import { useSettings } from '../../hooks/useSettings';
import defaultHeroBanner from '../../assets/ventech-sky-hero.jpg';

const CATEGORY_EMOJIS = {
  auriculares: '🎧',
  cables: '🔌',
  parlantes: '🔊',
  gaming: '🎮',
  celulares: '📱',
  cargadores: '⚡',
  accesorios: '🛍️',
  teclados: '⌨️',
};

function getCategoryEmoji(slug) {
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (slug?.includes(key)) return emoji;
  }
  return '📦';
}

export default function HomePage() {
  const { settings } = useSettings();
  const [featured, setFeatured] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);

  useEffect(() => {
    getProducts({ featured: true, limit: 8 })
      .then(res => setFeatured(res.data.products))
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false));

    getProducts({ isNew: true, limit: 8 })
      .then(res => setNewProducts(res.data.products))
      .catch(() => setNewProducts([]))
      .finally(() => setLoadingNew(false));

    getCategories()
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const phone = settings.whatsappNumber?.replace(/\D/g, '');
  const infoMessage = encodeURIComponent('Hola! Quiero más información sobre sus productos.');
  const resellerMessage = encodeURIComponent('Hola! Me interesa información para revendedores.');

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-dark overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={settings.bannerUrl || defaultHeroBanner}
            alt="Ventech"
            className="w-full h-full object-cover opacity-75 object-[center_35%]"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallbackBg = e.target.nextSibling;
              if (fallbackBg) fallbackBg.style.display = 'block';
            }}
          />
          <div className="absolute inset-0 hidden bg-gradient-to-br from-dark via-petroleum to-primary/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/80 to-petroleum/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-dark/35" />
        </div>
        <div
          className="absolute inset-0 opacity-55"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        <div className="relative page-container min-h-[560px] md:min-h-[620px] py-14 md:py-20 flex items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-primary-50 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-white/15 backdrop-blur">
              <Zap size={14} fill="currentColor" />
              Ventech | tecnología a tu alcance
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              {settings.heroTitle ? (
                settings.heroTitle
              ) : (
                <>
                  Catálogo tech
                  <br />
                  <span className="text-primary-100">listo para vender</span>
                </>
              )}
            </h1>
            <p className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
              {settings.heroSubtitle ||
                'Accesorios, audio, gaming, cables, cargadores y más. Una vidriera simple, clara y directa para que tus clientes encuentren rápido lo que buscan.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/catalogo" className="btn-primary text-base px-6 py-3">
                Ver catálogo completo
                <ArrowRight size={18} />
              </Link>
              {phone && (
                <a
                  href={`https://wa.me/${phone}?text=${infoMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-lg border border-white/15 backdrop-blur hover:bg-white/15 transition-all duration-200 active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              {[
                { icon: PackageCheck, label: 'Stock consultable' },
                { icon: Search, label: 'Búsqueda rápida' },
                { icon: Shield, label: 'Productos garantizados' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-slate-100 backdrop-blur">
                  <Icon size={16} className="text-primary-100" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="relative border-t border-white/10 bg-dark/70 backdrop-blur">
          <div className="page-container py-4">
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              {[
                { icon: Shield, text: 'Productos garantizados' },
                { icon: Zap, text: 'Envío rápido' },
                { icon: Headphones, text: 'Soporte por WhatsApp' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-slate-300 text-sm">
                  <Icon size={16} className="text-primary-100" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-14 page-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Categorías</h2>
            <Link to="/categorias" className="btn-ghost text-sm">
              Ver todas <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.slice(0, 6).map(cat => (
              <Link
                key={cat.id}
                to={`/catalogo/${cat.slug}`}
                className="card p-4 flex flex-col items-center gap-2 text-center hover:border-primary/40 hover:shadow-md group transition-all"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {getCategoryEmoji(cat.slug)}
                </span>
                <span className="text-xs font-semibold text-dark leading-tight">{cat.name}</span>
                <span className="text-xs text-muted">{cat._count?.products || 0} productos</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="py-14 bg-white border-y border-slate-200/70">
        <div className="page-container">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="section-title">Destacados</h2>
              <p className="text-muted text-sm mt-1">Productos fuertes para mostrar primero.</p>
            </div>
            <Link to="/catalogo?featured=true" className="btn-ghost text-sm">
              Ver más <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {loadingFeatured
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      </section>

      {/* New arrivals */}
      {(newProducts.length > 0 || loadingNew) && (
        <section className="py-14 page-container">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="section-title">Novedades</h2>
              <p className="text-muted text-sm mt-1">Últimos ingresos del catálogo.</p>
            </div>
            <Link to="/catalogo?isNew=true" className="btn-ghost text-sm">
              Ver más <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {loadingNew
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : newProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-14 bg-dark text-white">
        <div className="page-container text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-3">
            ¿Sos revendedor?
          </h2>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            Consultá por precios mayoristas y disponibilidad de stock directamente por WhatsApp.
          </p>
          {phone && (
            <a
              href={`https://wa.me/${phone}?text=${resellerMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Contactar ahora
              <ArrowRight size={18} />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
