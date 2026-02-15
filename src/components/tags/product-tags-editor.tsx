'use client';

import { useState } from 'react';
import { TagBadge } from './tag-badge';
import { TagSelector } from './tag-selector';
import { Button } from '@/components/ui/button';
import { Plus, Tag as TagIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { assignTagsToProduct } from '@/app/tags/actions';

interface Tag {
  id: string;
  name: string;
  color_key: string;
}

interface ProductTagsEditorProps {
  productId: string;
  currentTags: Tag[];
  allTags: Tag[];
}

export function ProductTagsEditor({ productId, currentTags, allTags }: ProductTagsEditorProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ダイアログを開く際に現在のタグを初期値としてセットする
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setSelectedTagIds(currentTags.map(t => t.id));
    }
    setIsDialogOpen(open);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await assignTagsToProduct(productId, selectedTagIds);
      setIsDialogOpen(false);
    } catch (e) {
      alert('タグの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TagIcon size={16} className="text-slate-400" />
      {currentTags.map((tag) => (
        <TagBadge key={tag.id} name={tag.name} colorKey={tag.color_key} />
      ))}
      
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200">
            <Plus size={14} className="mr-1" /> タグを編集
          </Button>
        </DialogTrigger>
        <DialogContent 
          className="bg-white border-2 border-slate-400 shadow-2xl max-w-[90vw] sm:max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl">タグの編集</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <TagSelector 
              allTags={allTags} 
              selectedTagIds={selectedTagIds} 
              onChange={setSelectedTagIds} 
              inline={true}
            />
          </div>
          <DialogFooter className="border-t pt-4">
            <Button 
              onClick={handleSave} 
              disabled={loading} 
              className="w-full sm:w-auto px-8 font-bold h-11"
            >
              {loading ? '保存中...' : 'タグを更新する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
