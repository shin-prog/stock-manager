"use client";

import { useState, useTransition } from "react";
import { toggleProductArchive } from "@/app/products/actions";
import { Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductArchiveToggleProps {
  productId: string;
  initialIsArchived: boolean;
}

export function ProductArchiveToggle({
  productId,
  initialIsArchived,
}: ProductArchiveToggleProps) {
  const [isArchived, setIsArchived] = useState(initialIsArchived);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async () => {
    const nextState = !isArchived;
    setIsArchived(nextState);
    startTransition(async () => {
      try {
        await toggleProductArchive(productId, nextState);
      } catch (e) {
        setIsArchived(!nextState);
        alert("設定の更新に失敗しました");
      }
    });
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg mb-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Archive size={16} className={cn(isArchived ? "text-amber-500" : "text-slate-400")} />
        <span className="text-sm font-bold text-slate-700">今後も継続して購入する</span>
      </div>
      
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          !isArchived ? "bg-blue-600" : "bg-slate-200"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
            !isArchived ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
