'use client';

import * as React from 'react';
import { createProduct } from '@/app/products/actions';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SubmitButton } from './submit-button';

export function ProductForm({ units, categories }: { units: any[], categories: any[] }) {
  const [categoryId, setCategoryId] = React.useState('');

  return (
    <form 
      action={createProduct} 
      className="space-y-4 max-w-md mx-auto p-4 border rounded-lg"
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

      {/* Hidden Unit Selection (Default to 'Piece' / '個') */}
      <input type="hidden" name="defaultUnitId" value={units.find(u => u.symbol === 'pc' || u.symbol === '個')?.id || units[0]?.id} />

      <SubmitButton className="w-full">登録する</SubmitButton>
    </form>
  );
}
