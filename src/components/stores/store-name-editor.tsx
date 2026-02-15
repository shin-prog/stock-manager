'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateStoreName } from '@/app/stores/actions';
import { Pencil, Save, X } from 'lucide-react';

export function StoreNameEditor({ id, initialName }: { id: string, initialName: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await updateStoreName(id, name);
      setIsEditing(false);
    } catch (e) {
      alert('店名の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 group">
        <span className="font-medium">{name}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(true)}
          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Pencil size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        className="h-8 text-sm py-1"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={loading} className="h-7 w-7 p-0">
          <X size={14} />
        </Button>
        <Button variant="default" size="sm" onClick={handleSave} disabled={loading || !name.trim()} className="h-7 w-7 p-0">
          <Save size={14} />
        </Button>
      </div>
    </div>
  );
}
