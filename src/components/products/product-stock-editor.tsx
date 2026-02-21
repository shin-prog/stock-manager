'use client';

import { useState, useTransition, useEffect } from 'react';
import { setStock } from '@/app/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductStockEditorProps {
    productId: string;
    initialQuantity: number;
    initialStockMode: 'exact' | 'approximate';
    initialApproximateQuantity: 'many' | 'few' | null;
}

export function ProductStockEditor({ productId, initialQuantity, initialStockMode, initialApproximateQuantity }: ProductStockEditorProps) {
    const [quantity, setQuantity] = useState(initialQuantity);
    const [stockMode, setStockMode] = useState(initialStockMode);
    const [approxValue, setApproxValue] = useState(initialApproximateQuantity);
    const [isPending, startTransition] = useTransition();

    // サーバー側の値が変わったら同期する（他画面での更新反映のため）
    useEffect(() => {
        setQuantity(initialQuantity);
        setStockMode(initialStockMode);
        setApproxValue(initialApproximateQuantity);
    }, [initialQuantity, initialStockMode, initialApproximateQuantity]);

    const handleChange = (val: string) => {
        let newQty = quantity;
        let newMode: 'exact' | 'approximate' = 'exact';
        let newApprox: 'many' | 'few' | null = null;

        if (val.startsWith('approximate-')) {
            newMode = 'approximate';
            newApprox = val.split('-')[1] as 'many' | 'few';
        } else {
            newQty = parseInt(val);
        }

        setQuantity(newQty);
        setStockMode(newMode);
        setApproxValue(newApprox);

        startTransition(async () => {
            try {
                await setStock(productId, newQty, newMode, newApprox);
            } catch (e) {
                setQuantity(initialQuantity);
                setStockMode(initialStockMode);
                setApproxValue(initialApproximateQuantity);
                alert('在庫の更新に失敗しました');
            }
        });
    };

    const displayValue = stockMode === 'approximate' && approxValue ? `approximate-${approxValue}` : quantity.toString();

    return (
        <div className="inline-flex items-center gap-2 h-9 px-2.5 bg-slate-100/50 rounded-md border border-slate-200/60 transition-colors hover:bg-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">在庫</span>

            <div className="flex items-center gap-1.5">
                <Select
                    value={displayValue}
                    onValueChange={handleChange}
                    disabled={isPending}
                >
                    <SelectTrigger className="h-7 w-auto min-w-[40px] border-none bg-transparent p-0 text-sm font-bold text-slate-700 shadow-none focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-[250px]">
                        <SelectItem value="approximate-few" className="font-bold text-slate-700">少</SelectItem>
                        <SelectItem value="approximate-many" className="font-bold text-slate-700">多</SelectItem>
                        <div className="h-px bg-slate-200 my-1 font-normal" />
                        {[...Array(101)].map((_, i) => (
                            <SelectItem key={i} value={i.toString()}>{i.toString()}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {isPending && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
            </div>
        </div>
    );
}
