'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TagBadge } from './tag-badge';
import { createTag } from '@/app/tags/actions';

interface Tag {
  id: string;
  name: string;
  color_key: string;
}

interface TagSelectorProps {
  allTags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  inline?: boolean;
}

export function TagSelector({ allTags, selectedTagIds, onChange, inline = false }: TagSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [availableTags, setAvailableTags] = React.useState<Tag[]>(allTags);

  // Sync available tags when allTags prop changes
  React.useEffect(() => {
    setAvailableTags(allTags);
  }, [allTags]);

  const toggleTag = (tagId: string) => {
    const newIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    onChange(newIds);
  };

  const handleCreateTag = async () => {
    if (!inputValue) return;
    try {
      const newTag = await createTag(inputValue, 'slate');
      setAvailableTags([...availableTags, newTag]);
      toggleTag(newTag.id);
      setInputValue('');
    } catch (e) {
      alert('タグの作成に失敗しました');
    }
  };

  const selectedTags = availableTags.filter((tag) => selectedTagIds.includes(tag.id));

  const commandInterface = (
    <Command className={cn("bg-white", inline && "border rounded-md")}>
      <CommandInput 
        placeholder="タグ名で検索..." 
        value={inputValue}
        onValueChange={setInputValue}
        className="h-11"
        // Forcefully disable focus on mount by setting it to false when inline
        autoFocus={false}
      />
      <CommandList className={cn("bg-white", inline ? "max-h-[150px]" : "max-h-[200px]")}>
        <CommandEmpty>
          {inputValue ? (
            <div className="p-2 text-center">
              <p className="text-sm text-slate-500 mb-2">"{inputValue}" は見つかりません</p>
              <Button size="sm" variant="secondary" onClick={handleCreateTag} className="w-full">
                <Plus size={14} className="mr-1" /> "{inputValue}" を新規作成
              </Button>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-slate-400">
              検索ワードを入力してください
            </div>
          )}
        </CommandEmpty>
        <CommandGroup>
          {availableTags.map((tag) => (
            <CommandItem
              key={tag.id}
              value={tag.name}
              onSelect={() => {
                toggleTag(tag.id);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedTagIds.includes(tag.id) ? "opacity-100" : "opacity-0"
                )}
              />
              <TagBadge name={tag.name} colorKey={tag.color_key} />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5 min-h-[2.5rem] p-1 border rounded-md bg-white shadow-sm">
        {selectedTags.map((tag) => (
          <div key={tag.id} className="flex items-center">
            <TagBadge name={tag.name} colorKey={tag.color_key} className="pr-1" />
            <button
              type="button"
              onClick={() => toggleTag(tag.id)}
              className="ml-[-4px] z-10 bg-slate-200 text-slate-600 rounded-full p-0.5 hover:bg-slate-300 hover:text-slate-800 transition-colors shadow-sm"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        {selectedTags.length === 0 && (
          <span className="text-sm text-slate-400 px-2 py-1">タグを選択...</span>
        )}
      </div>

      {inline ? (
        commandInterface
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between h-9 w-full bg-white border-slate-400 shadow-sm hover:bg-slate-50 transition-all"
            >
              タグを追加・検索
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border-2 border-slate-300 shadow-xl">
            {commandInterface}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
