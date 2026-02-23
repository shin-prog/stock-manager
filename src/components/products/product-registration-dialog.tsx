'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ProductForm } from '@/components/forms/product-form';
import { Category, Tag } from '@/types';

interface ProductRegistrationDialogProps {
    categories: Category[];
    allTags: Tag[];
    defaultCategoryId?: string;
    trigger?: React.ReactNode;
}

export function ProductRegistrationDialog({
    categories,
    allTags,
    defaultCategoryId,
    trigger
}: ProductRegistrationDialogProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        size="icon"
                        className="h-12 w-12 rounded-full shadow-2xl bg-slate-900 text-white hover:bg-black hover:scale-110 active:scale-95 transition-all duration-300"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-0 shadow-2xl rounded-xl">
                <DialogTitle className="sr-only">商品登録</DialogTitle>
                {/* We reuse ProductForm here. However, to handle closing the dialog after successful submission, 
            ProductForm either needs an onSuccess callback or actions need to be updated. */}
                <div className="bg-white">
                    <ProductForm
                        categories={categories}
                        allTags={allTags}
                        defaultCategoryId={defaultCategoryId}
                        onSuccess={() => setOpen(false)}
                        className="border-0 shadow-none p-6 m-0"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
