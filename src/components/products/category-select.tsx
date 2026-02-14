'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProductCategory } from '@/app/products/actions';
import { useState } from 'react';

const CATEGORIES = ["キッチン", "お風呂", "掃除", "パントリー", "日用品"];

export function CategorySelect({ id, initialCategory }: { id: string, initialCategory: string }) {
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newCategory: string) => {
    setLoading(true);
    try {
      await updateProductCategory(id, newCategory);
      setCategory(newCategory);
    } catch (e) {
      alert('カテゴリの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select value={category} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-[140px] h-8 text-xs">
        <SelectValue placeholder="カテゴリ" />
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map(cat => (
          <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
