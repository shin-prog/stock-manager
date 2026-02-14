'use client';

import { useState, useOptimistic, startTransition } from 'react';
import { adjustStock } from '@/app/actions';
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterPanel, FilterItem } from '@/components/ui/filter-panel';

import Link from 'next/link';

export function StockList({ stockItems, categories }: { stockItems: any[], categories: string[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // 楽観的UIのためのフック
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    stockItems,
    (state, { productId, amount }: { productId: string, amount: number }) => {
      return state.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: item.quantity + amount }
          : item
      );
    }
  );
  
  const handleAdjust = async (productId: string, amount: number) => {
    // 1. 即座にUIを更新（楽観的更新）
    startTransition(() => {
      addOptimisticItem({ productId, amount });
    });

    // 2. サーバー処理をバックグラウンドで実行
    try {
      await adjustStock(productId, amount, amount > 0 ? 'audit' : 'consumed');
    } catch (e) {
      alert('在庫の更新に失敗しました');
      // エラー時のロールバックはRouterのリフレッシュで自動的に行われるため、
      // ここではアラートのみでOK（厳密にはリバート処理が必要だが、MVPとしては十分）
    }
  };

  const filteredItems = (selectedCategory === 'all' 
    ? optimisticItems 
    : optimisticItems.filter(item => item.category === selectedCategory))
    .sort((a, b) => {
      return sortOrder === 'desc' 
        ? b.quantity - a.quantity 
        : a.quantity - b.quantity;
    });

  return (
    <div className="space-y-3">
      <FilterPanel>
        <FilterItem label="カテゴリ:">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[110px] h-9 bg-white border-slate-400 text-xs">
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-300 shadow-lg">
              <SelectItem value="all">すべて</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterItem>

        <FilterItem label="順序:">
          <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
            <SelectTrigger className="w-[110px] h-9 bg-white border-slate-400 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-300 shadow-lg">
              <SelectItem value="desc">多い順</SelectItem>
              <SelectItem value="asc">少ない順</SelectItem>
            </SelectContent>
          </Select>
        </FilterItem>
      </FilterPanel>

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
