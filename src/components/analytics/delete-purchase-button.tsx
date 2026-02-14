'use client';

import { Button } from "@/components/ui/button";
import { deletePurchaseLine } from '@/app/actions';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export function DeletePurchaseButton({ id, productId }: { id: string, productId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm('この購入記録を削除しますか？（在庫数は変更されません）')) {
      setLoading(true);
      try {
        await deletePurchaseLine(id, productId);
      } catch (e) {
        alert('削除に失敗しました');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete} 
      disabled={loading}
      className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
    >
      <Trash2 size={14} />
    </Button>
  );
}
