// src/pages/public/ProductPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, MessageCircle, ArrowLeft, Package } from 'lucide-react';
import { getProduct } from '../../services/api';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { formatPrice, getImageUrl } from '../../utils/format';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { id } = useParams();
  const { settings } = useSettings();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getProduct(id)
      .then(res => setProduct(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    addItem(product);
    toast.success('Agregado a tu consulta');
  };

  const handleWA = () => {
    const phone = settings.whatsappNumber?.replace(/\D/g, '');
    const msg = `Hola! Quiero consultar por:\nCódigo: ${product.code}\nProducto: ${product.name}\nPrecio: ${formatPrice(product.price)}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return (
    <div className="page-container py-12 max-w-4xl">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square shimmer rounded-2xl" />
        <div className="space-y-4">
          <div className="h-4 w-20 shimmer rounded" />
          <div className="h-8 shimmer rounded" />
          <div className="h-6 w-32 shimmer rounded" />
          <div className="h-20 shimmer rounded" />
        </div>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="page-container py-20 text-center">
      <Package size={64} className="text-gray-300 mx-auto mb-4" />
      <h1 className="font-display text-2xl font-bold mb-2">Producto no encontrado</h1>
      <p className="text-muted mb-6">Este producto no existe o fue eliminado.</p>
      <Link to="/catalogo" className="btn-primary">Ver catálogo</Link>
    </div>
  );

  const imgUrl = getImageUrl(product.imageUrl);

  return (
    <div className="page-container py-8 max-w-5xl">
      <Link to="/catalogo" className="btn-ghost mb-6 inline-flex">
        <ArrowLeft size={16} /> Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-white rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden">
          {imgUrl ? (
            <img src={imgUrl} alt={product.name} className="w-full h-full object-contain p-8" />
          ) : (
            <Package size={80} className="text-gray-300" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-sm text-muted">#{product.code}</span>
            {product.category && (
              <Link
                to={`/catalogo/${product.category.slug}`}
                className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
              >
                {product.category.name}
              </Link>
            )}
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-dark mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-dark font-display">
              {formatPrice(product.price)}
            </span>
            <span className={`badge ${product.inStock ? 'badge-green' : 'badge-red'}`}>
              {product.inStock ? 'Disponible' : 'Sin stock'}
            </span>
          </div>

          {product.shortDescription && (
            <p className="text-muted mb-4 leading-relaxed">{product.shortDescription}</p>
          )}
          {product.description && (
            <p className="text-dark/70 text-sm mb-6 leading-relaxed">{product.description}</p>
          )}

          <div className="flex flex-col gap-3 mt-auto">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className={`btn-primary justify-center py-3 text-base ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ShoppingCart size={18} />
              {product.inStock ? 'Agregar a consulta' : 'Sin stock'}
            </button>
            <button onClick={handleWA} className="btn-whatsapp justify-center py-3 text-base">
              <MessageCircle size={18} />
              Consultar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
