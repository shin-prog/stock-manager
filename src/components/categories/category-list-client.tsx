'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Settings2, Save, X, GripVertical, Pencil, Check } from 'lucide-react';
import { updateCategoriesOrder, updateCategoryName, deleteCategory } from '@/app/categories/actions';
import {
  DndContext,
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
  restrictToFirstScrollableAncestor,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSortableList } from '@/hooks/use-sortable-list';
import { FilterPanel } from '@/components/ui/filter-panel';

import { Category } from '@/types';

function SortableCategoryRow({
  cat,
  index,
  isSorting,
  isDragging,
  isEditing,
  isOtherEditing,
  onStartEdit,
  onStopEdit,
}: {
  cat: Category,
  index: number,
  isSorting: boolean,
  isDragging?: boolean,
  isEditing: boolean,
  isOtherEditing: boolean,
  onStartEdit: () => void,
  onStopEdit: () => void,
}) {
  const [editName, setEditName] = useState(cat.name);
  const [saving, setSaving] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: cat.id, disabled: !isSorting });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
  };

  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === cat.name) {
      onStopEdit();
      setEditName(cat.name);
      return;
    }
    setSaving(true);
    try {
      await updateCategoryName(cat.id, trimmed);
      onStopEdit();
    } catch (e) {
      alert('カテゴリ名の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === 'Escape') {
      onStopEdit();
      setEditName(cat.name);
    }
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`${isSorting ? "bg-blue-50/30" : ""} ${isDragging ? "opacity-50" : ""}`}
    >
      <TableCell className="text-center">
        {isSorting ? (
          <div
            {...attributes}
            {...listeners}
            className="flex justify-center p-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors touch-none"
          >
            <GripVertical size={20} />
          </div>
        ) : (
          <span className="text-gray-400 text-xs">{index + 1}</span>
        )}
      </TableCell>
      <TableCell className="font-medium">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 text-sm border-slate-300"
              disabled={saving}
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleSaveName}
              disabled={saving}
            >
              <Check size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
              onClick={() => { onStopEdit(); setEditName(cat.name); }}
              disabled={saving}
            >
              <X size={16} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>{cat.name}</span>
            {!isSorting && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                onClick={() => { onStartEdit(); setEditName(cat.name); }}
                disabled={isOtherEditing}
              >
                <Pencil size={14} />
              </Button>
            )}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        {!isSorting && !isEditing && (
          <form action={deleteCategory} onSubmit={(e) => {
            if (isOtherEditing || !confirm('このカテゴリを削除しますか？紐付いている商品は「未分類」になります。')) e.preventDefault();
          }}>
            <input type="hidden" name="id" value={cat.id} />
            <Button variant="ghost" className="text-red-600 h-8 w-8 p-0" type="submit" disabled={isOtherEditing}>
              <Trash2 size={16} />
            </Button>
          </form>
        )}
      </TableCell>
    </TableRow>
  );
}

export function CategoryListClient({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedInitialCategories = useMemo(() =>
    [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    [categories]
  );

  const {
    isSorting,
    items,
    loading,
    sensors,
    startSorting,
    cancelSorting,
    saveSorting,
    handleDragEnd,
    collisionDetection,
  } = useSortableList(sortedInitialCategories, async (newItems) => {
    const updates = newItems.map((cat, index) => ({
      id: cat.id,
      name: cat.name,
      sort_order: index + 1
    }));
    await updateCategoriesOrder(updates);
  });

  const displayCategories = isSorting ? items : sortedInitialCategories;

  return (
    <div className="space-y-4">
      <FilterPanel className="justify-between">
        <div className="text-sm text-slate-600">
          {isSorting
            ? "ハンドルをドラッグして順序を入れ替え、「保存」を押してください。"
            : "カテゴリの表示順序を変更できます。"}
        </div>
        <div className="flex gap-2">
          {isSorting ? (
            <>
              <Button size="sm" variant="outline" onClick={cancelSorting} disabled={loading}>
                <X size={16} className="mr-1" /> キャンセル
              </Button>
              <Button size="sm" onClick={saveSorting} disabled={loading}>
                <Save size={16} className="mr-1" /> 保存
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={startSorting}>
              <Settings2 size={16} className="mr-1" /> 並び替え
            </Button>
          )}
        </div>
      </FilterPanel>

      <div className="border rounded-md">
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">順序</TableHead>
                <TableHead>カテゴリ名</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={displayCategories.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {displayCategories.map((cat, index) => (
                  <SortableCategoryRow
                    key={cat.id}
                    cat={cat}
                    index={index}
                    isSorting={isSorting}
                    isEditing={editingId === cat.id}
                    isOtherEditing={editingId !== null && editingId !== cat.id}
                    onStartEdit={() => setEditingId(cat.id)}
                    onStopEdit={() => setEditingId(null)}
                  />
                ))}
              </SortableContext>
              {displayCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                    カテゴリが登録されていません。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}


