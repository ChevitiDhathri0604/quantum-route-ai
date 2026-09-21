import React from 'react';
import { Truck, MapPin, CheckCircle, Navigation, Fuel, Clock, Leaf, Sparkles } from 'lucide-react';

export default function KPICards({
  vehicles = [],
  deliveries = [],
  metrics,
  optimizationMode
}) {
  const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
  const pendingDeliveries = deliveries.filter(d => d.status === 'Pending' || d.status === 'Assigned').length;
  const completedDeliveries = deliveries.filter(d => d.status === 'Delivered').length;
  const totalDistance = metrics?.quantum_distance_km || 102.5;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {/* Active Vehicles */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium">Active Fleet</span>
          <Truck className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl font-extrabold text-slate-100">{activeVehicles} <span className="text-xs font-normal text-slate-400">/ {vehicles.length}</span></div>
      </div>

      {/* Pending Deliveries */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium">Pending Stops</span>
          <MapPin className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-xl font-extrabold text-amber-400">{pendingDeliveries}</div>
      </div>

      {/* Completed Deliveries */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium">Completed</span>
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl font-extrabold text-emerald-400">{completedDeliveries}</div>
      </div>

      {/* Total Distance */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium">Route Distance</span>
          <Navigation className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-xl font-extrabold text-purple-300">{totalDistance} <span className="text-xs font-normal text-slate-400">km</span></div>
      </div>

      {/* Fuel Saved */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium">Fuel Saved</span>
          <Fuel className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl font-extrabold text-emerald-400">{metrics?.fuel_saved_l || 15.4} <span className="text-xs font-normal text-slate-400">L</span></div>
      </div>

      {/* Time Saved */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium">Time Saved</span>
          <Clock className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl font-extrabold text-cyan-400">{metrics?.time_saved_min || 34} <span className="text-xs font-normal text-slate-400">min</span></div>
      </div>

      {/* CO2 Reduced */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium">CO₂ Reduced</span>
          <Leaf className="w-4 h-4 text-teal-400" />
        </div>
        <div className="text-xl font-extrabold text-teal-400">{metrics?.co2_reduced_kg || 23.8} <span className="text-xs font-normal text-slate-400">kg</span></div>
      </div>

      {/* Solver Mode */}
      <div className="glass-panel-glow p-3.5 rounded-xl border border-purple-500/40">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium">Solver Engine</span>
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-xs font-extrabold text-purple-300 uppercase truncate">
          {optimizationMode === 'quantum' ? 'QUBO QAOA' : 'Classical VRP'}
        </div>
      </div>
    </div>
  );
}
