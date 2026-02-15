export const PRESET_COLORS = [
  { key: 'slate', name: 'スレート', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-400' },
  { key: 'red', name: 'レッド', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' },
  { key: 'orange', name: 'オレンジ', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-400' },
  { key: 'amber', name: 'アンバー', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-400' },
  { key: 'green', name: 'グリーン', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400' },
  { key: 'blue', name: 'ブルー', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-400' },
  { key: 'indigo', name: 'インディゴ', bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-400' },
  { key: 'pink', name: 'ピンク', bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-400' },
];

export function getColorClasses(key: string) {
  const color = PRESET_COLORS.find(c => c.key === key) || PRESET_COLORS[0];
  return color;
}
