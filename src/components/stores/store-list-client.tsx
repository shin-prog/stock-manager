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
import { DeleteStoreButton } from '@/components/stores/delete-store-button';
import { ArrowUp, ArrowDown, Settings2, Save, X, GripVertical } from 'lucide-react';
import { updateStoresOrder } from '@/app/stores/actions';
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

function SortableStoreRow({ 
  store, 
  index, 
  isSorting, 
  isDragging
}: { 
  store: any, 
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
  } = useSortable({ id: store.id, disabled: !isSorting });

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
      <TableCell className="font-medium">{store.name}</TableCell>
      <TableCell className="text-right">
        {!isSorting && <DeleteStoreButton id={store.id} />}
      </TableCell>
    </TableRow>
  );
}

export function StoreListClient({ stores }: { stores: any[] }) {
  const [isSorting, setIsSorting] = useState(false);
  const [localStores, setLocalStores] = useState<any[]>([]);
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

  // 初期表示用にソート
  const sortedInitialStores = [...stores].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  useEffect(() => {
    setLocalStores(sortedInitialStores);
  }, [stores]);

  const handleStartSorting = () => {
    setIsSorting(true);
    setLocalStores(sortedInitialStores);
  };

  const handleCancelSorting = () => {
    setIsSorting(false);
    setLocalStores(sortedInitialStores);
  };

  const handleSaveSorting = async () => {
    setLoading(true);
    try {
      const updates = localStores.map((store, index) => ({
        id: store.id,
        name: store.name, 
        sort_order: index + 1
      }));
      await updateStoresOrder(updates);
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
      setLocalStores((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const displayStores = isSorting ? localStores : sortedInitialStores;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 bg-slate-100 p-3 rounded-lg border border-slate-300 shadow-sm">
        <div className="text-sm text-slate-600">
          {isSorting 
            ? "ハンドルをドラッグして順序を入れ替え、「保存」を押してください。" 
            : "お店の表示順序を変更できます。"}
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
                <TableHead>店名</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext 
                items={displayStores.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {displayStores.map((store, index) => (
                  <SortableStoreRow 
                    key={store.id} 
                    store={store} 
                    index={index} 
                    isSorting={isSorting} 
                  />
                ))}
              </SortableContext>
              {displayStores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                    お店が登録されていません。
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

