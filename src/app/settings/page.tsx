import Link from 'next/link';
import { Store, List, ChevronRight, Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="p-4 safe-area-pt">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Settings className="text-blue-600" />
                設定
            </h1>

            <div className="space-y-4">
                <Link
                    href="/stores"
                    className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Store size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800">お店一覧</div>
                            <div className="text-sm text-slate-500">店舗の追加・編集・削除</div>
                        </div>
                    </div>
                    <ChevronRight className="text-slate-300" />
                </Link>

                <Link
                    href="/categories"
                    className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <List size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800">カテゴリ一覧</div>
                            <div className="text-sm text-slate-500">カテゴリの整理・種別管理</div>
                        </div>
                    </div>
                    <ChevronRight className="text-slate-300" />
                </Link>
            </div>
        </div>
    );
}
