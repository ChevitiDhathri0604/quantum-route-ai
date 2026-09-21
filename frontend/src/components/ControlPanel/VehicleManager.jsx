import React from 'react';
import { Truck, AlertTriangle, Battery, Navigation } from 'lucide-react';

export default function VehicleManager({ vehicles = [], onTriggerBreakdown }) {
  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-slate-100">Fleet Vehicles Command</h3>
        </div>
        <span className="text-xs bg-slate-800 text-purple-300 border border-slate-700 px-2.5 py-1 rounded-full font-mono">
          {vehicles.filter(v => v.status === 'Active').length} / {vehicles.length} Active
        </span>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((v) => {
          const isBroken = v.status === 'BROKEN DOWN';
          return (
            <div
              key={v.id}
              className={`p-4 rounded-xl border transition ${
                isBroken
                  ? 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-cyan-300">{v.id}</span>
                    <span className="text-xs font-bold text-slate-200">{v.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{v.type}</div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isBroken
                      ? 'bg-rose-600 text-white animate-pulse'
                      : v.status === 'Completed'
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              {/* Stats Progress Bars */}
              <div className="space-y-2 text-xs">
                {/* Capacity load bar */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                    <span>Current Payload</span>
                    <span className="font-mono text-slate-200">{v.current_load} / {v.capacity} kg</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (v.current_load / v.capacity) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Battery / Fuel level bar */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                    <span className="flex items-center gap-1"><Battery className="w-3 h-3 text-amber-400" /> Battery / Fuel</span>
                    <span className="font-mono text-amber-400">{v.fuel_level}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${v.fuel_level}%` }}
                    />
                  </div>
                </div>

                {/* Assigned Stops */}
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Assigned Deliveries: <strong className="text-purple-300">{v.assigned_deliveries.length} stops</strong></span>
                  <span>ETA: <strong className="text-slate-200">{v.eta_minutes} min</strong></span>
                </div>
              </div>

              {/* Action Button */}
              {!isBroken && (
                <button
                  onClick={() => onTriggerBreakdown(v.id)}
                  className="mt-3 w-full bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Simulate Breakdown
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
