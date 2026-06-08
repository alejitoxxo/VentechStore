// src/components/ui/EmptyState.jsx
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title = 'Sin resultados', description = 'No se encontraron productos.', icon: Icon = PackageOpen, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-dark mb-1">{title}</h3>
      <p className="text-muted text-sm max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
