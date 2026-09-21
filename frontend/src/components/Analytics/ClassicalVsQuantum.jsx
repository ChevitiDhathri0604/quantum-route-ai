import React from 'react';
import { Fuel, Clock, Navigation, IndianRupee, Leaf, BarChart3, Cpu, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import FleetMap from '../Map/FleetMap';
import QuantumMap from '../Map/QuantumMap';

export default function ClassicalVsQuantum({ warehouse, deliveries = [], vehicles = [], metrics, classicalRoutes, quantumRoutes }) {
  if (!metrics) return <div className="text-slate-400 text-sm">Loading comparison metrics...</div>;

  const chartData = [
    { name: 'Distance (km)', Classical: metrics.classical_distance_km, Quantum: metrics.quantum_distance_km },
    { name: 'Fuel (L)', Classical: metrics.classical_fuel_l, Quantum: metrics.quantum_fuel_l },
    { name: 'Time (min)', Classical: metrics.classical_time_min, Quantum: metrics.quantum_time_min },
    { name: 'CO₂ (kg)', Classical: metrics.classical_co2_kg, Quantum: metrics.quantum_co2_kg },
  ];

  // Vehicles with classical routes mapped
  const classicalVehicles = vehicles.map((v) => {
    const routeIds = classicalRoutes?.routes?.[v.id] || v.assigned_deliveries;
    const deliveryMap = Object.fromEntries(deliveries.map(d => [d.id, d]));
    const routeCoords = [{ lat: warehouse?.lat || 17.385044, lng: warehouse?.lng || 78.486671 }];
    
    routeIds.forEach(id => {
      if (deliveryMap[id]) {
        routeCoords.append ? routeCoords.push({ lat: deliveryMap[id].lat, lng: deliveryMap[id].lng }) : routeCoords.push({ lat: deliveryMap[id].lat, lng: deliveryMap[id].lng });
      }
    });
    routeCoords.push({ lat: warehouse?.lat || 17.385044, lng: warehouse?.lng || 78.486671 });

    return {
      ...v,
      route: routeCoords,
      route_distance_km: classicalRoutes?.distances?.[v.id] || v.route_distance_km
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Dynamic Savings KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Fuel Saved */}
        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Fuel Saved</div>
            <div className="text-xl font-extrabold text-emerald-400">{metrics.fuel_saved_l} L</div>
          </div>
        </div>

        {/* Time Saved */}
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Time Saved</div>
            <div className="text-xl font-extrabold text-cyan-400">{metrics.time_saved_min} min</div>
          </div>
        </div>

        {/* Distance Reduced */}
        <div className="glass-panel p-4 rounded-xl border border-purple-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Distance Reduced</div>
            <div className="text-xl font-extrabold text-purple-400">{metrics.distance_saved_km} km</div>
          </div>
        </div>

        {/* Cost Saved */}
        <div className="glass-panel p-4 rounded-xl border border-amber-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Cost Saved</div>
            <div className="text-xl font-extrabold text-amber-400">₹{metrics.cost_saved_inr.toLocaleString()}</div>
          </div>
        </div>

        {/* CO2 Reduced */}
        <div className="glass-panel p-4 rounded-xl border border-teal-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-950/80 border border-teal-500/50 flex items-center justify-center text-teal-400">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">CO₂ Reduced</div>
            <div className="text-xl font-extrabold text-teal-400">{metrics.co2_reduced_kg} kg</div>
          </div>
        </div>
      </div>

      {/* SEPARATE MAPS SIDE-BY-SIDE COMPARISON */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-extrabold text-slate-100">Side-by-Side Map Comparison</h3>
          </div>
          <span className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-full font-mono">
            Classical vs QUBO Quantum Routing Trajectories
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
          {/* Map 1: Classical Routing Map */}
          <div className="glass-panel rounded-xl border border-blue-500/30 p-2 flex flex-col h-full relative overflow-hidden">
            <div className="bg-slate-900/90 px-3 py-2 rounded-t-lg border-b border-slate-800 flex items-center justify-between z-10 mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Classical Routing Map (Nearest-Neighbor)</span>
              </div>
              <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                Distance: <strong className="text-blue-400">{metrics.classical_distance_km} km</strong>
              </span>
            </div>
            <div className="flex-1 w-full h-full rounded-lg overflow-hidden">
              <FleetMap
                warehouse={warehouse}
                deliveries={deliveries}
                vehicles={classicalVehicles}
              />
            </div>
          </div>

          {/* Map 2: Quantum Optimization Map */}
          <div className="glass-panel-glow rounded-xl border border-purple-500/40 p-2 flex flex-col h-full relative overflow-hidden">
            <div className="bg-slate-900/90 px-3 py-2 rounded-t-lg border-b border-slate-800 flex items-center justify-between z-10 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Quantum Optimization Map (QUBO Sectoring)</span>
              </div>
              <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                Distance: <strong className="text-purple-400">{metrics.quantum_distance_km} km</strong>
              </span>
            </div>
            <div className="flex-1 w-full h-full rounded-lg overflow-hidden">
              <QuantumMap
                warehouse={warehouse}
                deliveries={deliveries}
                vehicles={vehicles}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table & Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metric Comparison Table */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">Classical vs Quantum Metrics</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3 text-right">Classical</th>
                  <th className="py-2.5 px-3 text-right text-purple-400">Quantum (QUBO)</th>
                  <th className="py-2.5 px-3 text-right text-emerald-400">Improvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-200">Total Distance</td>
                  <td className="py-3 px-3 text-right font-mono">{metrics.classical_distance_km} km</td>
                  <td className="py-3 px-3 text-right font-mono text-purple-300 font-bold">{metrics.quantum_distance_km} km</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">-{metrics.distance_saved_km} km</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-200">Estimated Fuel</td>
                  <td className="py-3 px-3 text-right font-mono">{metrics.classical_fuel_l} L</td>
                  <td className="py-3 px-3 text-right font-mono text-purple-300 font-bold">{metrics.quantum_fuel_l} L</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">-{metrics.fuel_saved_l} L</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-200">Delivery Time</td>
                  <td className="py-3 px-3 text-right font-mono">{metrics.classical_time_min} min</td>
                  <td className="py-3 px-3 text-right font-mono text-purple-300 font-bold">{metrics.quantum_time_min} min</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">-{metrics.time_saved_min} min</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-200">Total Cost</td>
                  <td className="py-3 px-3 text-right font-mono">₹{metrics.classical_cost_inr}</td>
                  <td className="py-3 px-3 text-right font-mono text-purple-300 font-bold">₹{metrics.quantum_cost_inr}</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">-₹{metrics.cost_saved_inr}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-200">CO₂ Emission</td>
                  <td className="py-3 px-3 text-right font-mono">{metrics.classical_co2_kg} kg</td>
                  <td className="py-3 px-3 text-right font-mono text-purple-300 font-bold">{metrics.quantum_co2_kg} kg</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">-{metrics.co2_reduced_kg} kg</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-200">Route Efficiency</td>
                  <td className="py-3 px-3 text-right font-mono">{metrics.classical_efficiency_pct}%</td>
                  <td className="py-3 px-3 text-right font-mono text-purple-300 font-bold">{metrics.quantum_efficiency_pct}%</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">+{(metrics.quantum_efficiency_pct - metrics.classical_efficiency_pct).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-200">Optimization Solve Time</td>
                  <td className="py-3 px-3 text-right font-mono">{metrics.classical_solve_sec} sec</td>
                  <td className="py-3 px-3 text-right font-mono text-purple-300 font-bold">{metrics.quantum_solve_sec} sec</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">Simulated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Side-by-Side Visual Bar Chart */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100">Performance Chart Comparison</h3>
            <span className="text-[11px] text-purple-300 bg-purple-950 border border-purple-500/40 px-2.5 py-0.5 rounded-full font-mono">
              QUBO vs Nearest-Neighbor
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="Classical" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Quantum" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
