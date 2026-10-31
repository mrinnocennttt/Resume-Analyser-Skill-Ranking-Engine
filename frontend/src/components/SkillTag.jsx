import React from 'react';
import { Check, X, Star, Plus } from 'lucide-react';

export default function SkillTag({ name, type = 'neutral', count, size = 'sm' }) {
  const getStyles = () => {
    switch (type) {
      case 'matched':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-semibold';
      case 'missing':
        return 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 font-semibold';
      case 'preferred':
        return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 font-semibold';
      case 'bonus':
        return 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100 font-semibold';
      case 'category':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'matched':
        return <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />;
      case 'missing':
        return <X className="w-3 h-3 text-rose-600 stroke-[2.5]" />;
      case 'preferred':
        return <Star className="w-3 h-3 text-amber-600 stroke-[2.5]" />;
      case 'bonus':
        return <Plus className="w-3 h-3 text-purple-600 stroke-[2.5]" />;
      default:
        return null;
    }
  };

  const pad = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border transition-all ${pad} ${getStyles()}`}
    >
      {getIcon()}
      <span className="truncate">{name}</span>
      {count !== undefined && <span className="opacity-70 text-[10px] font-mono">({count})</span>}
    </span>
  );
}
