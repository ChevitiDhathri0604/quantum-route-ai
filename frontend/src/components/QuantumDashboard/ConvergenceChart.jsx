import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingDown, Activity } from 'lucide-react';

export default function ConvergenceChart({ history = [] }) {
  const defaultHistory = history.length > 0 ? history : [
    { iteration: 1, cost: 1250, energy: -12.4 },
    { iteration: 3, cost: 1140, energy: -18.2 },
    { iteration: 5, cost: 1080, energy: -24.5 },
    { iteration: 8, cost: 995, energy: -31.0 },
    { iteration: 12, cost: 940, energy: -38.4 },
    { iteration: 18, cost: 890, energy: -44.1 },
    { iteration: 25, cost: 875, energy: -48.2 },
    { iteration: 30, cost: 868, energy: -51.0 },
  ];

  const initialCost = defaultHistory[0]?.cost || 1250;
  const finalCost = defaultHistory[defaultHistory.length - 1]?.cost || 868;
  const reductionPct = (((initialCost - finalCost) / initialCost) * 100).toFixed(1);

  return (
    <div className="glass-panel rounded-xl p-5 border border-purple-500/20 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-slate-100">QUBO Cost Minimization</h3>
          </div>
          <p className="text-xs text-slate-400">Energy convergence across quantum annealing iterations</p>
        </div>
        <div className="bg-purple-950/80 border border-purple-500/30 px-3 py-1.5 rounded-lg text-right">
          <div className="text-[10px] text-purple-300 font-medium">Energy Drop</div>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            -{reductionPct}%
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={defaultHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="quantumEnergyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="iteration" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Iteration', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#a855f7', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
              formatter={(value) => [`${value}`, 'Hamiltonian Cost']}
              labelFormatter={(label) => `Iteration ${label}`}
            />
            <Area type="monotone" dataKey="cost" stroke="#c084fc" strokeWidth={3} fillOpacity={1} fill="url(#quantumEnergyGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex justify-between items-center text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
        <span>Initial Cost: <strong className="text-rose-400">{initialCost}</strong></span>
        <span>Optimal Minimum: <strong className="text-emerald-400">{finalCost}</strong></span>
        <span>Iterations: <strong className="text-cyan-400">{defaultHistory.length}</strong></span>
      </div>
    </div>
  );
}
