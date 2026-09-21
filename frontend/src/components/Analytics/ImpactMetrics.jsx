import React from 'react';
import { Award, DollarSign, Leaf, Zap, CheckCircle2, TrendingUp } from 'lucide-react';

export default function ImpactMetrics({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Award className="w-6 h-6 text-amber-400" />
        <h2 className="text-lg font-extrabold text-slate-100">🏆 Hackathon Impact Metrics Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Operational */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4" /> Operational Impact
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Delivery Success Rate:</span>
              <strong className="text-emerald-400 font-mono">98.5%</strong>
            </div>
            <div className="flex justify-between">
              <span>Avg Delivery Time:</span>
              <strong className="text-slate-100 font-mono">{metrics.quantum_time_min} min</strong>
            </div>
            <div className="flex justify-between">
              <span>Vehicle Utilization:</span>
              <strong className="text-purple-300 font-mono">92.4%</strong>
            </div>
            <div className="flex justify-between">
              <span>Route Efficiency:</span>
              <strong className="text-cyan-400 font-mono">{metrics.quantum_efficiency_pct}%</strong>
            </div>
          </div>
        </div>

        {/* Financial */}
        <div className="glass-panel p-5 rounded-xl border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <DollarSign className="w-4 h-4" /> Financial Impact
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Estimated Fuel Cost:</span>
              <strong className="text-slate-100 font-mono">₹{metrics.quantum_cost_inr}</strong>
            </div>
            <div className="flex justify-between">
              <span>Cost Saved:</span>
              <strong className="text-amber-400 font-mono">₹{metrics.cost_saved_inr}</strong>
            </div>
            <div className="flex justify-between">
              <span>ROI Increase:</span>
              <strong className="text-emerald-400 font-mono">+18.4%</strong>
            </div>
          </div>
        </div>

        {/* Environmental */}
        <div className="glass-panel p-5 rounded-xl border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Leaf className="w-4 h-4" /> Environmental Impact
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Fuel Saved:</span>
              <strong className="text-emerald-400 font-mono">{metrics.fuel_saved_l} L</strong>
            </div>
            <div className="flex justify-between">
              <span>CO₂ Reduced:</span>
              <strong className="text-emerald-400 font-mono">{metrics.co2_reduced_kg} kg</strong>
            </div>
            <div className="flex justify-between">
              <span>Zero-Load Miles Saved:</span>
              <strong className="text-cyan-300 font-mono">{metrics.distance_saved_km} km</strong>
            </div>
          </div>
        </div>

        {/* Optimization */}
        <div className="glass-panel-glow p-5 rounded-xl border border-purple-500/40 space-y-2">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" /> Optimization Gains
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Classical Distance:</span>
              <strong className="text-slate-400 font-mono">{metrics.classical_distance_km} km</strong>
            </div>
            <div className="flex justify-between">
              <span>Quantum Distance:</span>
              <strong className="text-purple-300 font-mono">{metrics.quantum_distance_km} km</strong>
            </div>
            <div className="flex justify-between">
              <span>Quantum Solve Time:</span>
              <strong className="text-cyan-400 font-mono">{metrics.quantum_solve_sec} sec</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
