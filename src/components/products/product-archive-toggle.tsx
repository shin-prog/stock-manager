"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleProductArchive } from "@/app/products/actions";
import { Archive, ArchiveRestore, AlertCircle } from "lucide-react";
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
    if (
      nextState &&
      !confirm(
        "「もう買わない」に設定しますか？\n設定すると在庫一覧の最後に表示されるようになります。",
      )
    ) {
      return;
    }

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
    <div
      className={cn(
        "rounded-lg border p-4 mb-6 transition-all",
        isArchived
          ? "bg-slate-50 border-slate-200"
          : "bg-blue-50/30 border-blue-100",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "p-2 rounded-full",
              isArchived ? "bg-slate-200 text-slate-600" : "bg-blue-100 text-blue-600",
            )}
          >
            {isArchived ? <Archive size={20} /> : <ArchiveRestore size={20} />}
          </div>
          <div>
            <div className="font-bold text-sm">
              {isArchived ? "もう買わない商品" : "今後も買う商品"}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {isArchived
                ? "この商品はリストの下位に表示されます"
                : "この商品は在庫数に応じてリストの上位に表示されます"}
            </p>
          </div>
        </div>
        <Button
          variant={isArchived ? "outline" : "default"}
          size="sm"
          onClick={handleToggle}
          disabled={isPending}
          className={cn(
            "shrink-0 font-bold",
            !isArchived && "bg-blue-600 hover:bg-blue-700",
          )}
        >
          {isArchived ? "買うリストに戻す" : "もう買わない"}
        </Button>
      </div>
      {isArchived && (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-100">
          <AlertCircle size={12} />
          <span>在庫があっても、在庫一覧の最後に並びます</span>
        </div>
      )}
    </div>
  );
}
