'use client';

import { useState, useTransition, useEffect } from 'react';
import { setStock } from '@/app/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductStockEditorProps {
    productId: string;
    initialQuantity: number;
}

export function ProductStockEditor({ productId, initialQuantity }: ProductStockEditorProps) {
    const [quantity, setQuantity] = useState(initialQuantity);
    const [isPending, startTransition] = useTransition();

    // サーバー側の値が変わったら同期する（他画面での更新反映のため）
    useEffect(() => {
        setQuantity(initialQuantity);
    }, [initialQuantity]);

    const handleChange = (val: string) => {
        const newQty = parseInt(val);
        setQuantity(newQty);

        startTransition(async () => {
            try {
                await setStock(productId, newQty);
            } catch (e) {
                setQuantity(initialQuantity);
                alert('在庫の更新に失敗しました');
            }
        });
    };

    return (
        <div className="inline-flex items-center gap-2 h-8 px-2 bg-slate-100/50 rounded-md border border-slate-200/60 transition-colors hover:bg-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">在庫</span>

            <div className="flex items-center gap-1.5">
                <Select
                    value={quantity.toString()}
                    onValueChange={handleChange}
                    disabled={isPending}
                >
                    <SelectTrigger className="h-6 w-auto min-w-[40px] border-none bg-transparent p-0 text-xs font-bold text-slate-700 shadow-none focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-[250px]">
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
