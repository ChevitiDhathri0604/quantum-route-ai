import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function HackathonDemoBar({
  onRunClassical,
  onRunQuantum,
  onStartSimulation,
  onTriggerBreakdown,
  onReset
}) {
  const [runningDemo, setRunningDemo] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timerSec, setTimerSec] = useState(0);

  const steps = [
    { title: 'Setup Scenario', desc: 'Loaded Hyderabad Hub (5 Vehicles, 25 Deliveries)' },
    { title: 'Classical Optimization', desc: 'Calculated baseline Nearest-Neighbor routes' },
    { title: 'Quantum QUBO Solver', desc: 'Constructed Ising Hamiltonian & QAOA ansatz' },
    { title: 'Classical vs Quantum', desc: 'Generated fuel, time, cost & CO₂ comparison' },
    { title: 'Start Live Simulation', desc: 'Fleet vehicles animating along route polylines' },
    { title: 'Driver Phone Breakdown', desc: 'Simulated driver reporting V02 breakdown via phone' },
    { title: 'LLM Copilot Event Parsing', desc: 'Copilot detected breakdown & requested confirmation' },
    { title: 'Dynamic QUBO Re-Routing', desc: 'Pending deliveries reassigned to active fleet' },
    { title: 'Map Polylines Redrawn', desc: 'Live logistics map dynamically updated' },
    { title: 'Final Sustainability Report', desc: 'Fuel, time & CO₂ savings finalized' }
  ];

  useEffect(() => {
    let interval;
    if (runningDemo) {
      interval = setInterval(() => {
        setTimerSec((prev) => prev + 1);

        // Step transitions every 12 seconds
        setTimerSec((prevTime) => {
          const nextStep = Math.floor(prevTime / 12);
          if (nextStep !== currentStep && nextStep < steps.length) {
            setCurrentStep(nextStep);
            executeStepAction(nextStep);
          }
          if (nextStep >= steps.length) {
            setRunningDemo(false);
          }
          return prevTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [runningDemo, currentStep]);

  const executeStepAction = (stepIdx) => {
    if (stepIdx === 1) onRunClassical();
    else if (stepIdx === 2) onRunQuantum();
    else if (stepIdx === 4) onStartSimulation(2.0);
    else if (stepIdx === 5) onTriggerBreakdown('V02');
  };

  const handleStartDemo = () => {
    onReset();
    setRunningDemo(true);
    setCurrentStep(0);
    setTimerSec(0);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="glass-panel-glow p-4 rounded-xl border border-purple-500/40 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-extrabold text-slate-100">🎬 Hackathon 3-5 Minute Interactive Demo Execution Script</h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            Demo Timer: {formatTime(timerSec)}
          </span>

          {!runningDemo ? (
            <button
              onClick={handleStartDemo}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-extrabold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition"
            >
              <Play className="w-4 h-4 fill-white" /> Launch 3-Min Hackathon Demo
            </button>
          ) : (
            <button
              onClick={() => setRunningDemo(false)}
              className="bg-amber-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
            >
              <Pause className="w-4 h-4" /> Pause Script
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps Indicator */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 text-[10px]">
        {steps.map((s, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;

          return (
            <div
              key={idx}
              className={`p-2 rounded-lg border transition flex flex-col justify-between ${
                isActive
                  ? 'bg-purple-950 border-purple-400 shadow-md shadow-purple-950/60 animate-pulse'
                  : isDone
                  ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950 border-slate-900 text-slate-500'
              }`}
            >
              <div className="font-bold flex items-center justify-between mb-0.5">
                <span>STEP {idx + 1}</span>
                {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </div>
              <div className="font-medium text-[10px] leading-tight truncate">{s.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
