'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Settings2, Save, X, GripVertical } from 'lucide-react';
import { updateCategoriesOrder, deleteCategory } from '@/app/categories/actions';
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
  isDragging 
}: { 
  cat: Category, 
  index: number, 
  isSorting: boolean, 
  isDragging?: boolean
}) {
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
      <TableCell className="font-medium">{cat.name}</TableCell>
      <TableCell className="text-right">
        {!isSorting && (
          <form action={deleteCategory} onSubmit={(e) => {
            if (!confirm('このカテゴリを削除しますか？紐付いている商品は「未分類」になります。')) e.preventDefault();
          }}>
            <input type="hidden" name="id" value={cat.id} />
            <Button variant="ghost" className="text-red-600 h-8 w-8 p-0" type="submit">
              <Trash2 size={16} />
            </Button>
          </form>
        )}
      </TableCell>
    </TableRow>
  );
}

export function CategoryListClient({ categories }: { categories: Category[] }) {
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


