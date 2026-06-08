// src/pages/admin/AdminProductFormPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Save, Package } from 'lucide-react';
import {
  createProduct, updateProduct,
  getAdminCategories, uploadImage
} from '../../services/api';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  code: '',
  name: '',
  price: '',
  categoryId: '',
  description: '',
  shortDescription: '',
  active: true,
  inStock: true,
  featured: false,
  isNew: false,
  imageUrl: '',
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    getAdminCategories().then((r) => setCategories(r.data));

    if (isEdit) {
      // Use admin endpoint so inactive products can also be edited
      api.get(`/products/admin/${id}`)
        .then((r) => {
          const p = r.data;
          setForm({
            code: p.code || '',
            name: p.name || '',
            price: p.price !== undefined ? String(p.price) : '',
            categoryId: p.categoryId ? String(p.categoryId) : '',
            description: p.description || '',
            shortDescription: p.shortDescription || '',
            active: p.active,
            inStock: p.inStock,
            featured: p.featured,
            isNew: p.isNew,
            imageUrl: p.imageUrl || '',
          });
          setImagePreview(p.imageUrl || '');
        })
        .catch(() => {
          toast.error('Producto no encontrado');
          navigate('/admin/productos');
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    setUploading(true);
    try {
      const res = await uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: res.data.url }));
      setImagePreview(res.data.url);
      toast.success('Imagen subida correctamente');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al subir imagen');
      setImagePreview(form.imageUrl || '');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) return toast.error('El código es requerido');
    if (!form.name.trim()) return toast.error('El nombre es requerido');
    if (!form.price || isNaN(parseFloat(form.price))) return toast.error('El precio debe ser un número válido');
    if (!form.categoryId) return toast.error('Seleccioná una categoría');

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        categoryId: parseInt(form.categoryId),
      };

      if (isEdit) {
        await updateProduct(id, payload);
        toast.success('Producto actualizado correctamente');
      } else {
        await createProduct(payload);
        toast.success('Producto creado correctamente');
      }
      navigate('/admin/productos');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/productos" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-dark">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </h1>
          <p className="text-muted text-sm">
            {isEdit ? 'Modificá los datos del producto' : 'Completá los datos del nuevo producto'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Imagen ───────────────────────────────────────────────────── */}
        <div className="card p-5">
          <h3 className="font-semibold text-dark mb-4">Imagen del producto</h3>
          <div className="flex gap-4 items-start">
            {/* Preview */}
            <div className="w-28 h-28 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-full object-contain p-2"
                  onError={() => setImagePreview('')}
                />
              ) : (
                <Package size={32} className="text-gray-300" />
              )}
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-3">
              <label className={`btn-secondary cursor-pointer inline-flex ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                {uploading
                  ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  : <Upload size={15} />
                }
                {uploading ? 'Subiendo...' : 'Subir imagen'}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <p className="text-xs text-muted">JPG, PNG, WebP. Máximo 5MB.</p>

              {/* URL manual */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={(e) => {
                    handleChange(e);
                    setImagePreview(e.target.value);
                  }}
                  className="input text-xs flex-1"
                  placeholder="O pegá una URL de imagen..."
                />
                {form.imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm((p) => ({ ...p, imageUrl: '' }));
                      setImagePreview('');
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Quitar imagen"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Datos básicos ─────────────────────────────────────────────── */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-dark">Datos básicos</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Código <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                className="input font-mono"
                placeholder="Ej: 12253"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Precio (ARS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="input"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">
              Nombre del producto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
              placeholder="Nombre completo del producto"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Seleccioná una categoría...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">
              Descripción corta
            </label>
            <input
              type="text"
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              className="input"
              placeholder="Descripción breve para las tarjetas del catálogo"
              maxLength={200}
            />
            <p className="text-xs text-muted mt-1">{form.shortDescription.length}/200 caracteres</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">
              Descripción completa
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input resize-none"
              rows={4}
              placeholder="Descripción detallada: especificaciones, compatibilidad, incluye..."
            />
          </div>
        </div>

        {/* ── Estados ───────────────────────────────────────────────────── */}
        <div className="card p-5">
          <h3 className="font-semibold text-dark mb-4">Estados del producto</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'active', label: 'Producto activo', desc: 'Visible en la tienda pública' },
              { name: 'inStock', label: 'En stock', desc: 'Disponible para consultar' },
              { name: 'featured', label: 'Destacado', desc: 'Aparece en la sección home' },
              { name: 'isNew', label: 'Novedad', desc: 'Etiqueta "Nuevo" en la tarjeta' },
            ].map(({ name, label, desc }) => (
              <label
                key={name}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm ${
                  form[name]
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  name={name}
                  checked={!!form[name]}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
                />
                <div>
                  <p className="text-sm font-semibold text-dark">{label}</p>
                  <p className="text-xs text-muted leading-snug">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ── Botones ───────────────────────────────────────────────────── */}
        <div className="flex gap-3 pb-8">
          <Link to="/admin/productos" className="btn-secondary flex-1 justify-center py-3">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="btn-primary flex-1 justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={17} />
            }
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
