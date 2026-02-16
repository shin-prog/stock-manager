'use client';

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Package, Tag, Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const NavLink = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
    <Link href={href}>
      <Button
        className={cn(
          "w-full justify-start gap-3 h-11 transition-all duration-200",
          isActive(href) ? "bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}
        variant="ghost"
      >
        <Icon size={20} className={isActive(href) ? "text-blue-600" : "text-slate-400"} />
        {label}
      </Button>
    </Link>
  );

  return (
    <div className="h-full flex flex-col gap-1 p-4">
      <div className="font-bold text-2xl mb-8 flex items-center gap-2">
        <Package className="text-blue-600" />
        在庫管理
      </div>

      <div className="space-y-1">
        <NavLink href="/inventory" icon={Package} label="在庫一覧" />
        <NavLink href="/tags" icon={Tag} label="タグ一覧" />
        <NavLink href="/settings" icon={Settings} label="設定" />
      </div>
    </div>
  )
}

