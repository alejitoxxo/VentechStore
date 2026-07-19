// src/pages/admin/AdminSettingsPage.jsx
import { useState, useEffect } from 'react';
import { Save, Settings, Store, MessageCircle, Palette } from 'lucide-react';
import { getSettings, updateSettings } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    businessName: '',
    whatsappNumber: '',
    instagram: '',
    email: '',
    showOutOfStock: 'false',
    whatsappMessage: '',
    mode: 'minorista',
    accentColor: '#0898B5',
    logoUrl: '',
    bannerUrl: '',
    heroTitle: '',
    heroSubtitle: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then(r => setForm(prev => ({ ...prev, ...r.data })))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? String(checked) : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(form);
      toast.success('Configuración guardada');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-2xl space-y-4">
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-dark">Configuración</h1>
        <p className="text-muted text-sm">Personalizá tu tienda Ventech</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Negocio */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-dark flex items-center gap-2">
            <Store size={16} className="text-primary" /> Datos del negocio
          </h3>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Nombre del negocio</label>
            <input type="text" name="businessName" value={form.businessName} onChange={handleChange} className="input" placeholder="Ventech" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Email de contacto</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="input" placeholder="ventech@gmail.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Instagram</label>
            <input type="text" name="instagram" value={form.instagram} onChange={handleChange} className="input" placeholder="@ventech" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Modo de venta</label>
            <select name="mode" value={form.mode} onChange={handleChange} className="input">
              <option value="minorista">Minorista</option>
              <option value="mayorista">Mayorista</option>
              <option value="ambos">Minorista y Mayorista</option>
            </select>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-dark flex items-center gap-2">
            <MessageCircle size={16} className="text-whatsapp" /> WhatsApp
          </h3>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Número de WhatsApp</label>
            <input type="text" name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange}
              className="input font-mono" placeholder="5491100000000" />
            <p className="text-xs text-muted mt-1">Formato: código de país + código de área + número (sin +, espacios ni guiones). Ej: 5492236123456</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Texto de introducción del pedido</label>
            <textarea name="whatsappMessage" value={form.whatsappMessage} onChange={handleChange}
              className="input resize-none" rows={3}
              placeholder="Hola, quiero consultar por estos productos:" />
          </div>
        </div>

        {/* Catálogo */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-dark flex items-center gap-2">
            <Settings size={16} className="text-primary" /> Catálogo
          </h3>
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all hover:border-primary/30">
            <input
              type="checkbox"
              name="showOutOfStock"
              checked={form.showOutOfStock === 'true'}
              onChange={e => setForm(prev => ({ ...prev, showOutOfStock: String(e.target.checked) }))}
              className="mt-0.5 accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-dark">Mostrar productos sin stock</p>
              <p className="text-xs text-muted">Si está activo, los productos sin stock se verán en el catálogo pero con esa indicación</p>
            </div>
          </label>
        </div>

        {/* Apariencia */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-dark flex items-center gap-2">
            <Palette size={16} className="text-primary" /> Apariencia y Diseño
          </h3>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Color de acento</label>
            <div className="flex items-center gap-3">
              <input type="color" name="accentColor" value={form.accentColor} onChange={handleChange}
                className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer" />
              <input type="text" name="accentColor" value={form.accentColor} onChange={handleChange}
                className="input font-mono w-36" placeholder="#0898B5" />
              <div className="w-10 h-10 rounded-lg border border-gray-200" style={{ background: form.accentColor }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">URL del Logo Comercial</label>
            <input type="text" name="logoUrl" value={form.logoUrl || ''} onChange={handleChange}
              className="input font-mono text-sm" placeholder="https://ejemplo.com/logo.png" />
            <p className="text-xs text-muted mt-1">Ingresá un link directo a la imagen. Si queda vacío, se usará el logo por defecto.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">URL del Banner Principal (Hero)</label>
            <input type="text" name="bannerUrl" value={form.bannerUrl || ''} onChange={handleChange}
              className="input font-mono text-sm" placeholder="https://ejemplo.com/banner.jpg" />
            <p className="text-xs text-muted mt-1">Link directo a la imagen de fondo del Hero del inicio.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Título del Hero Principal</label>
            <input type="text" name="heroTitle" value={form.heroTitle || ''} onChange={handleChange}
              className="input" placeholder="Todo lo que necesitás en tech" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Subtítulo del Hero Principal</label>
            <textarea name="heroSubtitle" value={form.heroSubtitle || ''} onChange={handleChange}
              className="input resize-none" rows={2} placeholder="Accesorios, audio, gaming, cables..." />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3 text-base">
          {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
          Guardar configuración
        </button>
      </form>
    </div>
  );
}
