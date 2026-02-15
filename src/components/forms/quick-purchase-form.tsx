'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitPurchase } from '@/app/actions';

import { useTransition } from 'react';

import { ShoppingCart } from 'lucide-react';

export function QuickPurchaseForm({ 
  productId, 
  stores,
  lastStoreId
}: { 
  productId: string, 
  stores: any[],
  lastStoreId?: string
}) {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [storeId, setStoreId] = useState(lastStoreId || '');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<string>('');
  const [sizeInfo, setSizeInfo] = useState('');

  const handleSubmit = async () => {
    if (!storeId) {
      alert('お店を選択してください');
      return;
    }
    if (!price || isNaN(Number(price))) {
      alert('単価を入力してください');
      return;
    }

    startTransition(async () => {
      try {
        await submitPurchase({
          storeId,
          date,
          lines: [{ 
            productId, 
            quantity, 
            price: Number(price), 
            sizeInfo,
            unitId: '' 
          }] 
        });
        setPrice('');
        setSizeInfo('');
      } catch (error) {
        if (!(error as any).digest?.startsWith('NEXT_REDIRECT')) {
          alert('エラーが発生しました: ' + (error as Error).message);
        }
      }
    });
  };

  return (
    <div className="bg-slate-50 border rounded-lg p-4 mb-8 space-y-4 text-sm">
      <div className="flex items-center gap-2 font-bold text-slate-700 border-b pb-2">
        <ShoppingCart size={18} />
        <span>購入を記録</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-bold text-slate-500">購入日</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} bs-size="sm" className="bg-white" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-bold text-slate-500">お店</Label>
          <Select value={storeId} onValueChange={setStoreId}>
            <SelectTrigger className="h-9 bg-white border-slate-400 shadow-sm">
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-300 shadow-lg">
              {stores.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-bold text-slate-500">個数</Label>
          <Input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="bg-white" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-bold text-slate-500">容量・メモ</Label>
          <Input 
            placeholder="100ml等" 
            value={sizeInfo} 
            onChange={e => setSizeInfo(e.target.value)} 
            className="bg-white"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-bold text-slate-500">単価</Label>
        <Input 
          type="number" 
          placeholder="金額を入力"
          value={price} 
          onChange={e => setPrice(e.target.value)} 
          className="bg-white h-10"
        />
      </div>

      <Button onClick={handleSubmit} className="w-full font-bold h-11" disabled={isPending}>
        {isPending ? '登録中...' : '購入を登録する'}
      </Button>
    </div>
  );
}
