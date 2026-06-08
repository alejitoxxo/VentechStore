// src/pages/admin/AdminImportPage.jsx
import { useState, useRef } from 'react';
import { Upload, Download, FileJson, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { importJSON, importCSV, exportJSON, exportCSV } from '../../services/api';
import { downloadBlob } from '../../utils/format';
import toast from 'react-hot-toast';

function ResultCard({ result }) {
  if (!result) return null;
  return (
    <div className="card p-5 mt-4 animate-slide-up">
      <h3 className="font-semibold text-dark mb-4">Resultado de la importación</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <CheckCircle size={20} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-emerald-700">{result.created}</p>
          <p className="text-xs text-emerald-600">Creados</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <CheckCircle size={20} className="text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-blue-700">{result.updated}</p>
          <p className="text-xs text-blue-600">Actualizados</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <XCircle size={20} className="text-red-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-red-700">{result.errors?.length || 0}</p>
          <p className="text-xs text-red-600">Errores</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <AlertCircle size={20} className="text-purple-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-purple-700">{result.newCategories?.length || 0}</p>
          <p className="text-xs text-purple-600">Categorías nuevas</p>
        </div>
      </div>
      {result.newCategories?.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-dark mb-1">Categorías creadas:</p>
          <div className="flex flex-wrap gap-1">
            {result.newCategories.map(c => <span key={c} className="badge-blue">{c}</span>)}
          </div>
        </div>
      )}
      {result.errors?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-red-600 mb-2">Errores ({result.errors.length}):</p>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {result.errors.slice(0, 10).map((e, i) => (
              <p key={i} className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg">
                {e.item?.code ? `Código ${e.item.code}: ` : ''}{e.error}
              </p>
            ))}
            {result.errors.length > 10 && (
              <p className="text-xs text-muted">...y {result.errors.length - 10} más</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminImportPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [exporting, setExporting] = useState(null);
  const jsonRef = useRef();
  const csvRef = useRef();

  const handleImport = async (type) => {
    const file = type === 'json' ? jsonRef.current?.files?.[0] : csvRef.current?.files?.[0];
    if (!file) return toast.error('Seleccioná un archivo primero');
    setImporting(true);
    setResult(null);
    try {
      const fn = type === 'json' ? importJSON : importCSV;
      const res = await fn(file);
      setResult(res.data);
      toast.success(`Importación completada: ${res.data.created} creados, ${res.data.updated} actualizados`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error en la importación');
    } finally {
      setImporting(false);
      if (type === 'json') jsonRef.current.value = '';
      else csvRef.current.value = '';
    }
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const fn = type === 'json' ? exportJSON : exportCSV;
      const res = await fn();
      downloadBlob(res.data, `ventech-productos.${type}`);
      toast.success(`Exportado exitosamente`);
    } catch {
      toast.error('Error al exportar');
    } finally {
      setExporting(null);
    }
  };

  const jsonExample = JSON.stringify([
    { code: "12253", name: "AURICULAR AITECH FLAT AI-300 ML", category: "AURICULARES", price: 1194, stock: true, active: true, featured: false },
    { code: "10293", name: "COMBO INALAMBRICO NOGA S5600", category: "TECLADOS Y MOUSE", price: 19750, stock: true, active: true, featured: true },
  ], null, 2);

  const csvExample = `code,name,category,price,stock,active,featured
12253,AURICULAR AITECH FLAT AI-300 ML,AURICULARES,1194,true,true,false
10293,COMBO INALAMBRICO NOGA S5600,TECLADOS Y MOUSE,19750,true,true,true`;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-dark">Importar / Exportar</h1>
        <p className="text-muted text-sm">Importá productos masivamente desde JSON o CSV</p>
      </div>

      {/* Import */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-dark mb-4 flex items-center gap-2">
          <Upload size={18} className="text-primary" /> Importar productos
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* JSON */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <FileJson size={20} className="text-amber-500" />
              <span className="font-semibold text-dark">Importar JSON</span>
            </div>
            <input ref={jsonRef} type="file" accept=".json" className="input text-sm mb-3" />
            <button
              onClick={() => handleImport('json')}
              disabled={importing}
              className="btn-primary w-full justify-center py-2 text-sm"
            >
              {importing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload size={14} />}
              Importar JSON
            </button>
          </div>

          {/* CSV */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={20} className="text-emerald-500" />
              <span className="font-semibold text-dark">Importar CSV</span>
            </div>
            <input ref={csvRef} type="file" accept=".csv" className="input text-sm mb-3" />
            <button
              onClick={() => handleImport('csv')}
              disabled={importing}
              className="btn-primary w-full justify-center py-2 text-sm"
            >
              {importing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload size={14} />}
              Importar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      <ResultCard result={result} />

      {/* Export */}
      <div className="card p-5 mt-4">
        <h2 className="font-semibold text-dark mb-4 flex items-center gap-2">
          <Download size={18} className="text-primary" /> Exportar productos
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('json')}
            disabled={!!exporting}
            className="btn-secondary flex-1 justify-center"
          >
            {exporting === 'json' ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <FileJson size={16} />}
            Exportar JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={!!exporting}
            className="btn-secondary flex-1 justify-center"
          >
            {exporting === 'csv' ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <FileText size={16} />}
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Format reference */}
      <div className="card p-5 mt-4">
        <h2 className="font-semibold text-dark mb-4">Formato de importación</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-dark mb-2 flex items-center gap-1.5">
              <FileJson size={14} className="text-amber-500" /> Formato JSON
            </p>
            <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed">
              {jsonExample}
            </pre>
          </div>
          <div>
            <p className="text-sm font-medium text-dark mb-2 flex items-center gap-1.5">
              <FileText size={14} className="text-emerald-500" /> Formato CSV
            </p>
            <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed">
              {csvExample}
            </pre>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Lógica de importación</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Si el <strong>código</strong> ya existe → actualiza el producto</li>
              <li>• Si no existe → crea uno nuevo</li>
              <li>• Si la categoría no existe → la crea automáticamente</li>
              <li>• Campos requeridos: <code className="bg-blue-100 px-1 rounded">code</code>, <code className="bg-blue-100 px-1 rounded">name</code>, <code className="bg-blue-100 px-1 rounded">price</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
