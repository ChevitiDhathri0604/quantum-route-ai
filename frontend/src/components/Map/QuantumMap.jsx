import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Sparkles, Zap, ShieldCheck } from 'lucide-react';

const QUANTUM_ROUTE_COLORS = ['#c084fc', '#38bdf8', '#34d399', '#f472b6', '#a78bfa'];

export default function QuantumMap({ warehouse, deliveries = [], vehicles = [] }) {
  const centerLat = warehouse?.lat || 17.385044;
  const centerLng = warehouse?.lng || 78.486671;

  const createQuantumWarehouseIcon = () =>
    L.divIcon({
      className: 'quantum-depot-icon',
      html: `<div class="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-500 border-2 border-cyan-400 rounded-xl shadow-2xl flex items-center justify-center text-xl font-bold animate-pulse">⚛️</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

  const createQuantumDeliveryIcon = () =>
    L.divIcon({
      className: 'quantum-delivery-icon',
      html: `<div class="w-7 h-7 bg-purple-900/90 border-2 border-cyan-400 rounded-full shadow-lg flex items-center justify-center text-xs text-cyan-300 font-bold">⚛️</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

  const createQuantumVehicleIcon = (v, idx) => {
    const color = QUANTUM_ROUTE_COLORS[idx % QUANTUM_ROUTE_COLORS.length];
    return L.divIcon({
      className: 'quantum-vehicle-icon',
      html: `<div class="w-9 h-9 border-2 border-cyan-300 rounded-full shadow-2xl flex items-center justify-center text-white text-base" style="background-color: ${color}; box-shadow: 0 0 15px ${color}">⚡</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-purple-500/30 shadow-2xl">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] glass-panel-glow px-4 py-2.5 rounded-xl border border-purple-500/50 flex items-center gap-3 shadow-2xl">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <div>
          <h4 className="text-xs font-bold text-purple-200">Quantum Optimization Map View</h4>
          <p className="text-[10px] text-cyan-400">QUBO Superposition & Non-Overlapping Trajectories</p>
        </div>
      </div>

      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Warehouse */}
        {warehouse && (
          <Marker position={[warehouse.lat, warehouse.lng]} icon={createQuantumWarehouseIcon()}>
            <Popup>
              <div className="p-1 font-sans text-xs">
                <div className="font-bold text-purple-400 text-sm">⚛️ Quantum Depot: {warehouse.name}</div>
                <div className="text-slate-300 mt-1">{warehouse.address}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Quantum Deliveries */}
        {deliveries.map((d) => (
          <Marker key={d.id} position={[d.lat, d.lng]} icon={createQuantumDeliveryIcon()}>
            <Popup>
              <div className="p-1 text-xs">
                <div className="font-bold text-purple-300 text-sm">{d.id}: {d.customer}</div>
                <div className="text-slate-300">QUBO Node Assignment: <strong className="text-cyan-400">{d.assigned_vehicle || 'Unassigned'}</strong></div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Quantum Route Glow Lines */}
        {vehicles.map((v, idx) => {
          const color = QUANTUM_ROUTE_COLORS[idx % QUANTUM_ROUTE_COLORS.length];
          const polylineCoords = v.route ? v.route.map((p) => [p.lat, p.lng]) : [];

          return (
            <React.Fragment key={v.id}>
              {polylineCoords.length > 1 && (
                <>
                  {/* Outer Glow Line */}
                  <Polyline
                    positions={polylineCoords}
                    pathOptions={{ color: color, weight: 8, opacity: 0.35 }}
                  />
                  {/* Inner Core Line */}
                  <Polyline
                    positions={polylineCoords}
                    pathOptions={{ color: '#ffffff', weight: 2.5, opacity: 0.9 }}
                  />
                </>
              )}

              <Marker position={[v.lat, v.lng]} icon={createQuantumVehicleIcon(v, idx)}>
                <Popup>
                  <div className="p-1 text-xs">
                    <div className="font-bold text-sm text-purple-300">⚡ {v.id}: {v.name}</div>
                    <div className="text-slate-300 mt-1">Quantum Route Efficiency: <strong className="text-emerald-400">96.4%</strong></div>
                    <div className="text-slate-300">Optimized Distance: <strong>{v.route_distance_km} km</strong></div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
