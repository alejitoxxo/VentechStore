// src/pages/admin/AdminCategoriesPage.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Save, X } from 'lucide-react';
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

function CategoryRow({ cat, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: cat.name, description: cat.description || '', active: cat.active, order: cat.order });

  const handleSave = async () => {
    try {
      await onSave(cat.id, form);
      setEditing(false);
    } catch {}
  };

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50">
      {editing ? (
        <>
          <td className="px-4 py-3" colSpan={4}>
            <div className="flex flex-wrap gap-2 items-center">
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="input flex-1 min-w-32" placeholder="Nombre" />
              <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="input flex-1 min-w-32" placeholder="Descripción" />
              <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                className="input w-20" placeholder="Orden" />
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="accent-primary" />
                Activa
              </label>
              <button onClick={handleSave} className="btn-primary py-2 px-3"><Save size={14} /></button>
              <button onClick={() => setEditing(false)} className="btn-ghost py-2 px-3"><X size={14} /></button>
            </div>
          </td>
        </>
      ) : (
        <>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-dark">{cat.name}</span>
            </div>
          </td>
          <td className="px-4 py-3 hidden md:table-cell">
            <span className="text-sm text-muted">{cat.description || '—'}</span>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={`badge ${cat.active ? 'badge-green' : 'badge-gray'}`}>
                {cat.active ? 'Activa' : 'Inactiva'}
              </span>
              <span className="text-xs text-muted">{cat._count?.products || 0} productos</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                <Edit2 size={14} />
              </button>
              <button onClick={() => onDelete(cat)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </td>
        </>
      )}
    </tr>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', description: '', order: 0 });
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    getAdminCategories().then(r => setCategories(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newForm.name.trim()) return toast.error('El nombre es obligatorio');
    try {
      await createCategory(newForm);
      toast.success('Categoría creada');
      setNewForm({ name: '', description: '', order: 0 });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear');
    }
  };

  const handleSave = async (id, data) => {
    try {
      await updateCategory(id, data);
      toast.success('Actualizado');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar');
      throw err;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(confirm.id);
      toast.success('Categoría eliminada');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark">Categorías</h1>
          <p className="text-muted text-sm">{categories.length} categorías</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={16} /> Nueva categoría
        </button>
      </div>

      {/* New category form */}
      {showForm && (
        <div className="card p-5 mb-4 animate-slide-up">
          <h3 className="font-semibold text-dark mb-4">Nueva categoría</h3>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-muted mb-1">Nombre *</label>
              <input type="text" value={newForm.name} onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))}
                className="input" placeholder="AURICULARES" required />
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-muted mb-1">Descripción</label>
              <input type="text" value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))}
                className="input" placeholder="Descripción opcional" />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-muted mb-1">Orden</label>
              <input type="number" value={newForm.order} onChange={e => setNewForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                className="input" min="0" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Crear</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 shimmer rounded-xl" />)}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState title="Sin categorías" description="Crea la primera categoría." icon={Tag} />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide hidden md:table-cell">Descripción</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  onSave={handleSave}
                  onDelete={setConfirm}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title="Eliminar categoría"
        message={`¿Eliminar la categoría "${confirm?.name}"? Solo se puede eliminar si no tiene productos asignados.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
