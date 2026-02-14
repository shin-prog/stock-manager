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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 mb-4 bg-slate-50 p-2 rounded-lg border text-sm">
        <div className="flex items-center gap-1">
          <div className="font-bold text-gray-500">カテゴリ:</div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[110px] h-8 bg-white text-xs">
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

        <div className="flex items-center gap-1">
          <div className="font-bold text-gray-500">順序:</div>
          <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
            <SelectTrigger className="w-[110px] h-8 bg-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">多い順</SelectItem>
              <SelectItem value="asc">少ない順</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredItems.map((item) => (
        <div key={item.product_id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
          <div className="flex-1 min-w-0 pr-2">
            <Link href={`/products/${item.product_id}`} className="hover:underline block truncate">
              <div className="font-bold text-base truncate">{item.product_name}</div>
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{item.category}</div>
              <div className="text-sm text-gray-700">
                在庫: <span className="text-lg font-bold text-black mx-0.5">{item.quantity}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleAdjust(item.product_id, -1)}
            >
              -1
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 w-8 p-0"
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
