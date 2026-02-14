'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from 'next/link';
import { DeleteProductButton } from '@/components/products/delete-product-button';
import { CategorySelect } from '@/components/products/category-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterPanel, FilterItem } from '@/components/ui/filter-panel';

export function ProductListClient({ 
  products, 
  categories 
}: { 
  products: any[], 
  categories: any[] 
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  const filteredProducts = selectedCategoryId === 'all'
    ? products
    : products.filter(p => 
        selectedCategoryId === 'none' 
          ? !p.category_id 
          : p.category_id === selectedCategoryId
      );

  return (
    <div className="space-y-4">
      <FilterPanel>
        <FilterItem label="カテゴリ絞り込み:">
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger className="w-[180px] bg-white border-slate-400 h-9">
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-300 shadow-lg">
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="none">未分類</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterItem>
      </FilterPanel>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商品名</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <Link href={`/products/${product.id}`} className="hover:underline text-blue-600">
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <CategorySelect 
                    id={product.id} 
                    initialCategoryId={product.category_id} 
                    categories={categories || []} 
                  />
                </TableCell>
                <TableCell className="text-right">
                  <DeleteProductButton id={product.id} />
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                  該当する商品がありません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
