'use client';

import { useState, useCallback, useTransition } from 'react';
import { ClipboardCheck, Check, ChevronRight, ShoppingCart, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAppSettings } from '@/hooks/use-app-settings';
import { StockItem } from './inventory-container';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { batchUpdateInventory, touchStockLastUpdated } from '@/app/actions';
import { StockMode, ApproximateQuantity, StockStatus } from '@/types';

interface StaleStockDialogProps {
    stockItems: StockItem[];
    onOpenChange?: (open: boolean) => void;
}

interface ItemDraft {
    quantity: number;
    stock_mode: StockMode;
    approximate_quantity: ApproximateQuantity;
    stock_status: StockStatus;
}

const STATUS_CYCLE: StockStatus[] = ['sufficient', 'needed', 'unchecked'];

function getNextStatus(current: StockStatus): StockStatus {
    const idx = STATUS_CYCLE.indexOf(current);
    return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

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
                icon: <Minus className="h-4 w-4" />,
                className: 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200',
            };
    }
}

export function StaleStockDialog({ stockItems, onOpenChange }: StaleStockDialogProps) {
    const { staleDays, isLoaded } = useAppSettings();
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
    const [drafts, setDrafts] = useState<Map<string, ItemDraft>>(new Map());
    const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
    const [open, setOpen] = useState(false);
    const [, startTransition] = useTransition();

    const handleOpenChange = (val: boolean) => {
        setOpen(val);
        onOpenChange?.(val);
        if (val) {
            setDismissedIds(new Set());
            setAnimatingIds(new Set());
            setDrafts(new Map());
            setSavingIds(new Set());
        }
    };

    const now = Date.now();
    const thresholdMs = staleDays * 24 * 60 * 60 * 1000;

    const staleItems = stockItems.filter((item) => {
        if (item.is_archived) return false;
        if (!item.last_updated) return true;
        return now - new Date(item.last_updated).getTime() >= thresholdMs;
    });

    const visibleItems = staleItems.filter((item) => !dismissedIds.has(item.product_id));
    const staleCount = staleItems.length;

    const getDraft = (item: StockItem): ItemDraft =>
        drafts.get(item.product_id) ?? {
            quantity: item.quantity,
            stock_mode: item.stock_mode,
            approximate_quantity: item.approximate_quantity,
            stock_status: item.stock_status,
        };

    const updateDraft = (productId: string, patch: Partial<ItemDraft>) => {
        const item = staleItems.find((i) => i.product_id === productId)!;
        setDrafts((prev) => {
            const current = prev.get(productId) ?? {
                quantity: item.quantity,
                stock_mode: item.stock_mode,
                approximate_quantity: item.approximate_quantity,
                stock_status: item.stock_status,
            };
            return new Map(prev).set(productId, { ...current, ...patch });
        });
    };

    const handleAdjust = (productId: string, amount: number) => {
        const item = staleItems.find((i) => i.product_id === productId)!;
        const draft = getDraft(item);
        updateDraft(productId, {
            quantity: Math.max(0, draft.quantity + amount),
            stock_mode: 'exact',
        });
    };

    const handleModeToggle = (productId: string) => {
        const item = staleItems.find((i) => i.product_id === productId)!;
        const draft = getDraft(item);
        const newMode: StockMode = draft.stock_mode === 'exact' ? 'approximate' : 'exact';
        updateDraft(productId, {
            stock_mode: newMode,
            approximate_quantity:
                newMode === 'approximate' && !draft.approximate_quantity ? 'few' : draft.approximate_quantity,
        });
    };

    const handleApproximate = (productId: string, val: ApproximateQuantity) => {
        updateDraft(productId, { approximate_quantity: val });
    };

    const handleStatusToggle = (productId: string) => {
        const item = staleItems.find((i) => i.product_id === productId)!;
        const draft = getDraft(item);
        updateDraft(productId, { stock_status: getNextStatus(draft.stock_status) });
    };

    const animateDismiss = (ids: string[]) => {
        setAnimatingIds((prev) => new Set([...prev, ...ids]));
        setTimeout(() => {
            setDismissedIds((prev) => new Set([...prev, ...ids]));
            setAnimatingIds((prev) => {
                const n = new Set(prev);
                ids.forEach((id) => n.delete(id));
                return n;
            });
        }, 350);
    };

    const saveAndDismiss = useCallback(
        async (item: StockItem) => {
            const draft = drafts.get(item.product_id);
            const hasChanges =
                draft &&
                (draft.quantity !== item.quantity ||
                    draft.stock_mode !== item.stock_mode ||
                    draft.approximate_quantity !== item.approximate_quantity ||
                    draft.stock_status !== item.stock_status);

            setSavingIds((prev) => new Set([...prev, item.product_id]));
            try {
                if (hasChanges && draft) {
                    await batchUpdateInventory([
                        {
                            productId: item.product_id,
                            quantityDelta: draft.quantity - item.quantity,
                            newQuantity: draft.quantity,
                            categoryId: item.category_id,
                            stockStatus: draft.stock_status,
                            stockMode: draft.stock_mode,
                            approximateQuantity: draft.approximate_quantity,
                        },
                    ]);
                } else {
                    await touchStockLastUpdated([item.product_id]);
                }
            } catch {
                alert('更新に失敗しました');
                setSavingIds((prev) => { const n = new Set(prev); n.delete(item.product_id); return n; });
                return;
            }
            setSavingIds((prev) => { const n = new Set(prev); n.delete(item.product_id); return n; });
            animateDismiss([item.product_id]);
        },
        [drafts]
    );

    const handleDismissAll = () => {
        startTransition(async () => {
            const withChanges = visibleItems.filter((item) => {
                const draft = drafts.get(item.product_id);
                return draft && (
                    draft.quantity !== item.quantity ||
                    draft.stock_mode !== item.stock_mode ||
                    draft.approximate_quantity !== item.approximate_quantity ||
                    draft.stock_status !== item.stock_status
                );
            });
            const withoutChanges = visibleItems.filter((item) => !withChanges.includes(item));

            try {
                const ops: Promise<any>[] = [];
                if (withChanges.length > 0) {
                    ops.push(batchUpdateInventory(withChanges.map((item) => {
                        const draft = drafts.get(item.product_id)!;
                        return {
                            productId: item.product_id,
                            quantityDelta: draft.quantity - item.quantity,
                            newQuantity: draft.quantity,
                            categoryId: item.category_id,
                            stockStatus: draft.stock_status,
                            stockMode: draft.stock_mode,
                            approximateQuantity: draft.approximate_quantity,
                        };
                    })));
                }
                if (withoutChanges.length > 0) {
                    ops.push(touchStockLastUpdated(withoutChanges.map((i) => i.product_id)));
                }
                await Promise.all(ops);
            } catch {
                alert('一括更新に失敗しました');
                return;
            }
            animateDismiss(visibleItems.map((i) => i.product_id));
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button
                    className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-500 hover:text-amber-600 transition-colors text-xs font-medium shadow-sm shrink-0"
                    title="棚卸し"
                >
                    <ClipboardCheck className="h-4 w-4" />
                    <span>棚卸し</span>
                    {isLoaded && staleCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                            {staleCount > 9 ? '9+' : staleCount}
                        </span>
                    )}
                </button>
            </DialogTrigger>

            <DialogContent
                className="bg-white border-2 border-slate-400 shadow-2xl max-w-sm w-full max-h-[80vh] flex flex-col pt-4 px-4 pb-2"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader className="shrink-0 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <ClipboardCheck className="h-5 w-5 text-amber-500" />
                        棚卸し
                    </DialogTitle>
                </DialogHeader>

                {staleCount === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-3 text-slate-400">
                        <Check className="h-10 w-10 text-emerald-400" />
                        <p className="text-sm font-medium">未更新の商品はありません</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-y-auto flex-1 -mx-4 px-4 space-y-0">
                            {visibleItems.map((item) => {
                                const draft = getDraft(item);
                                const isSaving = savingIds.has(item.product_id);
                                const isApprox = draft.stock_mode === 'approximate';
                                const statusInfo = getStatusButtonInfo(draft.stock_status);

                                return (
                                    <div
                                        key={item.product_id}
                                        className={cn(
                                            'flex flex-col py-3 border-b border-slate-100 last:border-b-0',
                                            animatingIds.has(item.product_id) && 'animate-slide-out-right'
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="flex-1 min-w-0 pr-2 space-y-1.5">
                                                <Link
                                                    href={`/products/${item.product_id}`}
                                                    onClick={() => handleOpenChange(false)}
                                                    className="hover:underline flex-1 min-w-0 block"
                                                >
                                                    <div className="font-bold text-base text-slate-900 leading-tight">
                                                        {item.product_name}
                                                    </div>
                                                </Link>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* 在庫バッジ（タップでモード切替） */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleModeToggle(item.product_id)}
                                                        className="rounded-md px-2 h-7 border text-xs font-medium bg-slate-50 text-slate-500 border-slate-200 cursor-pointer hover:bg-slate-100 transition-all select-none active:scale-95 shrink-0"
                                                    >
                                                        在庫:{' '}
                                                        <span className="text-sm font-bold text-black ml-0.5">
                                                            {isApprox ? (draft.approximate_quantity === 'many' ? '多' : '少') : draft.quantity}
                                                        </span>
                                                    </button>

                                                    <div className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0">
                                                        {item.category}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 右側: ボタン群 (健全マーク, 操作, 確認) */}
                                            <div className="flex items-center gap-1 shrink-0 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusToggle(item.product_id)}
                                                    className={cn(
                                                        'h-8 w-8 rounded flex items-center justify-center border transition-all active:scale-95 shrink-0',
                                                        statusInfo.className
                                                    )}
                                                    title="ステータス切り替え"
                                                >
                                                    {statusInfo.icon}
                                                </button>

                                                {!isApprox ? (
                                                    <>
                                                        <Button variant="outline" size="sm"
                                                            className="!h-8 !w-9 p-0 border-slate-300 text-xs font-bold bg-white hover:bg-slate-100 shrink-0"
                                                            onClick={() => handleAdjust(item.product_id, -1)}
                                                            disabled={draft.quantity <= 0}
                                                        >-1</Button>
                                                        <Button variant="outline" size="sm"
                                                            className="!h-8 !w-9 p-0 border-slate-300 text-xs font-bold bg-white hover:bg-slate-100 shrink-0"
                                                            onClick={() => handleAdjust(item.product_id, 1)}
                                                        >+1</Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button variant="outline" size="sm"
                                                            className={cn('!h-8 !w-9 p-0 border-slate-300 text-xs font-bold shrink-0', draft.approximate_quantity === 'few' ? 'bg-slate-200 ring-1 ring-slate-400' : 'bg-white hover:bg-slate-100')}
                                                            onClick={() => handleApproximate(item.product_id, 'few')}
                                                        >少</Button>
                                                        <Button variant="outline" size="sm"
                                                            className={cn('!h-8 !w-9 p-0 border-slate-300 text-xs font-bold shrink-0', draft.approximate_quantity === 'many' ? 'bg-slate-200 ring-1 ring-slate-400' : 'bg-white hover:bg-slate-100')}
                                                            onClick={() => handleApproximate(item.product_id, 'many')}
                                                        >多</Button>
                                                    </>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isSaving}
                                                    onClick={() => saveAndDismiss(item)}
                                                    className="!h-8 !w-10 p-0 ml-1 shrink-0 border-emerald-300 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-60 shadow-sm"
                                                >
                                                    <Check className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {visibleItems.length > 1 && (
                            <div className="shrink-0 border-t border-slate-100 pt-3 mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-sm font-bold border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-10 shadow-sm"
                                    onClick={handleDismissAll}
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    すべて確認済みにする ({visibleItems.length}件)
                                </Button>
                            </div>
                        )}

                        <div className="shrink-0 pt-2 pb-1 text-center">
                            <Link
                                href="/settings/app-settings"
                                onClick={() => handleOpenChange(false)}
                                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <span>設定 ({staleDays}日以上で抽出) を変更</span>
                                <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
