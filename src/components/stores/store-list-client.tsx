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
import { DeleteStoreButton } from '@/components/stores/delete-store-button';
import { StoreNameEditor } from '@/components/stores/store-name-editor';
import { Settings2, Save, X, GripVertical } from 'lucide-react';
import { updateStoresOrder } from '@/app/stores/actions';
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

import { Store } from '@/types';

function SortableStoreRow({ 
  store, 
  index, 
  isSorting, 
  isDragging
}: { 
  store: Store, 
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
            className="flex justify-center p-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors touch-none"
          >
            <GripVertical size={20} />
          </div>
        ) : (
          <span className="text-gray-400 text-xs">{index + 1}</span>
        )}
      </TableCell>
      <TableCell>
        <StoreNameEditor id={store.id} initialName={store.name} />
      </TableCell>
      <TableCell className="text-right">
        {!isSorting && <DeleteStoreButton id={store.id} />}
      </TableCell>
    </TableRow>
  );
}

export function StoreListClient({ stores }: { stores: Store[] }) {
  // 初期表示用にソート
  const sortedInitialStores = useMemo(() => 
    [...stores].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    [stores]
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
  } = useSortableList(sortedInitialStores, async (newItems) => {
    const updates = newItems.map((store, index) => ({
      id: store.id,
      name: store.name, 
      sort_order: index + 1
    }));
    await updateStoresOrder(updates);
  });

  const displayStores = isSorting ? items : sortedInitialStores;

  return (
    <div className="space-y-4">
      <FilterPanel className="justify-between">
        <div className="text-sm text-slate-600">
          {isSorting 
            ? "ハンドルをドラッグして順序を入れ替え、「保存」を押してください。" 
            : "お店の表示順序を変更できます。"}
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


