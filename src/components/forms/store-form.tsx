'use client';

import { createStore } from '@/app/stores/actions';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { SubmitButton } from './submit-button';

export function StoreForm() {
  return (
    <form action={createStore} className="space-y-4 max-w-md mx-auto p-4 border rounded-lg">
      <h2 className="text-xl font-bold">お店登録</h2>
      
      <div className="space-y-2">
        <Label htmlFor="name">店名</Label>
        <Input id="name" name="name" required placeholder="例: ○○スーパー" />
      </div>

      <SubmitButton className="w-full">登録する</SubmitButton>
    </form>
  );
}
