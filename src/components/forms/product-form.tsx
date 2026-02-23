'use client';

import * as React from 'react';
import { createProduct } from '@/app/products/actions';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SubmitButton } from './submit-button';
import { TagSelector } from '@/components/tags/tag-selector';
import { Category, Tag } from '@/types';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

export function ProductForm({ categories, allTags, defaultCategoryId = '', onSuccess, className }: { categories: Category[], allTags: Tag[], defaultCategoryId?: string, onSuccess?: () => void, className?: string }) {
  const [categoryId, setCategoryId] = React.useState(defaultCategoryId);
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function clientAction(formData: FormData) {
    setIsSubmitting(true);
    try {
      const result = await createProduct(formData);
      if (result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("商品を登録しました");
        if (onSuccess) onSuccess();
      }
    } catch (e: any) {
      toast.error(e.message || "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      action={clientAction}
      className={cn("space-y-4 max-w-md mx-auto p-4 border rounded-lg", className)}
    >
      <h2 className="text-xl font-bold">商品登録</h2>

      <div className="space-y-2">
        <Label htmlFor="name">商品名</Label>
        <Input id="name" name="name" required placeholder="例: 牛乳" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">カテゴリ</Label>
        <input type="hidden" name="categoryId" value={categoryId} />
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="bg-white border-slate-400 shadow-sm">
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-300 shadow-lg">
            <SelectItem value="none">未分類</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>タグ</Label>
        {selectedTagIds.map(id => (
          <input key={id} type="hidden" name="tagIds" value={id} />
        ))}
        <TagSelector
          allTags={allTags}
          selectedTagIds={selectedTagIds}
          onChange={setSelectedTagIds}
        />
      </div>

      {/* Override internal SubmitButton behavior to avoid nested forms visually, but SubmitButton usually works fine inside `action` */}
      <SubmitButton className="w-full">{isSubmitting ? '登録中...' : '登録する'}</SubmitButton>
    </form>
  );
}
