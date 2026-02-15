'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { deleteProduct } from '@/app/products/actions';
import { Trash2 } from 'lucide-react';

export function DeleteProductDialog({ id, productName }: { id: string; productName: string }) {
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const formData = new FormData();
            formData.append('id', id);
            await deleteProduct(formData);
        } catch (e) {
            alert('削除に失敗しました');
            setDeleting(false);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0">
                    <Trash2 size={16} />
                </Button>
            </DialogTrigger>
            <DialogContent
                className="bg-white border-2 border-slate-400 shadow-2xl max-w-[90vw] sm:max-w-md"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-xl text-slate-900">商品を削除</DialogTitle>
                    <DialogDescription className="text-sm text-slate-600 pt-2">
                        「{productName}」を削除します。関連する購入履歴・在庫データもすべて削除されます。この操作は取り消せません。
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-end gap-2 border-t pt-4 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={deleting}
                        className="px-6 font-bold h-11"
                    >
                        キャンセル
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-6 font-bold h-11 bg-red-600 hover:bg-red-700"
                    >
                        {deleting ? '削除中...' : '削除する'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
