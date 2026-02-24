'use client';

import { useState, useEffect } from 'react';
import { useAppSettings } from '@/hooks/use-app-settings';
import { Settings, ChevronLeft, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AppSettingsPage() {
    const { staleDays, setStaleDays, isLoaded } = useAppSettings();
    const [inputValue, setInputValue] = useState<string>('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            setInputValue(String(staleDays));
        }
    }, [isLoaded, staleDays]);

    const handleSave = () => {
        const parsed = parseInt(inputValue, 10);
        if (!isNaN(parsed) && parsed > 0) {
            setStaleDays(parsed);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    return (
        <div className="space-y-6 max-w-lg mx-auto">
            <div className="flex items-center gap-3">
                <Link
                    href="/settings"
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="text-blue-600" />
                    アプリ設定
                </h1>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-5 space-y-5">
                {/* 棚卸し設定 */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                            <ClipboardCheck size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800">棚卸し</div>
                            <div className="text-xs text-slate-500">
                                指定した日数以上、在庫を更新していない商品を棚卸しの対象にします
                            </div>
                        </div>
                    </div>

                    <div className="pl-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600 shrink-0">未更新が</span>
                            <input
                                type="number"
                                min={1}
                                max={365}
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    setSaved(false);
                                }}
                                className="w-20 h-9 text-center border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <span className="text-sm text-slate-600 shrink-0">日以上で対象にする</span>
                        </div>

                        {/* スライダー */}
                        <input
                            type="range"
                            min={1}
                            max={180}
                            value={Math.min(parseInt(inputValue) || 30, 180)}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setSaved(false);
                            }}
                            className="w-full accent-amber-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>1日</span>
                            <span>30日</span>
                            <span>60日</span>
                            <span>90日</span>
                            <span>180日</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={!isLoaded}
                        className={`w-full transition-all ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-black'} text-white`}
                    >
                        {saved ? '✓ 保存しました' : '保存する'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
