import React from 'react';
import { Sparkles, Map, BarChart2, Truck, Leaf, RefreshCw, Bot, Smartphone, Laptop } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onResetDemo, onToggleCopilot, showCopilot }) {
  const tabs = [
    { id: 'dashboard', label: 'Command Center', icon: Map },
    { id: 'quantum', label: 'Quantum Optimization', icon: Sparkles },
    { id: 'comparison', label: 'Classical vs Quantum', icon: BarChart2 },
    { id: 'office_kit', label: 'Office Kit Sync', icon: Laptop },
    { id: 'mobile', label: 'Driver Mobile', icon: Smartphone },
    { id: 'fleet', label: 'Fleet & Deliveries', icon: Truck },
    { id: 'sustainability', label: 'Sustainability & Impact', icon: Leaf },
  ];

  return (
    <header className="glass-panel border-b border-slate-800 sticky top-0 z-[2000] px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-purple-900/40 font-extrabold text-xl">
          ⚛️
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-tight text-slate-100 font-sans">
              QuantumRoute <span className="text-cyan-400">AI</span>
            </h1>
            <span className="text-[10px] bg-purple-950/80 border border-purple-500/50 text-purple-300 px-2 py-0.5 rounded-full font-mono">
              v2.5 Copilot + Mobile
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Quantum-Inspired Fleet Optimization & Driver Copilot System</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleCopilot}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
            showCopilot
              ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-900/50'
              : 'bg-slate-900 text-purple-300 border-purple-500/40 hover:bg-purple-950/60'
          }`}
        >
          <Bot className="w-4 h-4 text-cyan-300" /> Copilot AI
        </button>

        <button
          onClick={onResetDemo}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Reset
        </button>
      </div>
    </header>
  );
}
