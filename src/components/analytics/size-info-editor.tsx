'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePurchaseLineSizeInfo } from '@/app/actions';
import { Pencil, Save, X } from 'lucide-react';

export function SizeInfoEditor({ id, productId, initialSizeInfo }: { id: string, productId: string, initialSizeInfo: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [sizeInfo, setSizeInfo] = useState(initialSizeInfo || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updatePurchaseLineSizeInfo(id, productId, sizeInfo);
      setIsEditing(false);
    } catch (e) {
      alert('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">
          {sizeInfo ? `(${sizeInfo})` : ''}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(true)}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        >
          <Pencil size={12} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      <Input
        className="h-6 text-xs w-32 px-1"
        value={sizeInfo}
        onChange={(e) => setSizeInfo(e.target.value)}
        autoFocus
      />
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleSave} disabled={loading}>
        <Save size={12} className="text-green-600" />
      </Button>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsEditing(false)} disabled={loading}>
        <X size={12} className="text-gray-400" />
      </Button>
    </div>
  );
}
