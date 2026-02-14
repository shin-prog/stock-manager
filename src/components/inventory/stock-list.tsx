'use client';

import { useState } from 'react';
import { adjustStock } from '@/app/actions';
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import Link from 'next/link';

export function StockList({ stockItems, categories }: { stockItems: any[], categories: string[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  const handleAdjust = async (productId: string, amount: number) => {
    try {
      await adjustStock(productId, amount, amount > 0 ? 'audit' : 'consumed');
    } catch (e) {
      alert('Failed to update stock');
    }
  };

  const filteredItems = (selectedCategory === 'all' 
    ? stockItems 
    : stockItems.filter(item => item.category === selectedCategory))
    .sort((a, b) => {
      return sortOrder === 'desc' 
        ? b.quantity - a.quantity 
        : a.quantity - b.quantity;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-slate-50 p-3 rounded-lg border">
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">カテゴリ:</div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[130px] h-9 bg-white">
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">並び替え:</div>
          <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
            <SelectTrigger className="w-[130px] h-9 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">在庫が多い順</SelectItem>
              <SelectItem value="asc">在庫が少ない順</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredItems.map((item) => (
        <div key={item.product_id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
          <div>
            <Link href={`/products/${item.product_id}`} className="hover:underline">
              <div className="font-bold text-lg">{item.product_name}</div>
            </Link>
            <div className="text-xs text-gray-400 mb-1">{item.category}</div>
            <div className="text-sm text-gray-500">
              現在: <span className="text-xl font-bold text-black mx-1">{item.quantity}</span> 個
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAdjust(item.product_id, -1)}
            >
              -1
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAdjust(item.product_id, 1)}
            >
              +1
            </Button>
          </div>
        </div>
      ))}
      
      {filteredItems.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          該当する商品がありません。
        </div>
      )}
    </div>
  );
}
