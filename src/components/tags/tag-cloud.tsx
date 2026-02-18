'use client';

import { useState } from 'react';
import { TagBadge } from './tag-badge';
import { Button } from '@/components/ui/button';
import { Settings2, Trash2, Search } from 'lucide-react';
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
import { createTag, updateTag, deleteTag, bulkUpdateTagColors } from '@/app/tags/actions';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Palette, CheckCircle2, Tag } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  color_key: string;
  created_at?: string;
}

type SortOption = 'name' | 'color' | 'created';

export function TagCloud({ initialTags }: { initialTags: Tag[] }) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [isEditing, setIsEditing] = useState<Tag | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('slate');
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('color');
  const [filterColor, setFilterColor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isBatchColorDialogOpen, setIsBatchColorDialogOpen] = useState(false);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkColorUpdate = async (colorKey: string) => {
    if (selectedIds.size === 0) return;
    setLoading(true);
    try {
      await bulkUpdateTagColors(Array.from(selectedIds), colorKey);
      setTags(tags.map(t =>
        selectedIds.has(t.id) ? { ...t, color_key: colorKey } : t
      ));
      setIsBatchColorDialogOpen(false);
      setIsBatchMode(false);
      setSelectedIds(new Set());
    } catch (e) {
      alert('一括更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

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
      setIsDialogOpen(false);
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
      setIsDialogOpen(false);
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

  // フィルタとソートを適用した表示用タグ
  const displayTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesColor = filterColor === 'all' || tag.color_key === filterColor;
    return matchesSearch && matchesColor;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'color': {
        const indexA = PRESET_COLORS.findIndex(c => c.key === a.color_key);
        const indexB = PRESET_COLORS.findIndex(c => c.key === b.color_key);
        if (indexA !== indexB) return indexA - indexB;
        return a.name.localeCompare(b.name);
      }
      case 'created': {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      }
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const usedColorKeys = new Set(tags.map(t => t.color_key));
  const availableColors = PRESET_COLORS.filter(c => usedColorKeys.has(c.key)).map(c => c.key);

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-3 rounded-xl border shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-sm font-bold text-slate-600 px-2 flex items-center gap-2">
            {isBatchMode ? `選択中: ${selectedIds.size}件` : "タグ一覧"}
          </div>
          <div className="flex gap-2">
            {isBatchMode ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsBatchMode(false);
                    setSelectedIds(new Set());
                  }}
                  className="font-bold text-slate-500"
                >
                  キャンセル
                </Button>
                <Dialog open={isBatchColorDialogOpen} onOpenChange={setIsBatchColorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      disabled={selectedIds.size === 0}
                      className="bg-blue-600 hover:bg-blue-700 font-bold gap-2 px-4 shadow-sm"
                    >
                      <Palette size={16} /> 色を変更
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border shadow-lg max-w-[320px] rounded-xl">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900 text-lg">
                        {selectedIds.size}件のタグを一括変更
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="flex flex-wrap justify-center gap-3">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color.key}
                            type="button"
                            onClick={() => handleBulkColorUpdate(color.key)}
                            className={cn(
                              "h-9 w-9 rounded-full transition-all flex items-center justify-center border",
                              color.solid,
                              "hover:scale-110 active:scale-95 shadow-sm border-black/5"
                            )}
                            disabled={loading}
                          />
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBatchMode(true)}
                className="font-bold"
              >
                一括編集
              </Button>
            )}
          </div>
        </div>

        {!isBatchMode && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="タグを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-white border-slate-200 text-sm"
              />
            </div>
            <div className="flex gap-2 items-center overflow-x-auto pb-1 no-scrollbar">
              <div
                onClick={() => setFilterColor('all')}
                className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all",
                  filterColor === 'all' ? "border-slate-800 scale-110" : "border-slate-200 hover:border-slate-400"
                )}
                title="すべて"
              >
                <div className="w-4 h-4 rounded-full bg-slate-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-400 via-green-400 to-blue-400 opacity-70" />
                </div>
              </div>
              {availableColors.map(colorKey => {
                const color = PRESET_COLORS.find(c => c.key === colorKey);
                if (!color) return null;
                return (
                  <div
                    key={colorKey}
                    onClick={() => setFilterColor(colorKey)}
                    className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all",
                      filterColor === colorKey ? "border-slate-800 scale-110" : "border-slate-200 hover:border-slate-400"
                    )}
                    title={color.name}
                  >
                    <div className={cn("w-4 h-4 rounded-full", color.solid)} />
                  </div>
                );
              })}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 px-3 py-1 bg-white border border-slate-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-400/20"
            >
              <option value="name">名前順</option>
              <option value="color">色順</option>
              <option value="created">新着順</option>
            </select>
          </div>
        )}
      </div>

      <div className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-sm min-h-[150px]",
        sortBy === 'color' ? "divide-y divide-slate-100" : "flex flex-wrap gap-4 p-4"
      )}>
        {sortBy === 'color' ? (
          // 色順のとき：色ごとにセクション分け
          PRESET_COLORS.filter(c => displayTags.some(t => t.color_key === c.key)).map(color => (
            <div key={color.key} className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full shrink-0", color.solid)} />
                <span className="text-xs font-medium text-slate-500">{color.name}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {displayTags.filter(t => t.color_key === color.key).map(tag => (
                  <TagChip key={tag.id} tag={tag} isBatchMode={isBatchMode} selectedIds={selectedIds} toggleSelection={toggleSelection} startEdit={startEdit} />
                ))}
              </div>
            </div>
          ))
        ) : (
          // その他のソート：従来のフラット表示
          displayTags.map(tag => (
            <TagChip key={tag.id} tag={tag} isBatchMode={isBatchMode} selectedIds={selectedIds} toggleSelection={toggleSelection} startEdit={startEdit} />
          ))
        )}

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setIsEditing(null);
            resetForm();
          }
        }}>
          <DialogContent
            className="bg-white border shadow-xl rounded-xl max-w-[360px]"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl text-slate-900">{isEditing ? 'タグを編集' : '新規タグ作成'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6 font-sans">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold text-slate-700 ml-1">タグ名</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="例: 飲料、要冷蔵など"
                  className="border-slate-300 focus:border-slate-500 h-11"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-bold text-slate-700 ml-1">カラー</Label>
                <div className="flex flex-wrap justify-center gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.key}
                      type="button"
                      onClick={() => setNewColor(color.key)}
                      className={cn(
                        "relative h-9 w-9 rounded-full transition-all flex items-center justify-center border shadow-sm border-black/5",
                        color.solid,
                        "hover:scale-110 active:scale-95",
                        newColor === color.key ? "ring-2 ring-offset-2 ring-slate-400 scale-105" : ""
                      )}
                    >
                      {newColor === color.key && <CheckCircle2 size={16} className="text-slate-700" />}
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
                {loading ? '処理中...' : (isEditing ? '更新内容を保存' : 'タグを作成')}
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

      {/* FAB */}
      {!isBatchMode && (
        <div className="fixed bottom-24 md:bottom-8 right-6 z-[1000]">
          <Button
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            className="h-14 w-14 rounded-full shadow-2xl bg-slate-900 hover:bg-black text-white hover:scale-110 active:scale-95 transition-all duration-300"
          >
            <Tag className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}

function TagChip({ tag, isBatchMode, selectedIds, toggleSelection, startEdit }: {
  tag: { id: string; name: string; color_key: string };
  isBatchMode: boolean;
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  startEdit: (tag: any) => void;
}) {
  return (
    <div className="group relative">
      <div
        onClick={() => isBatchMode ? toggleSelection(tag.id) : null}
        className="cursor-pointer"
      >
        {isBatchMode ? (
          <div className="relative">
            <TagBadge
              name={tag.name}
              colorKey={tag.color_key}
              className={cn(
                "text-sm py-2 px-4 transition-all duration-200 max-w-[180px]",
                selectedIds.has(tag.id)
                  ? "ring-2 ring-blue-500 scale-105"
                  : "opacity-40 grayscale-[0.2]"
              )}
            />
            {selectedIds.has(tag.id) && (
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-0.5 shadow-md">
                <CheckCircle2 size={14} />
              </div>
            )}
          </div>
        ) : (
          <Link href={`/tags/${tag.id}`}>
            <TagBadge
              name={tag.name}
              colorKey={tag.color_key}
              className="text-sm py-2 px-4 cursor-pointer hover:scale-105 transition-all shadow-sm ring-offset-2 max-w-[180px]"
            />
          </Link>
        )}
      </div>

      {!isBatchMode && (
        <button
          onClick={(e) => {
            e.preventDefault();
            startEdit(tag);
          }}
          className="absolute -top-2.5 -right-2.5 bg-white border border-slate-300 rounded-full p-1.5 transition-all shadow-sm hover:bg-slate-50 z-20 text-slate-600"
        >
          <Settings2 size={13} />
        </button>
      )}
    </div>
  );
}

