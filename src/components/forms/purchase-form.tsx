'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitPurchase } from '@/app/actions';

export function PurchaseForm({ products, stores, units }: { products: any[], stores: any[], units: any[] }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [storeId, setStoreId] = useState('');
  const [line, setLine] = useState({ productId: '', unitId: '', quantity: 1, price: '' as any, sizeInfo: '' });

  const updateLine = (field: string, value: any) => {
    const newLine = { ...line, [field]: value };
    
    // Auto-set unit if product changes
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newLine.unitId = product.default_unit_id;
      }
    }
    setLine(newLine);
  };

  const handleSubmit = async () => {
    if (!line.price || isNaN(Number(line.price))) {
      alert('単価を入力してください');
      return;
    }
    try {
      await submitPurchase({
        storeId,
        date,
        lines: [{ ...line, price: Number(line.price) }] 
      });
      alert('登録しました！');
      // Reset form
      setLine({ productId: '', unitId: '', quantity: 1, price: '', sizeInfo: '' });
      setStoreId('');
    } catch (error) {
      alert('エラーが発生しました: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-4">
      <div className="space-y-2">
        <Label>購入日</Label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>お店</Label>
        <Select value={storeId} onValueChange={setStoreId}>
          <SelectTrigger>
            <SelectValue placeholder="お店を選択" />
          </SelectTrigger>
          <SelectContent>
            {stores.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>購入商品</Label>
        <div className="border p-3 rounded-md space-y-3 bg-slate-50">
          <div className="space-y-1">
            <Label className="text-xs">商品名</Label>
            <Select value={line.productId} onValueChange={v => updateLine('productId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="商品を選択" />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="w-24 space-y-1">
              <Label className="text-xs">購入個数</Label>
              <Input type="number" value={line.quantity} onChange={e => updateLine('quantity', Number(e.target.value))} />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">容量・メモ (例: 100ml, 詰め替え)</Label>
              <Input 
                placeholder="サイズや種類のメモ" 
                value={line.sizeInfo} 
                onChange={e => updateLine('sizeInfo', e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">単価 (1つあたり)</Label>
            <Input 
              type="number" 
              placeholder="金額を入力"
              value={line.price} 
              onChange={e => updateLine('price', e.target.value)} 
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit} className="w-full" size="lg">登録する</Button>
    </div>
  );
}
