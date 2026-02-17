"use client";

import { useState, useTransition } from "react";
import { toggleProductArchive } from "@/app/products/actions";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw } from "lucide-react";

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
    <div className="inline-flex items-center gap-2 h-9 px-2.5 bg-slate-100/50 rounded-md border border-slate-200/60 transition-colors hover:bg-slate-100">
      <div className="flex items-center gap-1.5 cursor-pointer" onClick={handleToggle}>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
          継続購入
        </span>

        <div
          className={cn(
            "relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full transition-colors",
            !isArchived ? "bg-green-500" : "bg-slate-300"
          )}
        >
          <span
            className={cn(
              "pointer-events-none block h-3 w-3 rounded-full bg-white shadow-sm transition-transform",
              !isArchived ? "translate-x-3.5" : "translate-x-0.5"
            )}
          />
        </div>
      </div>
      {isPending && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
    </div>
  );
}
