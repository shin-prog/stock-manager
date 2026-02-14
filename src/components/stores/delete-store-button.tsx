'use client';

import { Button } from "@/components/ui/button";
import { deleteStore } from '@/app/stores/actions';

export function DeleteStoreButton({ id }: { id: string }) {
  const handleDelete = async (formData: FormData) => {
    if (confirm('このお店を削除しますか？購入履歴の店名表示が消える場合があります。')) {
      await deleteStore(formData);
    }
  };

  return (
    <form action={handleDelete}>
      <input type="hidden" name="id" value={id} />
      <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" size="sm" type="submit">
        削除
      </Button>
    </form>
  );
}
