'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUp, ArrowDown, Trash2, Settings2, Save, X, GripVertical } from 'lucide-react';
import { updateCategoriesOrder, deleteCategory } from '@/app/categories/actions';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCategoryRow({ 
  cat, 
  index, 
  isSorting, 
  isDragging 
}: { 
  cat: any, 
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
            className="flex justify-center p-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors"
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

export function CategoryListClient({ categories }: { categories: any[] }) {
  const [isSorting, setIsSorting] = useState(false);
  const [localCategories, setLocalCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedInitialCategories = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  useEffect(() => {
    setLocalCategories(sortedInitialCategories);
  }, [categories]);

  const handleStartSorting = () => {
    setIsSorting(true);
    setLocalCategories(sortedInitialCategories);
  };

  const handleCancelSorting = () => {
    setIsSorting(false);
    setLocalCategories(sortedInitialCategories);
  };

  const handleSaveSorting = async () => {
    setLoading(true);
    try {
      const updates = localCategories.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        sort_order: index + 1
      }));
      await updateCategoriesOrder(updates);
      setIsSorting(false);
    } catch (e) {
      alert('並び替えの保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const displayCategories = isSorting ? localCategories : sortedInitialCategories;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 bg-slate-100 p-3 rounded-lg border border-slate-300 shadow-sm">
        <div className="text-sm text-slate-600">
          {isSorting 
            ? "ハンドルをドラッグして順序を入れ替え、「保存」を押してください。" 
            : "カテゴリの表示順序を変更できます。"}
        </div>
        <div className="flex gap-2">
          {isSorting ? (
            <>
              <Button size="sm" variant="outline" onClick={handleCancelSorting} disabled={loading}>
                <X size={16} className="mr-1" /> キャンセル
              </Button>
              <Button size="sm" onClick={handleSaveSorting} disabled={loading}>
                <Save size={16} className="mr-1" /> 保存
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={handleStartSorting}>
              <Settings2 size={16} className="mr-1" /> 並び替え
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-md">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
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

