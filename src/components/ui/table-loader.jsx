import React from 'react'
import { Loader2 } from 'lucide-react'

export function TableLoader({ rows = 5, columns = 4 }) {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-8 gap-4">
        {[...Array(columns)].map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded-full flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-50">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-8 py-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded-full w-1/3" />
              <div className="h-3 bg-slate-50 rounded-full w-1/2" />
            </div>
            {[...Array(columns - 1)].map((_, j) => (
              <div key={j} className="h-4 bg-slate-100 rounded-full flex-1 hidden sm:block" />
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400 mt-3 uppercase tracking-widest">Sincronizando datos...</p>
      </div>
    </div>
  )
}
