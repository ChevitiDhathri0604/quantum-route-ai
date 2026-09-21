import React, { useState } from 'react';
import { MapPin, Plus, Trash2, PlusCircle } from 'lucide-react';

export default function DeliveryManager({
  deliveries = [],
  isAddingPoint,
  onAddDelivery,
  onDeleteDelivery,
  onToggleAddPoint
}) {
  const [customer, setCustomer] = useState('');
  const [lat, setLat] = useState('17.4200');
  const [lng, setLng] = useState('78.4000');
  const [priority, setPriority] = useState('High');
  const [weight, setWeight] = useState('15');
  const [timeWindow, setTimeWindow] = useState('10:00-12:00');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer) return;
    onAddDelivery({
      id: `D${String(deliveries.length + 1).padStart(2, '0')}`,
      customer,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      priority,
      weight: parseFloat(weight),
      time_window: timeWindow,
      status: 'Pending'
    });
    setCustomer('');
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-slate-100">Delivery Point Management</h3>
        </div>
        <button
          onClick={onToggleAddPoint}
          className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition ${
            isAddingPoint ? 'bg-amber-500 text-black' : 'bg-slate-800 text-cyan-300 border border-slate-700'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          {isAddingPoint ? 'Clicking Map Active...' : 'Click Map to Add'}
        </button>
      </div>

      {/* Add New Delivery Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs">
        <div>
          <label className="text-slate-400 block mb-1">Customer / Node Name</label>
          <input
            type="text"
            placeholder="e.g. Amazon Hub - Hitec City"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-400 outline-none"
            required
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Latitude</label>
          <input
            type="number"
            step="0.0001"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono focus:border-cyan-400 outline-none"
            required
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Longitude</label>
          <input
            type="number"
            step="0.0001"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono focus:border-cyan-400 outline-none"
            required
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-400 outline-none"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Package Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-cyan-400 outline-none"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1.5 rounded flex items-center justify-center gap-1 transition"
          >
            <Plus className="w-4 h-4" /> Add Delivery
          </button>
        </div>
      </form>

      {/* Deliveries Table */}
      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 sticky top-0">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Coordinates</th>
              <th className="p-2">Priority</th>
              <th className="p-2">Weight</th>
              <th className="p-2">Vehicle</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {deliveries.map((d) => (
              <tr key={d.id} className="hover:bg-slate-900/40">
                <td className="p-2 font-mono text-cyan-300 font-bold">{d.id}</td>
                <td className="p-2 font-medium text-slate-200">{d.customer}</td>
                <td className="p-2 font-mono text-slate-400">{d.lat.toFixed(4)}, {d.lng.toFixed(4)}</td>
                <td className="p-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    d.priority === 'Emergency' ? 'bg-rose-900 text-rose-300' :
                    d.priority === 'High' ? 'bg-amber-900 text-amber-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {d.priority}
                  </span>
                </td>
                <td className="p-2">{d.weight} kg</td>
                <td className="p-2 font-mono text-purple-300">{d.assigned_vehicle || '—'}</td>
                <td className="p-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    d.status === 'Delivered' ? 'bg-emerald-900/80 text-emerald-300' :
                    d.status === 'Assigned' ? 'bg-cyan-900/80 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {d.status}
                  </span>
                </td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => onDeleteDelivery(d.id)}
                    className="text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
