'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProductCategory } from '@/app/products/actions';
import { useState } from 'react';

export function CategorySelect({ id, initialCategoryId, categories }: { id: string, initialCategoryId: string | null, categories: any[] }) {
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
    <Select value={initialCategoryId || 'none'} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-[140px] h-8 text-xs">
        <SelectValue placeholder="カテゴリ" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none" className="text-xs">未分類</SelectItem>
        {categories.map(cat => (
          <SelectItem key={cat.id} value={cat.id} className="text-xs">{cat.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
