export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto p-4 max-w-lg pb-24 animate-pulse">

      {/* 商品名 + 削除ボタン */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <div className="h-7 w-48 bg-slate-200 rounded" />
          <div className="mt-2 flex items-center flex-wrap gap-2">
            <div className="h-9 w-24 bg-slate-100 rounded-md" />
            <div className="h-9 w-20 bg-slate-100 rounded-md" />
            <div className="h-9 w-24 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="h-9 w-9 bg-slate-100 rounded-md shrink-0 ml-2" />
      </div>

      {/* タグ */}
      <div className="mb-6 flex gap-2">
        <div className="h-7 w-16 bg-slate-100 rounded-full" />
        <div className="h-7 w-20 bg-slate-100 rounded-full" />
      </div>

      {/* URL・メモ */}
      <div className="space-y-4">
        <div className="h-10 bg-slate-100 rounded-md" />
        <div className="h-20 bg-slate-100 rounded-md" />
      </div>

      {/* クイック購入フォーム */}
      <div className="mt-8 space-y-3">
        <div className="h-5 w-24 bg-slate-200 rounded" />
        <div className="h-10 bg-slate-100 rounded-md" />
        <div className="h-10 bg-slate-100 rounded-md" />
        <div className="h-10 bg-slate-200 rounded-md" />
      </div>

      {/* 購入履歴 */}
      <div className="mt-8 space-y-2">
        <div className="h-5 w-20 bg-slate-200 rounded mb-3" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-lg" />
        ))}
      </div>

    </div>
  );
}
