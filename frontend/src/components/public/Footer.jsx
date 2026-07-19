// src/components/public/Footer.jsx
import { Link } from 'react-router-dom';
import { Instagram, Mail, Zap } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-dark text-white mt-16 border-t border-white/10">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="font-display text-xl font-bold">{settings.businessName || 'Ventech'}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Catálogo tech con accesorios, audio, gaming y más para comprar o revender.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Navegar</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Inicio' },
                { to: '/catalogo', label: 'Catálogo' },
                { to: '/categorias', label: 'Categorías' },
                { to: '/consulta', label: 'Mi Consulta' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Contacto</h4>
            <div className="space-y-3">
              {settings.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-whatsapp transition-colors"
                >
                  <span className="text-lg">📱</span>
                  WhatsApp
                </a>
              )}
              {settings.instagram && (
                <a
                  href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-pink-400 transition-colors"
                >
                  <Instagram size={16} />
                  {settings.instagram}
                </a>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Mail size={16} />
                  {settings.email}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-slate-500 text-xs">
          © {new Date().getFullYear()} {settings.businessName || 'Ventech'}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
