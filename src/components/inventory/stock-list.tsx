'use client';

import { useState, useTransition } from 'react';
import { batchUpdateInventory } from '@/app/actions';
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterPanel, FilterItem } from '@/components/ui/filter-panel';
import { cn } from '@/lib/utils';
import { StockItem } from './inventory-container';
import { Category, Tag, StockStatus } from '@/types';
import { Loader2, X as CloseIcon, Check, ShoppingCart, Minus as MinusIcon, Pencil } from "lucide-react";
import { getQuietColorClasses } from '@/lib/colors';

import Link from 'next/link';

// 在庫ステータスの循環順序
const STATUS_CYCLE: StockStatus[] = ['unchecked', 'sufficient', 'needed'];

function getNextStatus(current: StockStatus): StockStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

// ステータスに応じた「在庫:数」部分の背景色クラス
function getStatusStockBgClass(status: StockStatus): string {
  const base = "rounded-md px-2 py-0.5 border text-xs font-medium";
  switch (status) {
    case 'sufficient':
      return `${base} bg-emerald-50 text-emerald-700 border-emerald-100`;
    case 'needed':
      return `${base} bg-red-50 text-red-700 border-red-100`;
    default:
      return `${base} bg-slate-50 text-slate-500 border-slate-100`;
  }
}

// ステータスボタンの表示情報（アイコンのみ）
function getStatusButtonInfo(status: StockStatus) {
  switch (status) {
    case 'sufficient':
      return {
        icon: <Check className="h-4 w-4" />,
        className: 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200',
      };
    case 'needed':
      return {
        icon: <ShoppingCart className="h-4 w-4" />,
        className: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
      };
    default:
      return {
        icon: <MinusIcon className="h-4 w-4" />,
        className: 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200',
      };
  }
}

