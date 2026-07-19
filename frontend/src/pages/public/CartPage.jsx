// src/pages/public/CartPage.jsx
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Send } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { formatPrice, getImageUrl } from '../../utils/format';
import EmptyState from '../../components/ui/EmptyState';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount, buildWhatsAppMessage, clearCart } = useCart();
  const { settings } = useSettings();

  const handleSend = () => {
    const url = buildWhatsAppMessage(settings.whatsappNumber, settings.whatsappMessage);
    window.open(url, '_blank');
  };

  return (
    <div className="page-container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Mi consulta</h1>
          {itemCount > 0 && <p className="text-muted text-sm">{itemCount} producto{itemCount !== 1 ? 's' : ''}</p>}
        </div>
        {items.length > 0 && (
          <button onClick={clearCart} className="btn-ghost text-sm text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 size={14} /> Vaciar
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Tu consulta está vacía"
          description="Agregá productos del catálogo para enviar tu consulta por WhatsApp."
          icon={ShoppingBag}
          action={<Link to="/catalogo" className="btn-primary">Ver catálogo</Link>}
        />
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {items.map(item => {
              const img = getImageUrl(item.imageUrl);
              return (
                <div key={item.id} className="card p-4 flex gap-4 items-center animate-fade-in">
                  {/* Image */}
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {img ? (
                      <img src={img} alt={item.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <ShoppingBag size={24} className="text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-muted">#{item.code}</p>
                    <p className="font-semibold text-dark text-sm leading-tight line-clamp-1">{item.name}</p>
                    <p className="text-primary font-bold text-sm">{formatPrice(item.price)}</p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[80px]">
                    <p className="font-bold text-dark text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted">Subtotal estimado</span>
              <span className="font-display text-2xl font-bold text-dark">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-muted mb-4">
              * Los precios son orientativos y pueden variar. El total final será confirmado por WhatsApp.
            </p>
            <button
              onClick={handleSend}
              className="btn-whatsapp w-full justify-center py-3 text-base"
            >
              <Send size={18} />
              Enviar consulta por WhatsApp
            </button>
          </div>
        </>
      )}
    </div>
  );
}
