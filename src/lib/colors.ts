export const PRESET_COLORS = [
  { key: 'slate', name: 'スレート', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-400', solid: 'bg-slate-300' },
  { key: 'red', name: 'レッド', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400', solid: 'bg-red-300' },
  { key: 'orange', name: 'オレンジ', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-400', solid: 'bg-orange-300' },
  { key: 'amber', name: 'アンバー', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-400', solid: 'bg-amber-300' },
  { key: 'yellow', name: 'イエロー', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400', solid: 'bg-yellow-300' },
  { key: 'green', name: 'グリーン', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400', solid: 'bg-green-300' },
  { key: 'blue', name: 'ブルー', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-400', solid: 'bg-blue-300' },
  { key: 'indigo', name: 'インディゴ', bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-400', solid: 'bg-indigo-300' },
  { key: 'purple', name: 'パープル', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-400', solid: 'bg-purple-300' },
  { key: 'pink', name: 'ピンク', bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-400', solid: 'bg-pink-300' },
];

export function getColorClasses(key: string) {
  const color = PRESET_COLORS.find(c => c.key === key) || PRESET_COLORS[0];
  return color;
}

export function getQuietColorClasses(key: string) {
  const colors: Record<string, string> = {
    slate: "bg-slate-50 text-slate-600 border-slate-200",
    red: "bg-red-50 text-red-600 border-red-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    green: "bg-green-50 text-green-600 border-green-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    pink: "bg-pink-50 text-pink-600 border-pink-200",
  };
  return colors[key] || colors.slate;
}
