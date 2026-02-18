export default function NewProductLoading() {
  return (
    <div className="container mx-auto p-4 max-w-lg">
      <div className="space-y-4 max-w-md mx-auto p-4 border rounded-lg animate-pulse">
        <div className="h-7 w-20 bg-slate-200 rounded" />

        <div className="space-y-2">
          <div className="h-4 w-14 bg-slate-200 rounded" />
          <div className="h-10 bg-slate-100 rounded-md" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-16 bg-slate-200 rounded" />
          <div className="h-10 bg-slate-100 rounded-md" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-8 bg-slate-200 rounded" />
          <div className="h-10 bg-slate-100 rounded-md" />
        </div>

        <div className="h-10 bg-slate-200 rounded-md" />
      </div>
    </div>
  );
}