export function StockList({ stockItems, categories }: { stockItems: StockItem[], categories: Category[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('asc');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 編集モード用のローカル状態
  const [localItems, setLocalItems] = useState<StockItem[]>([]);

  // 商品追加ボタンのhref（カテゴリフィルタ中はそのカテゴリIDを渡す）
  const selectedCategoryObj = selectedCategory !== 'all' && selectedCategory !== '未分類'
    ? categories.find(c => c.name === selectedCategory)
    : null;
  const addProductHref = selectedCategoryObj
    ? `/products/new?categoryId=${selectedCategoryObj.id}`
    : '/products/new';

  // 通常表示用のフィルター済みリスト
  const filteredItems = (selectedCategory === 'all'
    ? stockItems
    : stockItems.filter(item => item.category === selectedCategory))
    .sort((a, b) => {
      // 1. アーカイブ済みの商品を常に下にする
      if (a.is_archived !== b.is_archived) {
        return a.is_archived ? 1 : -1;
      }

      // 2. その中で在庫数でソート
      const qtyDiff = sortOrder === 'desc'
        ? b.quantity - a.quantity
        : a.quantity - b.quantity;

      if (qtyDiff !== 0) return qtyDiff;

      // 3. 在庫数が同じ場合は商品名でソート（安定性を確保）
      return a.product_name.localeCompare(b.product_name);
    });

  // 編集モードの切り替え
  const handleToggleEdit = async () => {
    if (isEditMode) {
      // 編集終了：差分を計算して一括更新
      const updates = localItems.map(item => {
        const original = stockItems.find(s => s.product_id === item.product_id);
        return {
          productId: item.product_id,
          quantityDelta: item.quantity - (original?.quantity || 0),
          categoryId: item.category_id,
          stockStatus: item.stock_status
        };
      }).filter(u =>
        u.quantityDelta !== 0 ||
        u.categoryId !== stockItems.find(s => s.product_id === u.productId)?.category_id ||
        u.stockStatus !== stockItems.find(s => s.product_id === u.productId)?.stock_status
      );

      if (updates.length > 0) {
        startTransition(async () => {
          try {
            await batchUpdateInventory(updates);
            setIsEditMode(false);
          } catch (e) {
            alert('一括更新に失敗しました');
          }
        });
      } else {
        setIsEditMode(false);
      }
    } else {
      // 編集開始：現在の表示内容でリストをロック（= 順序を入れ替えない）
      setLocalItems([...filteredItems]);
      setIsEditMode(true);
    }
  };

  const handleLocalAdjust = (productId: string, amount: number) => {
    setLocalItems(prev => prev.map(item =>
      item.product_id === productId
        ? {
          ...item,
          quantity: Math.max(0, item.quantity + amount),
          // 在庫変動時は即座に未判断にリセット
          stock_status: 'unchecked' as StockStatus
        }
        : item
    ));
  };

  const handleLocalCategoryChange = (productId: string, categoryId: string) => {
    const targetId = categoryId === 'unclassified' ? null : categoryId;
    const catName = categories.find(c => c.id === targetId)?.name || '未分類';

    setLocalItems(prev => prev.map(item =>
      item.product_id === productId
        ? { ...item, category_id: targetId, category: catName }
        : item
    ));
  };

  const handleLocalStatusToggle = (productId: string) => {
    setLocalItems(prev => prev.map(item =>
      item.product_id === productId
        ? { ...item, stock_status: getNextStatus(item.stock_status) }
        : item
    ));
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setLocalItems([]);
  };

  // 表示するアイテムの決定
  const displayItems = isEditMode ? localItems : filteredItems;

  return (
    <div className="space-y-3">

      {!isEditMode && (
        <div className="flex justify-end">
          <Link href={addProductHref}>
            <Button size="sm" className="font-bold">+ 商品追加</Button>
          </Link>
        </div>
      )}

      <FilterPanel className={cn(isEditMode && "opacity-60")}>
        <FilterItem label="カテゴリ:">
          <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isEditMode}>
            <SelectTrigger className="w-[110px] h-9 bg-white border-slate-400 text-xs">
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-300 shadow-lg">
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="未分類">未分類</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterItem>

        {!isEditMode && (
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
        )}
      </FilterPanel>

      {displayItems.map((item) => {
        const statusInfo = getStatusButtonInfo(item.stock_status);
        return (
          <div
            key={item.product_id}
            className={cn(
              "flex items-center justify-between p-3 border rounded-lg shadow-sm",
              item.is_archived ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200"
            )}
          >
            <div className="flex-1 min-w-0 pr-2">
              <Link href={`/products/${item.product_id}`} className="hover:underline block">
                <div className={cn(
                  "font-bold text-base leading-tight",
                  isEditMode ? "truncate" : "break-words",
                  item.is_archived && "text-slate-500"
                )}>
                  {item.product_name}
                </div>
              </Link>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <div className={getStatusStockBgClass(item.stock_status)}>
                  在庫: <span className={cn(
                    "text-lg font-bold mx-0.5",
                    item.is_archived ? "text-slate-500" : "text-black"
                  )}>{item.quantity}</span>
                </div>
                {isEditMode ? (
                  <Select
                    value={item.category_id || 'unclassified'}
                    onValueChange={(val) => handleLocalCategoryChange(item.product_id, val)}
                  >
                    <SelectTrigger className="!h-5 text-[11px] w-auto px-1 gap-1 !py-0 bg-gray-50 border-gray-300">
                      <SelectValue placeholder="カテゴリ" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="unclassified">未分類</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{item.category}</div>
                )}
                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                      <Link
                        key={tag.id}
                        href={`/tags/${tag.id}`}
                        className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-full border transition-colors hover:opacity-80 max-w-[100px] truncate inline-block",
                          getQuietColorClasses(tag.color_key)
                        )}
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {isEditMode && (
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "!h-7 !w-7 p-0 border",
                    statusInfo.className
                  )}
                  onClick={() => handleLocalStatusToggle(item.product_id)}
                >
                  {statusInfo.icon}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="!h-7 !w-7 p-0 border-slate-300 text-xs"
                  onClick={() => handleLocalAdjust(item.product_id, -1)}
                  disabled={item.quantity <= 0}
                >
                  -1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="!h-7 !w-7 p-0 border-slate-300 text-xs"
                  onClick={() => handleLocalAdjust(item.product_id, 1)}
                >
                  +1
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {displayItems.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          該当する商品がありません。
        </div>
      )}

      {/* Floating Action Button for Edit Mode */}
      <div className="fixed bottom-24 md:bottom-8 right-6 flex flex-col items-end gap-3 z-[1000]">
        {isEditMode && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancelEdit}
            disabled={isPending}
            className="h-12 w-12 rounded-full shadow-lg bg-white text-slate-500 border-slate-200 hover:bg-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <CloseIcon className="h-6 w-6" />
          </Button>
        )}
        <Button
          size="icon"
          onClick={handleToggleEdit}
          disabled={isPending}
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
            isEditMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-slate-900 hover:bg-black text-white hover:scale-110 active:scale-95"
          )}
        >
          {isEditMode ? (
            isPending ? <Loader2 className="h-7 w-7 animate-spin" /> : <Check className="h-7 w-7" />
          ) : (
            <Pencil className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
}
