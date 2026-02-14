'use client';

import { Button } from "@/components/ui/button";
import { deleteProduct } from '@/app/products/actions';
import { Trash2 } from 'lucide-react';

export function DeleteProductButton({ id }: { id: string }) {
  const handleDelete = async (formData: FormData) => {
    if (confirm('この商品を削除しますか？関連する購入履歴もすべて削除されます。')) {
      await deleteProduct(formData);
    }
  };

  return (
    <form action={handleDelete}>
      <input type="hidden" name="id" value={id} />
      <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0" type="submit">
        <Trash2 size={16} />
      </Button>
    </form>
  );
}
