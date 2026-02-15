import { createClient } from '@/utils/supabase/server';
import { TagCloud } from '@/components/tags/tag-cloud';

export default async function TagsPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">タグ管理</h1>
      </div>

      <TagCloud initialTags={tags || []} />
    </div>
  );
}
