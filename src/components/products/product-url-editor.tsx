'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProductUrl } from '@/app/products/actions';
import { ExternalLink, Link as LinkIcon, Pencil, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProductUrlEditor({ id, initialUrl }: { id: string, initialUrl: string | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [url, setUrl] = useState(initialUrl || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProductUrl(id, url);
      setIsEditing(false);
    } catch (e) {
      alert('URLの保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 mb-4">
        {initialUrl ? (
          <a 
            href={initialUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            <ExternalLink size={14} />
            商品ページを開く
          </a>
        ) : (
          <div className="text-sm text-slate-400 flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-200 rounded-md">
            <LinkIcon size={14} />
            URL未設定
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(true)}
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <Pencil size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-4 space-y-2">
      <div className="flex items-center gap-2">
        <LinkIcon size={16} className="text-slate-400" />
        <Input
          placeholder="https://example.com/..."
          className="h-9 text-sm bg-white"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={loading} className="h-7 text-xs">
          キャンセル
        </Button>
        <Button variant="default" size="sm" onClick={handleSave} disabled={loading} className="h-7 text-xs font-bold">
          URLを保存
        </Button>
      </div>
    </div>
  );
}
