'use client';

import { adjustStock } from '@/app/actions';
import { Button } from "@/components/ui/button"

export function StockList({ stockItems }: { stockItems: any[] }) {
  
  const handleAdjust = async (productId: string, amount: number) => {
    try {
      await adjustStock(productId, amount, amount > 0 ? 'audit' : 'consumed');
    } catch (e) {
      alert('Failed to update stock');
    }
  };

  return (
    <div className="space-y-4">
      {stockItems.map((item) => (
        <div key={item.product_id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
          <div>
            <div className="font-bold text-lg">{item.product_name}</div>
            <div className="text-sm text-gray-500">
              現在: <span className="text-xl font-bold text-black mx-1">{item.quantity}</span> 個/つ
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAdjust(item.product_id, -1)}
            >
              -1
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAdjust(item.product_id, 1)}
            >
              +1
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
