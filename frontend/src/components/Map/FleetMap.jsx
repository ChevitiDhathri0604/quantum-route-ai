import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Truck, MapPin, AlertTriangle, PlusCircle } from 'lucide-react';

// Custom Map Click Handler with useRef to prevent stale closure bugs
function MapClickHandler({ isAddingPoint, onMapClick }) {
  const isAddingRef = useRef(isAddingPoint);
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => {
    isAddingRef.current = isAddingPoint;
    onMapClickRef.current = onMapClick;
  }, [isAddingPoint, onMapClick]);

  useMapEvents({
    click(e) {
      if (onMapClickRef.current && (isAddingRef.current || true)) {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

const ROUTE_COLORS = ['#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

// Default Fallback Dataset (Hyderabad Logistics Hub)
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

export default function FleetMap({
  warehouse = DEFAULT_WAREHOUSE,
  deliveries = DEFAULT_DELIVERIES,
  vehicles = DEFAULT_VEHICLES,
  isAddingPoint = false,
  onMapClick,
  onVehicleBreakdown
}) {
  const activeWarehouse = warehouse || DEFAULT_WAREHOUSE;
  const activeDeliveries = deliveries && deliveries.length > 0 ? deliveries : DEFAULT_DELIVERIES;
  const activeVehicles = vehicles && vehicles.length > 0 ? vehicles : DEFAULT_VEHICLES;

  const centerLat = activeWarehouse?.lat || 17.385044;
  const centerLng = activeWarehouse?.lng || 78.486671;

  // Custom Leaflet DivIcons
  const createWarehouseIcon = () =>
    L.divIcon({
      className: 'custom-warehouse-icon',
      html: `<div class="w-10 h-10 bg-gradient-to-tr from-amber-600 to-yellow-400 border-2 border-white rounded-xl shadow-2xl flex items-center justify-center text-xl font-bold">🏭</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

  const createDeliveryIcon = (priority, status) => {
    let colorClass = 'bg-cyan-500';
    if (priority === 'Emergency') colorClass = 'bg-rose-500 animate-pulse';
    else if (priority === 'High') colorClass = 'bg-amber-500';
    else if (status === 'Delivered') colorClass = 'bg-emerald-500 opacity-60';

    return L.divIcon({
      className: 'custom-delivery-icon',
      html: `<div class="w-7 h-7 ${colorClass} border-2 border-white rounded-full shadow-lg flex items-center justify-center text-xs font-bold text-white">📍</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  const createVehicleIcon = (vehicle, idx) => {
    const isBroken = vehicle.status === 'BROKEN DOWN';
    const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];

    if (isBroken) {
      return L.divIcon({
        className: 'custom-vehicle-broken',
        html: `<div class="w-9 h-9 bg-rose-600 border-2 border-white rounded-full shadow-2xl flex items-center justify-center text-white text-base vehicle-marker-broken font-bold">❌</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
    }

    return L.divIcon({
      className: 'custom-vehicle-icon',
      html: `<div class="w-9 h-9 border-2 border-white rounded-full shadow-2xl flex items-center justify-center text-white text-base vehicle-marker-active" style="background-color: ${color}">🚚</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  return (
    <div className={`relative w-full h-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl ${isAddingPoint ? 'cursor-crosshair' : ''}`}>
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] glass-panel px-4 py-2.5 rounded-xl border border-slate-700/80 flex items-center gap-3 shadow-xl">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-100">Live Logistics Command Map</span>
        </div>
        <span className={`text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
          isAddingPoint
            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60 animate-pulse font-bold'
            : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>
          <PlusCircle className="w-3 h-3" /> Click anywhere on map to add delivery point
        </span>
      </div>

      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler isAddingPoint={isAddingPoint} onMapClick={onMapClick} />

        {/* Warehouse Marker */}
        {activeWarehouse && (
          <Marker position={[activeWarehouse.lat, activeWarehouse.lng]} icon={createWarehouseIcon()}>
            <Popup>
              <div className="p-1 font-sans text-xs">
                <div className="font-bold text-amber-400 text-sm">🏭 {activeWarehouse.name}</div>
                <div className="text-slate-300 mt-1">{activeWarehouse.address}</div>
                <div className="text-[10px] text-slate-400 mt-1">Lat: {activeWarehouse.lat}, Lng: {activeWarehouse.lng}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Delivery Point Markers */}
        {activeDeliveries.map((d) => (
          <Marker
            key={d.id}
            position={[d.lat, d.lng]}
            icon={createDeliveryIcon(d.priority, d.status)}
          >
            <Popup>
              <div className="p-1 text-xs">
                <div className="font-bold text-cyan-400 text-sm">{d.id}: {d.customer}</div>
                <div className="text-slate-300 mt-1">Weight: <strong>{d.weight} kg</strong></div>
                <div className="text-slate-300">Priority: <strong className={d.priority === 'Emergency' ? 'text-rose-400' : 'text-amber-400'}>{d.priority}</strong></div>
                <div className="text-slate-400 text-[10px] mt-1">Status: {d.status}</div>
                {d.assigned_vehicle && (
                  <div className="mt-1 bg-slate-800 p-1 rounded text-purple-300 font-mono">
                    Assigned: {d.assigned_vehicle}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Vehicle Polylines & Markers */}
        {activeVehicles.map((v, idx) => {
          const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
          const isBroken = v.status === 'BROKEN DOWN';
          const polylineCoords = v.route ? v.route.map((p) => [p.lat, p.lng]) : [];

          return (
            <React.Fragment key={v.id}>
              {/* Route Polyline */}
              {polylineCoords.length > 1 && (
                <Polyline
                  positions={polylineCoords}
                  pathOptions={{
                    color: isBroken ? '#ef4444' : color,
                    weight: isBroken ? 2 : 4,
                    dashArray: isBroken ? '6, 6' : null,
                    opacity: isBroken ? 0.4 : 0.85,
                  }}
                />
              )}

              {/* Animated Vehicle Marker */}
              <Marker
                position={[v.lat, v.lng]}
                icon={createVehicleIcon(v, idx)}
              >
                <Popup>
                  <div className="p-1 text-xs min-w-[180px]">
                    <div className="font-bold text-sm text-cyan-300 flex justify-between items-center">
                      <span>🚚 {v.id}: {v.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${isBroken ? 'bg-rose-900 text-rose-300' : 'bg-emerald-900 text-emerald-300'}`}>
                        {v.status}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-slate-300 text-[11px]">
                      <div>Capacity: <strong>{v.current_load} / {v.capacity} kg</strong></div>
                      <div>Fuel / Battery: <strong className="text-amber-400">{v.fuel_level}%</strong></div>
                      <div>Route Distance: <strong>{v.route_distance_km} km</strong></div>
                      <div>ETA: <strong>{v.eta_minutes} min</strong></div>
                      <div>Assigned Stops: <strong>{v.assigned_deliveries?.length || 0}</strong></div>
                    </div>

                    {!isBroken && onVehicleBreakdown && (
                      <button
                        onClick={() => onVehicleBreakdown(v.id)}
                        className="mt-3 w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-1 px-2 rounded text-[11px] flex items-center justify-center gap-1 transition"
                      >
                        <AlertTriangle className="w-3 h-3" /> Simulate Breakdown
                      </button>
                    )}
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
