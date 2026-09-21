import React, { useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

export default function LiveEventLog({ logs = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (level) => {
    if (level === 'ERROR') return <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    if (level === 'SUCCESS') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    return <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
  };

  return (
    <div className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
        <Terminal className="w-4 h-4 text-cyan-400" />
        <h4 className="text-xs font-bold text-slate-200">Dispatch Activity Console</h4>
        <span className="ml-auto text-[10px] bg-slate-800 text-cyan-400 px-2 py-0.5 rounded font-mono">
          LIVE STREAM
        </span>
      </div>

      <div className="flex-1 bg-slate-950 p-3 rounded-lg border border-slate-900 overflow-y-auto max-h-56 space-y-2 font-mono text-[11px]">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic">No events logged yet.</div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 text-slate-300">
              <span className="text-slate-500 font-semibold select-none">[{log.timestamp}]</span>
              {getLogIcon(log.level)}
              <span className={log.level === 'ERROR' ? 'text-rose-300 font-bold' : log.level === 'WARNING' ? 'text-amber-300' : 'text-slate-200'}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
