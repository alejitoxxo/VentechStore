// src/components/public/ProductCard.jsx
import { Link } from 'react-router-dom';
import { ShoppingCart, MessageCircle, Package, Star, Sparkles } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { formatPrice, getImageUrl } from '../../utils/format';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { settings } = useSettings();

  const handleAdd = (e) => {
    e.preventDefault();
    if (!product.inStock) return;
    addItem(product);
    toast.success(`${product.name.slice(0, 30)}... agregado`);
  };

  const handleWA = (e) => {
    e.preventDefault();
    const phone = settings.whatsappNumber?.replace(/\D/g, '');
    const msg = `Hola! Quiero consultar por:\nCódigo: ${product.code}\nProducto: ${product.name}\nPrecio: ${formatPrice(product.price)}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const imgUrl = getImageUrl(product.imageUrl);

  return (
    <Link to={`/producto/${product.id}`} className="card flex flex-col group overflow-hidden animate-fade-in hover:border-primary/30">
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div
          className={`${imgUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}
          style={{ display: imgUrl ? 'none' : 'flex' }}
        >
          <Package size={48} className="text-gray-300" />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="badge-cyan text-xs flex items-center gap-1">
              <Sparkles size={10} /> Nuevo
            </span>
          )}
          {product.featured && (
            <span className="badge-yellow text-xs flex items-center gap-1">
              <Star size={10} /> Destacado
            </span>
          )}
        </div>

        {/* Stock badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="badge-red text-sm px-3 py-1">Sin stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-muted mb-1 font-mono">{product.code}</p>
        {product.category && (
          <p className="text-xs text-primary font-semibold uppercase mb-2">
            {product.category.name}
          </p>
        )}
        <h3 className="text-sm font-semibold text-dark leading-tight mb-3 flex-1 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-dark font-display">
            {formatPrice(product.price)}
          </span>
          <span className={`badge ${product.inStock ? 'badge-green' : 'badge-red'}`}>
            {product.inStock ? 'Disponible' : 'Sin stock'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              product.inStock
                ? 'bg-primary text-white hover:bg-primary-600 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={13} />
            Agregar
          </button>
          <button
            onClick={handleWA}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-whatsapp/10 text-whatsapp hover:bg-whatsapp hover:text-white transition-all active:scale-95"
          >
            <MessageCircle size={13} />
          </button>
        </div>
      </div>
    </Link>
  );
}
