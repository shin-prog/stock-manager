'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProductCategory } from '@/app/products/actions';
import { useState } from 'react';

import { Category } from '@/types';

export function CategorySelect({ id, initialCategoryId, categories }: { id: string, initialCategoryId: string | null, categories: Category[] }) {
  const [loading, setLoading] = useState(false);

  const handleChange = async (newCategoryId: string) => {
    setLoading(true);
    try {
      await updateProductCategory(id, newCategoryId);
    } catch (e) {
      alert('カテゴリの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2 h-8 px-2 bg-slate-100/50 rounded-md border border-slate-200/60 transition-colors hover:bg-slate-100">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">カテゴリ</span>
      <Select value={initialCategoryId || 'none'} onValueChange={handleChange} disabled={loading}>
        <SelectTrigger className="h-6 w-auto min-w-[70px] border-none bg-transparent p-0 text-xs font-bold text-slate-700 shadow-none focus:ring-0">
          <SelectValue placeholder="未分類" />
        </SelectTrigger>
        <SelectContent className="bg-white border-slate-300 shadow-lg">
          <SelectItem value="none" className="text-xs">未分類</SelectItem>
          {categories.map(cat => (
            <SelectItem key={cat.id} value={cat.id} className="text-xs">{cat.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
