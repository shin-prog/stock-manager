import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { StoreListClient } from '@/components/stores/store-list-client';

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

      <StoreListClient stores={stores || []} />
    </div>
  );
}
