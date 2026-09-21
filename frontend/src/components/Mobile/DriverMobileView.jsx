import React, { useState } from 'react';
import { Truck, MapPin, AlertTriangle, QrCode, Mic, CheckCircle2, Navigation, Battery, Volume2 } from 'lucide-react';
import PackageScanner from './PackageScanner';

export default function DriverMobileView({
  vehicles = [],
  deliveries = [],
  onTriggerBreakdown,
  onConfirmDelivery,
  onVoiceCommand
}) {
  const [selectedVehicleId, setSelectedVehicleId] = useState('V03');
  const [showScanner, setShowScanner] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [listening, setListening] = useState(false);

  const vehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || {
    id: 'V03',
    name: 'Quantum Express 3',
    fuel_level: 88,
    status: 'Active',
    assigned_deliveries: ['D03', 'D07', 'D11'],
    current_load: 42
  };

  const assignedDeliveries = deliveries.filter((d) => vehicle.assigned_deliveries?.includes(d.id));

  const handleSpeech = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;

    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }

    setListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setVoiceText(text);
      setListening(false);
      if (text.toLowerCase().includes('breakdown')) {
        onTriggerBreakdown(vehicle.id);
      } else if (onVoiceCommand) {
        onVoiceCommand(text);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  const isBroken = vehicle.status === 'BROKEN DOWN';

  return (
    <div className="max-w-md mx-auto min-h-[700px] bg-slate-950 text-slate-100 rounded-3xl border-4 border-slate-800 shadow-2xl p-4 flex flex-col space-y-4 font-sans">
      {/* Mobile Top Bar */}
      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-xs font-bold text-slate-100">Driver Portal: {vehicle.id}</div>
            <div className="text-[10px] text-slate-400">{vehicle.name}</div>
          </div>
        </div>

        {/* Vehicle Picker */}
        <select
          value={selectedVehicleId}
          onChange={(e) => setSelectedVehicleId(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2 py-1 text-cyan-300 font-bold outline-none"
        >
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.id} ({v.status})
            </option>
          ))}
        </select>
      </div>

      {/* Vehicle Status Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
        isBroken
          ? 'bg-rose-950/80 border-rose-500/60 shadow-lg shadow-rose-950/50'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div>
          <div className="text-xs text-slate-400">Vehicle Status</div>
          <div className={`text-base font-extrabold ${isBroken ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
            {vehicle.status}
          </div>
        </div>

        <div className="text-right text-xs">
          <div className="text-slate-400 flex items-center justify-end gap-1">
            <Battery className="w-3.5 h-3.5 text-amber-400" /> Battery
          </div>
          <div className="font-extrabold text-amber-400 font-mono text-sm">{vehicle.fuel_level}%</div>
        </div>
      </div>

      {/* EMERGENCY BREAKDOWN BUTTON */}
      {!isBroken ? (
        <button
          onClick={() => onTriggerBreakdown(vehicle.id)}
          className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-900/40 transition active:scale-95"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-300" /> 🚨 REPORT VEHICLE BREAKDOWN
        </button>
      ) : (
        <div className="bg-rose-950 border border-rose-500/50 p-3 rounded-2xl text-center text-xs text-rose-300 font-bold">
          ⚠️ Breakdown Reported. Dispatcher & QUBO AI reassigning pending packages...
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowScanner(true)}
          className="bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition"
        >
          <QrCode className="w-4 h-4 text-cyan-400" /> Scan Package
        </button>

        <button
          onClick={handleSpeech}
          className={`py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
            listening
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
              : 'bg-purple-950/80 hover:bg-purple-900 border-purple-500/40 text-purple-300'
          }`}
        >
          <Mic className="w-4 h-4" /> {listening ? 'Listening...' : 'Voice Command'}
        </button>
      </div>

      {voiceText && (
        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-cyan-300 italic flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" /> "{voiceText}"
        </div>
      )}

      {/* Assigned Delivery Stops List */}
      <div className="flex-1 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 overflow-y-auto space-y-2">
        <div className="text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
          <span>Assigned Stops ({assignedDeliveries.length})</span>
          <span className="text-[10px] text-slate-500">Tap to confirm stop</span>
        </div>

        {assignedDeliveries.length === 0 ? (
          <div className="text-slate-500 text-xs italic py-4 text-center">No pending stops assigned to this vehicle.</div>
        ) : (
          assignedDeliveries.map((d, idx) => (
            <div
              key={d.id}
              className={`p-3 rounded-xl border transition flex items-center justify-between ${
                d.status === 'Delivered'
                  ? 'bg-emerald-950/40 border-emerald-500/40 opacity-70'
                  : 'bg-slate-950 border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-cyan-300">{d.id}</span>
                  <span className="text-xs font-semibold text-slate-100">{d.customer}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Weight: {d.weight} kg | Priority: {d.priority}</div>
              </div>

              {d.status !== 'Delivered' ? (
                <button
                  onClick={() => onConfirmDelivery(d.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Deliver
                </button>
              ) : (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">
                  Delivered
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Package Scanner Modal */}
      {showScanner && (
        <PackageScanner
          onConfirmDelivery={(did) => {
            onConfirmDelivery(did);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
