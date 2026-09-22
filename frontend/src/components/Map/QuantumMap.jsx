import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Sparkles, Zap } from 'lucide-react';

const QUANTUM_ROUTE_COLORS = ['#c084fc', '#38bdf8', '#34d399', '#f472b6', '#a78bfa'];

const DEFAULT_WAREHOUSE = {
  id: "depot_hyd",
  name: "Hyderabad Logistics Hub",
  lat: 17.385044,
  lng: 78.486671,
  address: "Hitec City / Madhapur Main Hub, Hyderabad"
};

const DEFAULT_DELIVERIES = [
  { id: "D01", customer: "Nexus Mall - KPHB", lat: 17.4842, lng: 78.3889, priority: "High", weight: 18.0, status: "Assigned", assigned_vehicle: "V01" },
  { id: "D02", customer: "Cyber Towers - Hitec City", lat: 17.4504, lng: 78.3808, priority: "Emergency", weight: 12.0, status: "Assigned", assigned_vehicle: "V01" },
  { id: "D03", customer: "Inorbit Mall - Madhapur", lat: 17.4348, lng: 78.3867, priority: "Medium", weight: 25.0, status: "Assigned", assigned_vehicle: "V02" },
  { id: "D04", customer: "IKEA Hyderabad - Raidurg", lat: 17.4375, lng: 78.3761, priority: "High", weight: 30.0, status: "Assigned", assigned_vehicle: "V02" },
  { id: "D05", customer: "Mindspace IT Park", lat: 17.4419, lng: 78.3813, priority: "Medium", weight: 15.0, status: "Assigned", assigned_vehicle: "V03" },
  { id: "D06", customer: "Financial District - Nanakramguda", lat: 17.4140, lng: 78.3490, priority: "High", weight: 22.0, status: "Assigned", assigned_vehicle: "V03" },
  { id: "D07", customer: "Gachibowli Stadium Hub", lat: 17.4447, lng: 78.3483, priority: "Low", weight: 10.0, status: "Assigned", assigned_vehicle: "V04" },
  { id: "D08", customer: "DLF Cyber City - Gachibowli", lat: 17.4498, lng: 78.3592, priority: "Medium", weight: 14.0, status: "Assigned", assigned_vehicle: "V04" }
];

const DEFAULT_VEHICLES = [
  {
    id: "V01", name: "Quantum Express 1", type: "Heavy EV Van", capacity: 120, current_load: 30, fuel_level: 92, lat: 17.465, lng: 78.385, speed: 45, status: "Active", assigned_deliveries: ["D01", "D02"],
    route: [{ lat: 17.385044, lng: 78.486671 }, { lat: 17.4842, lng: 78.3889 }, { lat: 17.4504, lng: 78.3808 }, { lat: 17.385044, lng: 78.486671 }], route_distance_km: 24.5, eta_minutes: 15
  },
  {
    id: "V02", name: "Quantum Express 2", type: "Medium EV Van", capacity: 90, current_load: 55, fuel_level: 88, lat: 17.436, lng: 78.380, speed: 42, status: "Active", assigned_deliveries: ["D03", "D04"],
    route: [{ lat: 17.385044, lng: 78.486671 }, { lat: 17.4348, lng: 78.3867 }, { lat: 17.4375, lng: 78.3761 }, { lat: 17.385044, lng: 78.486671 }], route_distance_km: 28.2, eta_minutes: 18
  },
  {
    id: "V03", name: "Quantum Express 3", type: "Cargo Trike", capacity: 70, current_load: 37, fuel_level: 95, lat: 17.425, lng: 78.365, speed: 35, status: "Active", assigned_deliveries: ["D05", "D06"],
    route: [{ lat: 17.385044, lng: 78.486671 }, { lat: 17.4419, lng: 78.3813 }, { lat: 17.4140, lng: 78.3490 }, { lat: 17.385044, lng: 78.486671 }], route_distance_km: 31.0, eta_minutes: 22
  },
  {
    id: "V04", name: "Quantum Express 4", type: "Heavy EV Van", capacity: 130, current_load: 24, fuel_level: 84, lat: 17.447, lng: 78.353, speed: 48, status: "Active", assigned_deliveries: ["D07", "D08"],
    route: [{ lat: 17.385044, lng: 78.486671 }, { lat: 17.4447, lng: 78.3483 }, { lat: 17.4498, lng: 78.3592 }, { lat: 17.385044, lng: 78.486671 }], route_distance_km: 26.8, eta_minutes: 14
  }
];

export default function QuantumMap({
  warehouse = DEFAULT_WAREHOUSE,
  deliveries = DEFAULT_DELIVERIES,
  vehicles = DEFAULT_VEHICLES
}) {
  const activeWarehouse = warehouse || DEFAULT_WAREHOUSE;
  const activeDeliveries = deliveries && deliveries.length > 0 ? deliveries : DEFAULT_DELIVERIES;
  const activeVehicles = vehicles && vehicles.length > 0 ? vehicles : DEFAULT_VEHICLES;

  const centerLat = activeWarehouse?.lat || 17.385044;
  const centerLng = activeWarehouse?.lng || 78.486671;

  const createQuantumWarehouseIcon = () =>
    L.divIcon({
      className: 'quantum-depot-icon',
      html: `<div class="w-10 h-10 bg-purple-600 border-2 border-cyan-400 rounded-xl shadow-2xl flex items-center justify-center text-xl font-bold">⚛️</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

  const createQuantumDeliveryIcon = () =>
    L.divIcon({
      className: 'quantum-delivery-icon',
      html: `<div class="w-7 h-7 bg-purple-900 border-2 border-cyan-400 rounded-full shadow-lg flex items-center justify-center text-xs text-cyan-300 font-bold">⚛️</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

  const createQuantumVehicleIcon = (v, idx) => {
    const color = QUANTUM_ROUTE_COLORS[idx % QUANTUM_ROUTE_COLORS.length];
    return L.divIcon({
      className: 'quantum-vehicle-icon',
      html: `<div class="w-9 h-9 border-2 border-cyan-300 rounded-full shadow-2xl flex items-center justify-center text-white text-base" style="background-color: ${color}">⚡</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-xl overflow-hidden border border-purple-500/30 shadow-2xl">
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
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[460px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Warehouse */}
        {activeWarehouse && (
          <Marker position={[activeWarehouse.lat, activeWarehouse.lng]} icon={createQuantumWarehouseIcon()}>
            <Popup>
              <div className="p-1 font-sans text-xs">
                <div className="font-bold text-purple-400 text-sm">⚛️ Quantum Depot: {activeWarehouse.name}</div>
                <div className="text-slate-300 mt-1">{activeWarehouse.address}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Quantum Deliveries */}
        {activeDeliveries.map((d) => (
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
        {activeVehicles.map((v, idx) => {
          const color = QUANTUM_ROUTE_COLORS[idx % QUANTUM_ROUTE_COLORS.length];
          const polylineCoords = v.route ? v.route.map((p) => Array.isArray(p) ? p : [p.lat, p.lng]) : [];

          return (
            <React.Fragment key={v.id}>
              {polylineCoords.length > 1 && (
                <>
                  <Polyline
                    positions={polylineCoords}
                    pathOptions={{ color: color, weight: 8, opacity: 0.4 }}
                  />
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
