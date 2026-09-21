import React, { useState } from 'react';
import { Building2, Save } from 'lucide-react';

export default function WarehouseManager({ warehouse, onUpdateWarehouse }) {
  const [name, setName] = useState(warehouse?.name || 'Hyderabad Logistics Hub');
  const [lat, setLat] = useState(warehouse?.lat || 17.385044);
  const [lng, setLng] = useState(warehouse?.lng || 78.486671);
  const [address, setAddress] = useState(warehouse?.address || 'Hitec City / Madhapur Main Hub, Hyderabad');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateWarehouse({
      id: warehouse?.id || 'depot_1',
      name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address
    });
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-amber-400" />
        <h3 className="text-base font-bold text-slate-100">Warehouse Depot Management</h3>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="text-slate-400 block mb-1">Hub Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-amber-400 outline-none"
            required
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Address / Zone</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-amber-400 outline-none"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Depot Latitude</label>
          <input
            type="number"
            step="0.0001"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-amber-400 outline-none"
            required
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Depot Longitude</label>
          <input
            type="number"
            step="0.0001"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-amber-400 outline-none"
            required
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
          >
            <Save className="w-4 h-4" /> Save Warehouse Config
          </button>
        </div>
      </form>
    </div>
  );
}
