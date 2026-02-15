'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProductName } from '@/app/products/actions';
import { Pencil, Save, X } from 'lucide-react';

export function ProductNameEditor({ id, initialName }: { id: string, initialName: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await updateProductName(id, name);
      setIsEditing(false);
    } catch (e) {
      alert('商品名の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-2xl font-bold">{name}</h1>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(true)}
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <Pencil size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mb-2">
      <Input
        className="text-xl font-bold h-10 focus:ring-2 focus:ring-blue-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={loading} className="h-8 px-2 text-xs">
          <X size={14} className="mr-1" /> キャンセル
        </Button>
        <Button variant="default" size="sm" onClick={handleSave} disabled={loading || !name.trim()} className="h-8 px-3 text-xs font-bold">
          <Save size={14} className="mr-1" /> 保存
        </Button>
      </div>
    </div>
  );
}
