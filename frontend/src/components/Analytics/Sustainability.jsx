import React from 'react';
import { Leaf, TreePine, Fuel, Zap, ShieldCheck, Award } from 'lucide-react';

export default function Sustainability({ metrics }) {
  const fuelSaved = metrics?.fuel_saved_l || 15.4;
  const co2Reduced = metrics?.co2_reduced_kg || 23.8;
  const distReduced = metrics?.distance_saved_km || 28.6;
  const ecoScore = metrics?.quantum_efficiency_pct || 94.2;

  // 1 tree absorbs ~22kg CO2 per year
  const treesEquivalent = (co2Reduced * 16 / 22).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel-glow rounded-xl p-6 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl">
            <Leaf className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">Green Logistics & Eco-Sustainability</h2>
              <span className="bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                ISO 14064 Carbon Compliant
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Quantum-inspired route optimization reduces fleet fuel burn, eliminates empty miles, and cuts urban carbon footprint.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 px-5 py-3 rounded-xl border border-slate-800">
          <Award className="w-8 h-8 text-amber-400" />
          <div>
            <div className="text-[11px] text-slate-400">Green Fleet Eco Score</div>
            <div className="text-2xl font-extrabold text-emerald-400">{ecoScore}%</div>
          </div>
        </div>
      </div>

      {/* Main Sustainability Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-emerald-500/20 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Leaf className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400">CO₂ Reduction</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{co2Reduced} kg</div>
          <div className="text-[11px] text-emerald-300/80 mt-1">Prevented emissions</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-cyan-500/20 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Fuel className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400">Fuel Saved</div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1">{fuelSaved} L</div>
          <div className="text-[11px] text-cyan-300/80 mt-1">Conserved per dispatch run</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-purple-500/20 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <TreePine className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400">Tree Equivalent</div>
          <div className="text-2xl font-extrabold text-purple-400 mt-1">{treesEquivalent}</div>
          <div className="text-[11px] text-purple-300/80 mt-1">Trees planted offset equivalent</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-amber-500/20 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400">Empty Distance Reduced</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{distReduced} km</div>
          <div className="text-[11px] text-amber-300/80 mt-1">Zero-load miles eliminated</div>
        </div>
      </div>
    </div>
  );
}
