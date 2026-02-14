'use client';

import * as React from 'react';
import { createProduct } from '@/app/products/actions';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProductForm({ units }: { units: any[] }) {
  const [category, setCategory] = React.useState('');
  const [unitId, setUnitId] = React.useState('');

  return (
    <form action={createProduct} className="space-y-4 max-w-md mx-auto p-4 border rounded-lg">
      <h2 className="text-xl font-bold">商品登録</h2>
      
      <div className="space-y-2">
        <Label htmlFor="name">商品名</Label>
        <Input id="name" name="name" required placeholder="例: 牛乳" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">カテゴリ</Label>
        <input type="hidden" name="category" value={category} />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="キッチン">キッチン</SelectItem>
            <SelectItem value="お風呂">お風呂</SelectItem>
            <SelectItem value="掃除">掃除</SelectItem>
            <SelectItem value="パントリー">パントリー</SelectItem>
            <SelectItem value="日用品">日用品</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hidden Unit Selection (Default to 'Piece' / '個') */}
      <input type="hidden" name="defaultUnitId" value={units.find(u => u.symbol === 'pc' || u.symbol === '個')?.id || units[0]?.id} />

      <div className="space-y-2">
        <Label htmlFor="minStock">最低在庫数 (アラート用)</Label>
        <Input id="minStock" name="minStock" type="number" defaultValue={1} />
      </div>

      <Button type="submit" className="w-full">登録する</Button>
    </form>
  );
}
