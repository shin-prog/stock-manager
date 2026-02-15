'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, List, Store, Tag } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around items-center z-[999] safe-area-pb">
      <Link href="/inventory" className={`flex flex-col items-center p-2 ${isActive('/inventory') ? 'text-blue-600' : 'text-gray-500'}`}>
        <Package size={24} />
        <span className="text-xs">在庫</span>
      </Link>
      
      <Link href="/products" className={`flex flex-col items-center p-2 ${isActive('/products') ? 'text-blue-600' : 'text-gray-500'}`}>
        <List size={24} />
        <span className="text-xs">商品</span>
      </Link>

      <Link href="/tags" className={`flex flex-col items-center p-2 ${isActive('/tags') ? 'text-blue-600' : 'text-gray-500'}`}>
        <Tag size={24} />
        <span className="text-xs">タグ</span>
      </Link>

      <Link href="/stores" className={`flex flex-col items-center p-2 ${isActive('/stores') ? 'text-blue-600' : 'text-gray-500'}`}>
        <Store size={24} />
        <span className="text-xs">お店</span>
      </Link>

      <Link href="/categories" className={`flex flex-col items-center p-2 ${isActive('/categories') ? 'text-blue-600' : 'text-gray-500'}`}>
        <List size={24} />
        <span className="text-xs">カテゴリ</span>
      </Link>
    </div>
  );
}
