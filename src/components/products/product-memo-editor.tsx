'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { updateProductMemo } from '@/app/products/actions';
import { Pencil, Save, X } from 'lucide-react';

export function ProductMemoEditor({ id, initialMemo }: { id: string, initialMemo: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [memo, setMemo] = useState(initialMemo || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProductMemo(id, memo);
      setIsEditing(false);
    } catch (e) {
      alert('メモの保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-sm text-amber-900 mb-6">
        <div className="flex justify-between items-start">
          <div className="whitespace-pre-wrap">{memo || 'メモを入力してください...'}</div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0 text-amber-700 hover:bg-amber-100 shrink-0"
          >
            <Pencil size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-6 space-y-2">
      <textarea
        className="w-full bg-white border rounded p-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-amber-500"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="商品の特徴、使い方、特記事項など..."
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={loading}>
          <X size={14} className="mr-1" /> キャンセル
        </Button>
        <Button variant="default" size="sm" onClick={handleSave} disabled={loading} className="bg-amber-600 hover:bg-amber-700">
          <Save size={14} className="mr-1" /> 保存
        </Button>
      </div>
    </div>
  );
}
