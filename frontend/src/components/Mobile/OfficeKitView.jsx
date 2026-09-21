import React from 'react';
import FleetMap from '../Map/FleetMap';
import DriverMobileView from './DriverMobileView';
import { Laptop, Smartphone, Zap } from 'lucide-react';

export default function OfficeKitView({
  warehouse,
  deliveries = [],
  vehicles = [],
  logs = [],
  onTriggerBreakdown,
  onConfirmDelivery
}) {
  return (
    <div className="space-y-4">
      {/* Office Kit Header Banner */}
      <div className="glass-panel-glow p-4 rounded-xl border border-purple-500/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-300">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100">Office Kit: Laptop ↔ Driver Phone Real-Time Bridge</h3>
            <p className="text-xs text-slate-300">
              Live WebSockets synchronization. Actions taken on the mobile device instantly update the dispatcher command center map and analytics.
            </p>
          </div>
        </div>
        <span className="text-xs bg-emerald-950 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-full font-mono">
          Sync Connected
        </span>
      </div>

      {/* Dual Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Dispatcher Command Laptop View (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <Laptop className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">Dispatcher Command Laptop Screen</span>
          </div>
          <div className="h-[560px] rounded-xl overflow-hidden border border-slate-800">
            <FleetMap
              warehouse={warehouse}
              deliveries={deliveries}
              vehicles={vehicles}
            />
          </div>
        </div>

        {/* Right Side: Driver Smartphone View (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-200">Driver Smartphone Screen</span>
          </div>
          <DriverMobileView
            vehicles={vehicles}
            deliveries={deliveries}
            onTriggerBreakdown={onTriggerBreakdown}
            onConfirmDelivery={onConfirmDelivery}
          />
        </div>
      </div>
    </div>
  );
}
