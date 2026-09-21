import React from 'react';
import { Play, Pause, RefreshCw, AlertTriangle, Cpu, Sparkles, PlusCircle } from 'lucide-react';

export default function QuickControls({
  running,
  speed,
  optimizationMode,
  isAddingPoint,
  vehicles = [],
  onStart,
  onStop,
  onReset,
  onToggleMode,
  onTriggerBreakdown,
  onToggleAddPoint
}) {
  const activeVehicles = vehicles.filter((v) => v.status === 'Active');

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
      {/* Simulation Play/Pause Controls */}
      <div className="flex items-center gap-2">
        {!running ? (
          <button
            onClick={() => onStart(speed)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition"
          >
            <Play className="w-4 h-4 fill-white" /> Start Live Simulation
          </button>
        ) : (
          <button
            onClick={onStop}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-900/40 transition"
          >
            <Pause className="w-4 h-4 fill-white" /> Pause Simulation
          </button>
        )}

        <button
          onClick={onReset}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Demo
        </button>
      </div>

      {/* Optimization Mode Toggle */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onToggleMode('classical')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            optimizationMode === 'classical'
              ? 'bg-slate-700 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-blue-400" /> Classical VRP
        </button>
        <button
          onClick={() => onToggleMode('quantum')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            optimizationMode === 'quantum'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
              : 'text-purple-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> QUBO Quantum
        </button>
      </div>

      {/* Disruption Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAddPoint}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
            isAddingPoint
              ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
              : 'bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-amber-950/60'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          {isAddingPoint ? 'Cancel Map Click' : 'Click Map to Add Stop'}
        </button>

        {activeVehicles.length > 0 && (
          <button
            onClick={() => onTriggerBreakdown(activeVehicles[0].id)}
            className="bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Breakdown {activeVehicles[0].id}
          </button>
        )}
      </div>
    </div>
  );
}
