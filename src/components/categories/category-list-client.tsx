'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { updateCategoryOrder, deleteCategory } from '@/app/categories/actions';

export function CategoryListClient({ categories }: { categories: any[] }) {
  const [loading, setLoading] = useState(false);

  const sortedCategories = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const moveCategory = async (id: string, currentIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedCategories.length) return;

    setLoading(true);
    try {
      const other = sortedCategories[newIndex];
      await updateCategoryOrder(id, other.sort_order || 0);
      await updateCategoryOrder(other.id, sortedCategories[currentIndex].sort_order || 0);
    } catch (e) {
      alert('並び替えの保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">順序</TableHead>
            <TableHead>カテゴリ名</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCategories.map((cat, index) => (
            <TableRow key={cat.id}>
              <TableCell>
                <div className="flex flex-col items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveCategory(cat.id, index, 'up')} disabled={index === 0 || loading}>
                    <ArrowUp size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveCategory(cat.id, index, 'down')} disabled={index === sortedCategories.length - 1 || loading}>
                    <ArrowDown size={14} />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="font-medium">{cat.name}</TableCell>
              <TableCell className="text-right">
                <form action={deleteCategory} onSubmit={(e) => {
                  if (!confirm('このカテゴリを削除しますか？紐付いている商品は「未分類」になります。')) e.preventDefault();
                }}>
                  <input type="hidden" name="id" value={cat.id} />
                  <Button variant="ghost" className="text-red-600 h-8 w-8 p-0" type="submit">
                    <Trash2 size={16} />
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
