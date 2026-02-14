import { useState, useEffect } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

export function useSortableList<T extends { id: string }>(
  initialItems: T[],
  onSave: (items: T[]) => Promise<void>
) {
  const [isSorting, setIsSorting] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      // タッチ操作の場合は少し長押し（延滞）を入れることで、スクロールとの誤判定を防ぐ
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const startSorting = () => {
    setIsSorting(true);
    setItems(initialItems);
  };

  const cancelSorting = () => {
    setIsSorting(false);
    setItems(initialItems);
  };

  const saveSorting = async () => {
    setLoading(true);
    try {
      await onSave(items);
      setIsSorting(false);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        return arrayMove(currentItems, oldIndex, newIndex);
      });
    }
  };

  return {
    isSorting,
    items,
    loading,
    sensors,
    startSorting,
    cancelSorting,
    saveSorting,
    handleDragEnd,
    collisionDetection: closestCenter,
  };
}
