import React from 'react';
import { Cpu, Zap } from 'lucide-react';

export default function QuantumCircuit() {
  const qubits = ['q₀', 'q₁', 'q₂', 'q₃'];

  return (
    <div className="glass-panel rounded-xl p-5 border border-cyan-500/20 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-slate-100">QAOA Quantum Circuit</h3>
        </div>
        <span className="text-xs bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 px-2.5 py-1 rounded-full font-mono">
          Ansatz Layer p=1
        </span>
      </div>

      {/* Visual Gate Schematic */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-4 overflow-x-auto">
        {qubits.map((q, idx) => (
          <div key={q} className="flex items-center gap-2 min-w-[500px]">
            {/* Qubit Label */}
            <span className="font-mono text-xs font-bold text-slate-400 w-8">{q} |0⟩</span>
            
            {/* Wire Line with Gates */}
            <div className="flex-1 relative flex items-center h-10 bg-slate-950/60 rounded-lg px-2 border border-slate-800/80">
              <div className="absolute left-0 right-0 h-0.5 bg-slate-700" />

              {/* Hadamard Superposition Gate H */}
              <div className="relative z-10 bg-gradient-to-br from-cyan-600 to-blue-700 text-white text-xs font-bold font-mono w-8 h-8 rounded flex items-center justify-center shadow-lg border border-cyan-300/40 ml-2">
                H
              </div>

              {/* Phase Shift Gate Rz(γ) */}
              <div className="relative z-10 bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-[11px] font-bold font-mono px-2 h-8 rounded flex items-center justify-center shadow-lg border border-purple-300/40 ml-6">
                R<sub>z</sub>(γ)
              </div>

              {/* CNOT Entanglement Gate Connection */}
              <div className="relative z-10 flex flex-col items-center ml-8">
                {idx % 2 === 0 ? (
                  <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-lg" />
                ) : (
                  <div className="w-4 h-4 border-2 border-cyan-400 rounded-full flex items-center justify-center font-bold text-[10px] text-cyan-400 bg-slate-900">
                    +
                  </div>
                )}
              </div>

              {/* Mixer Gate Rx(β) */}
              <div className="relative z-10 bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-[11px] font-bold font-mono px-2 h-8 rounded flex items-center justify-center shadow-lg border border-emerald-300/40 ml-12">
                R<sub>x</sub>(β)
              </div>

              {/* Measurement Symbol */}
              <div className="relative z-10 bg-slate-800 text-amber-400 border border-amber-500/40 w-7 h-7 rounded flex items-center justify-center text-xs ml-auto">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Circuit Legend & Explanation */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
          <div className="text-cyan-400 font-bold mb-0.5">H Gate</div>
          <div className="text-[11px] text-slate-400">Creates equal superposition of routes</div>
        </div>
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
          <div className="text-purple-400 font-bold mb-0.5">R<sub>z</sub>(γ) Cost</div>
          <div className="text-[11px] text-slate-400">Encodes QUBO distance Hamiltonian</div>
        </div>
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
          <div className="text-emerald-400 font-bold mb-0.5">R<sub>x</sub>(β) Mixer</div>
          <div className="text-[11px] text-slate-400">Drives quantum state transitions</div>
        </div>
      </div>
    </div>
  );
}
