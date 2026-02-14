'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteStoreButton } from '@/components/stores/delete-store-button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { updateStoreOrder } from '@/app/stores/actions';


export function StoreListClient({ stores }: { stores: any[] }) {
  const [loading, setLoading] = useState(false);

  const sortedStores = [...stores].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const moveStore = async (id: string, currentIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedStores.length) return;

    setLoading(true);
    try {
      const otherStore = sortedStores[newIndex];
      // 順序を入れ替える
      await updateStoreOrder(id, otherStore.sort_order || 0);
      await updateStoreOrder(otherStore.id, sortedStores[currentIndex].sort_order || 0);
    } catch (e) {
      alert('並び替えの保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-2">
        矢印ボタンでお店の並び順を変更できます。
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">順序</TableHead>
              <TableHead>店名</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStores.map((store, index) => (
              <TableRow key={store.id}>
                <TableCell>
                  <div className="flex flex-col items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={() => moveStore(store.id, index, 'up')}
                      disabled={index === 0 || loading}
                    >
                      <ArrowUp size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={() => moveStore(store.id, index, 'down')}
                      disabled={index === sortedStores.length - 1 || loading}
                    >
                      <ArrowDown size={14} />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell className="text-right">
                  <DeleteStoreButton id={store.id} />
                </TableCell>
              </TableRow>
            ))}
            {sortedStores.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                  お店が登録されていません。右上のボタンから追加してください。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
