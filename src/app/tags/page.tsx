import { createClient } from '@/utils/supabase/server';
import { TagCloud } from '@/components/tags/tag-cloud';
import { Tag } from 'lucide-react';

export default async function TagsPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="text-blue-600" />
          タグ管理
        </h1>
      </div>

      <TagCloud initialTags={tags || []} />
    </div>
  );
}
