'use client';

import { useState } from 'react';
import { TagBadge } from './tag-badge';
import { Button } from '@/components/ui/button';
import { Plus, Settings2, Trash2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRESET_COLORS } from '@/lib/colors';
import { createTag, updateTag, deleteTag } from '@/app/tags/actions';
import Link from 'next/link';

interface Tag {
  id: string;
  name: string;
  color_key: string;
}

export function TagCloud({ initialTags }: { initialTags: Tag[] }) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [isEditing, setIsEditing] = useState<Tag | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('slate');
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = async () => {
    if (!newName) return;
    setLoading(true);
    try {
      const tag = await createTag(newName, newColor);
      setTags([...tags, tag].sort((a, b) => a.name.localeCompare(b.name)));
      setIsDialogOpen(false);
      resetForm();
    } catch (e) {
      alert('タグの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!isEditing || !newName) return;
    setLoading(true);
    try {
      await updateTag(isEditing.id, newName, newColor);
      setTags(tags.map(t => t.id === isEditing.id ? { ...t, name: newName, color_key: newColor } : t).sort((a, b) => a.name.localeCompare(b.name)));
      setIsEditing(null);
      resetForm();
    } catch (e) {
      alert('タグの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このタグを削除しますか？商品の関連付けのみ解除されます。')) return;
    setLoading(true);
    try {
      await deleteTag(id);
      setTags(tags.filter(t => t.id !== id));
      setIsEditing(null);
    } catch (e) {
      alert('タグの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewColor('slate');
  };

  const startEdit = (tag: Tag) => {
    setIsEditing(tag);
    setNewName(tag.name);
    setNewColor(tag.color_key);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm min-h-[150px]">
        {tags.map((tag) => (
          <div key={tag.id} className="group relative">
            <Link href={`/tags/${tag.id}`}>
              <TagBadge 
                name={tag.name} 
                colorKey={tag.color_key} 
                className="text-sm py-2 px-4 cursor-pointer hover:scale-105 hover:shadow-md ring-offset-2"
              />
            </Link>
            <button 
              onClick={(e) => {
                e.preventDefault();
                startEdit(tag);
              }}
              className="absolute -top-3 -right-3 bg-white border border-slate-300 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-slate-50 z-20"
            >
              <Settings2 size={14} className="text-slate-700" />
            </button>
          </div>
        ))}

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setIsEditing(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full border-2 border-dashed border-slate-300 h-10 px-4 text-slate-500 hover:border-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all">
              <Plus size={18} className="mr-1" /> タグを追加
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="bg-white border-2 border-slate-400 shadow-2xl"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl text-slate-900">{isEditing ? 'タグを編集' : '新規タグ作成'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold text-slate-700">タグ名</Label>
                <Input 
                  id="name" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  placeholder="例: 飲料、要冷蔵など"
                  className="border-slate-300 focus:border-slate-500 h-11"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700">カラー</Label>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.key}
                      onClick={() => setNewColor(color.key)}
                      className={`
                        h-10 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all
                        ${color.bg} ${color.text} ${color.border}
                        ${newColor === color.key ? 'ring-2 ring-offset-2 ring-slate-600 scale-105 shadow-md border-slate-600' : 'opacity-80 hover:opacity-100 hover:scale-102'}
                      `}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center sm:justify-between border-t pt-4">
              {isEditing ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
                  onClick={() => handleDelete(isEditing.id)}
                  disabled={loading}
                >
                  <Trash2 size={18} className="mr-1" /> 削除
                </Button>
              ) : <div />}
              <Button 
                onClick={isEditing ? handleUpdate : handleCreate} 
                disabled={loading || !newName}
                className="px-8 font-bold h-11"
              >
                {loading ? '保存中...' : (isEditing ? '更新する' : '作成する')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {tags.length === 0 && (
        <div className="text-center text-slate-400 py-12">
          タグが登録されていません。
        </div>
      )}
    </div>
  );
}
