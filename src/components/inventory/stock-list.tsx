'use client';

import { useState, useTransition } from 'react';
import { batchUpdateInventory } from '@/app/actions';
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterPanel, FilterItem } from '@/components/ui/filter-panel';
import { cn } from '@/lib/utils';
import { StockItem } from './inventory-container';
import { Category, Tag, StockStatus, StockMode, ApproximateQuantity } from '@/types';
import { Loader2, X as CloseIcon, Check, ShoppingCart, Minus as MinusIcon, Pencil, Plus } from "lucide-react";
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

function formatUpdatedDate(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  const now = new Date();
  if (d.getFullYear() === now.getFullYear()) {
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
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
  const [sortOrder, setSortOrder] = useState<'qty-asc' | 'qty-desc' | 'updated-asc' | 'updated-desc'>('qty-asc');
  const [filterStatuses, setFilterStatuses] = useState<StockStatus[]>([]);
  const [showArchived, setShowArchived] = useState(false);
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

  const toggleStatusFilter = (status: StockStatus) => {
    setFilterStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  // 通常表示用のフィルター済みリスト
  const getSortValue = (item: StockItem) => {
    if (item.stock_mode === 'approximate') {
      if (item.approximate_quantity === 'few') return -1000000;
      if (item.approximate_quantity === 'many') return 1000000;
      return 0;
    }
    return item.quantity;
  };

  const filteredItems = (selectedCategory === 'all'
    ? stockItems
    : stockItems.filter(item => item.category === selectedCategory))
    .filter(item => {
      if (!showArchived && item.is_archived) return false;
      if (filterStatuses.length === 0) return true;
      if (item.is_archived) return false;
      return filterStatuses.includes(item.stock_status);
    })
    .sort((a, b) => {
      if (sortOrder === 'qty-asc' || sortOrder === 'qty-desc') {
        const valA = getSortValue(a);
        const valB = getSortValue(b);
        const diff = sortOrder === 'qty-asc'
          ? valA - valB
          : valB - valA;
        if (diff !== 0) return diff;
      } else {
        const ta = a.last_updated ? new Date(a.last_updated).getTime() : 0;
        const tb = b.last_updated ? new Date(b.last_updated).getTime() : 0;
        const diff = sortOrder === 'updated-asc' ? ta - tb : tb - ta;
        if (diff !== 0) return diff;
      }
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
          newQuantity: item.quantity,
          categoryId: item.category_id,
          stockStatus: item.stock_status,
          stockMode: item.stock_mode,
          approximateQuantity: item.approximate_quantity
        };
      }).filter(u =>
        u.quantityDelta !== 0 ||
        u.categoryId !== stockItems.find(s => s.product_id === u.productId)?.category_id ||
        u.stockStatus !== stockItems.find(s => s.product_id === u.productId)?.stock_status ||
        u.stockMode !== stockItems.find(s => s.product_id === u.productId)?.stock_mode ||
        u.approximateQuantity !== stockItems.find(s => s.product_id === u.productId)?.approximate_quantity
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

  const handleLocalModeToggle = (productId: string) => {
    setLocalItems(prev => prev.map(item => {
      if (item.product_id !== productId) return item;

      const newMode = item.stock_mode === 'exact' ? 'approximate' : 'exact';
      return {
        ...item,
        stock_mode: newMode,
        // When switching to approximate, default to 'few' if not already set
        approximate_quantity: newMode === 'approximate' && !item.approximate_quantity ? 'few' : item.approximate_quantity
      };
    }));
  };

  const handleLocalApproximate = (productId: string, val: ApproximateQuantity) => {
    setLocalItems(prev => prev.map(item =>
      item.product_id === productId
        ? {
          ...item,
          approximate_quantity: val, // 不要なトグル（クリックでnullに戻る処理）を削除し、必ず値が入るようにする
          stock_status: 'unchecked' as StockStatus
        }
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

      <FilterPanel className={cn("flex-col gap-2", isEditMode && "opacity-60")}>
        {/* 上段: カテゴリ・並べ替え */}
        <div className="flex gap-2 w-full">
          <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isEditMode}>
            <SelectTrigger className="flex-1 h-9 bg-white border-slate-400 text-xs">
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-300 shadow-lg">
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="未分類">未分類</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)} disabled={isEditMode}>
            <SelectTrigger className="flex-1 h-9 bg-white border-slate-400 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-300 shadow-lg">
              <SelectItem value="qty-asc">在庫が少ない順</SelectItem>
              <SelectItem value="qty-desc">在庫が多い順</SelectItem>
              <SelectItem value="updated-asc">更新が古い順</SelectItem>
              <SelectItem value="updated-desc">更新が新しい順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 下段: 在庫ステータスフィルタ + 継続購入停止チェックボックス */}
        <div className="flex gap-2 w-full items-center">
          {([
            { status: 'sufficient' as StockStatus, title: '十分', icon: <Check className="h-4 w-4" />, active: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
            { status: 'needed' as StockStatus, title: '要購入', icon: <ShoppingCart className="h-4 w-4" />, active: 'bg-red-100 text-red-700 border-red-300' },
            { status: 'unchecked' as StockStatus, title: '未判断', icon: <MinusIcon className="h-4 w-4" />, active: 'bg-slate-100 text-slate-500 border-slate-400' },
          ]).map(({ status, title, icon, active }) => (
            <button
              key={status}
              title={title}
              disabled={isEditMode}
              onClick={() => toggleStatusFilter(status)}
              className={cn(
                'flex-1 h-9 flex items-center justify-center rounded-lg border transition-colors',
                filterStatuses.includes(status)
                  ? active
                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
              )}
            >
              {icon}
            </button>
          ))}
          <label className={cn(
            "flex items-center gap-1.5 cursor-pointer shrink-0 text-xs text-slate-500 select-none",
            isEditMode && "pointer-events-none opacity-60"
          )}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              disabled={isEditMode}
              className="h-3.5 w-3.5 accent-slate-600"
            />
            購入停止品
          </label>
        </div>
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
                <button
                  type="button"
                  onClick={() => isEditMode && handleLocalModeToggle(item.product_id)}
                  disabled={!isEditMode}
                  title={isEditMode ? "クリックして管理モード(数/ざっくり)を切り替え" : undefined}
                  className={cn(
                    getStatusStockBgClass(item.stock_status),
                    isEditMode && "cursor-pointer hover:brightness-95 hover:ring-2 hover:ring-offset-1 hover:ring-slate-300 transition-all select-none origin-left active:scale-95"
                  )}
                >
                  在庫: <span className={cn(
                    "text-lg font-bold mx-0.5",
                    item.is_archived ? "text-slate-500" : "text-black"
                  )}>
                    {item.stock_mode === 'approximate'
                      ? (item.approximate_quantity === 'many' ? '多' : '少')
                      : item.quantity}
                  </span>
                </button>
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
                {(sortOrder === 'updated-asc' || sortOrder === 'updated-desc') && !isEditMode && (
                  <div className="text-xs text-slate-400 ml-auto shrink-0">
                    更新 {formatUpdatedDate(item.last_updated)}
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

                {item.stock_mode === 'exact' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("!h-7 !w-7 p-0 border-slate-300 text-xs", item.approximate_quantity === 'few' && 'bg-slate-200 ring-1 ring-slate-400')}
                      onClick={() => handleLocalApproximate(item.product_id, 'few')}
                    >
                      少
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("!h-7 !w-7 p-0 border-slate-300 text-xs", item.approximate_quantity === 'many' && 'bg-slate-200 ring-1 ring-slate-400')}
                      onClick={() => handleLocalApproximate(item.product_id, 'many')}
                    >
                      多
                    </Button>
                  </>
                )}
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
        {isEditMode ? (
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancelEdit}
            disabled={isPending}
            className="h-12 w-12 rounded-full shadow-lg bg-white text-slate-500 border-slate-200 hover:bg-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <CloseIcon className="h-6 w-6" />
          </Button>
        ) : (
          <Link href={addProductHref} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-2xl bg-slate-900 text-white hover:bg-black hover:scale-110 active:scale-95 transition-all duration-300"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
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
