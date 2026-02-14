'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitPurchase } from '@/app/actions';

import { useTransition } from 'react';

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
      <h3 className="font-bold text-base border-b pb-2">この商品をすぐに購入登録</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">購入日</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} bs-size="sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">お店</Label>
          <Select value={storeId} onValueChange={setStoreId}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent>
              {stores.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">個数</Label>
          <Input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">容量・メモ</Label>
          <Input 
            placeholder="100ml等" 
            value={sizeInfo} 
            onChange={e => setSizeInfo(e.target.value)} 
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">単価 (1つあたり)</Label>
        <Input 
          type="number" 
          placeholder="金額を入力"
          value={price} 
          onChange={e => setPrice(e.target.value)} 
        />
      </div>

      <Button onClick={handleSubmit} className="w-full" disabled={isPending}>
        {isPending ? '登録中...' : 'この内容で購入登録する'}
      </Button>
    </div>
  );
}
