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

export default async function StoresPage() {
  const supabase = await createClient();
  const { data: stores } = await supabase.from('stores').select('*');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">お店一覧</h1>
        <Link href="/stores/new">
          <Button>+ お店追加</Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>店名</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores?.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
              </TableRow>
            ))}
            {stores?.length === 0 && (
              <TableRow>
                <TableCell className="text-center py-4 text-gray-500">
                  お店が登録されていません。右上のボタンから追加してください。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
