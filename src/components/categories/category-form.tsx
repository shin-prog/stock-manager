'use client';

import { SubmitButton } from '@/components/forms/submit-button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCategory } from '@/app/categories/actions';

export function CategoryForm() {
  return (
    <form action={createCategory} className="space-y-4 max-w-md mx-auto p-4 border rounded-lg">
      <h2 className="text-xl font-bold">カテゴリ登録</h2>
      <div className="space-y-2">
        <Label htmlFor="name">カテゴリ名</Label>
        <Input id="name" name="name" required placeholder="例: おやつ" />
      </div>
      <SubmitButton className="w-full">登録する</SubmitButton>
    </form>
  );
}
