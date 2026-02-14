import { createClient } from '@/utils/supabase/server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { DeleteProductButton } from '@/components/products/delete-product-button';
import { CategorySelect } from '@/components/products/category-select';

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*').order('name');
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">商品一覧</h1>
        <Link href="/products/new">
          <Button>+ 商品追加</Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商品名</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>最低在庫</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
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
                <TableCell>{product.min_stock_threshold}</TableCell>
                <TableCell className="text-right">
                  <DeleteProductButton id={product.id} />
                </TableCell>
              </TableRow>
            ))}
            {products?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                  商品がありません。右上のボタンから追加してください。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
