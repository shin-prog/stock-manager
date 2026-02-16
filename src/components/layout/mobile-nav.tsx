'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Settings, Tag } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around items-center z-[999] safe-area-pb">
      <Link href="/inventory" className={`flex flex-col items-center p-2 flex-1 ${isActive('/inventory') ? 'text-blue-600' : 'text-gray-500'}`}>
        <Package size={24} />
        <span className="text-xs">在庫</span>
      </Link>

      <Link href="/tags" className={`flex flex-col items-center p-2 flex-1 ${isActive('/tags') ? 'text-blue-600' : 'text-gray-500'}`}>
        <Tag size={24} />
        <span className="text-xs">タグ</span>
      </Link>

      <Link href="/settings" className={`flex flex-col items-center p-2 flex-1 ${isActive('/settings') ? 'text-blue-600' : 'text-gray-500'}`}>
        <Settings size={24} />
        <span className="text-xs">設定</span>
      </Link>
    </div>
  );
}
