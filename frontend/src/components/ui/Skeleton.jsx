// src/components/ui/Skeleton.jsx
export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 shimmer rounded" />
        <div className="h-3 w-24 shimmer rounded" />
        <div className="h-4 shimmer rounded" />
        <div className="h-4 w-3/4 shimmer rounded" />
        <div className="flex justify-between items-center">
          <div className="h-6 w-24 shimmer rounded" />
          <div className="h-5 w-20 shimmer rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-9 shimmer rounded-xl" />
          <div className="w-10 h-9 shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white rounded-xl">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className={`h-4 shimmer rounded flex-1 ${j === 0 ? 'w-16 flex-none' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="card p-6 space-y-3">
      <div className="h-4 w-24 shimmer rounded" />
      <div className="h-8 w-16 shimmer rounded" />
      <div className="h-3 w-32 shimmer rounded" />
    </div>
  );
}
