import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KPICards from './components/Dashboard/KPICards';
import QuickControls from './components/Dashboard/QuickControls';
import LiveEventLog from './components/Dashboard/LiveEventLog';
import FleetMap from './components/Map/FleetMap';
import QuantumMap from './components/Map/QuantumMap';
import BlochSphere3D from './components/QuantumDashboard/BlochSphere3D';
import QuantumCircuit from './components/QuantumDashboard/QuantumCircuit';
import ConvergenceChart from './components/QuantumDashboard/ConvergenceChart';
import ClassicalVsQuantum from './components/Analytics/ClassicalVsQuantum';
import Sustainability from './components/Analytics/Sustainability';
import DeliveryManager from './components/ControlPanel/DeliveryManager';
import VehicleManager from './components/ControlPanel/VehicleManager';
import WarehouseManager from './components/ControlPanel/WarehouseManager';

// New Integrated Modules
import CopilotChat from './components/Copilot/CopilotChat';
import DriverMobileView from './components/Mobile/DriverMobileView';
import OfficeKitView from './components/Mobile/OfficeKitView';
import HackathonDemoBar from './components/Demo/HackathonDemoBar';
import ImpactMetrics from './components/Analytics/ImpactMetrics';

import {
  fetchWarehouse, updateWarehouse, fetchDeliveries, addDelivery,
  deleteDelivery, fetchVehicles, runClassicalOptimization, runQuantumOptimization,
  startSimulation, stopSimulation, tickSimulation, resetSimulation,
  triggerBreakdown, fetchComparisonMetrics, fetchQuantumDetails, fetchLogs, fetchRoutes
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [warehouse, setWarehouse] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [quantumDetails, setQuantumDetails] = useState(null);
  const [classicalRoutes, setClassicalRoutes] = useState(null);
  const [logs, setLogs] = useState([]);
  
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [optimizationMode, setOptimizationMode] = useState('quantum');
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);

  // Load all data from API
  const loadData = async () => {
    try {
      const [w, d, v, m, qd, l, cr] = await Promise.all([
        fetchWarehouse(),
        fetchDeliveries(),
        fetchVehicles(),
        fetchComparisonMetrics(),
        fetchQuantumDetails(),
        fetchLogs(),
        fetchRoutes()
      ]);
      setWarehouse(w);
      setDeliveries(d);
      setVehicles(v);
      setMetrics(m);
      setQuantumDetails(qd);
      setLogs(l);
      setClassicalRoutes(cr);
    } catch (err) {
      console.error("API loading error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // WebSockets Synchronization Connection
  useEffect(() => {
    let ws;
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (['breakdown_reported', 'delivery_confirmed', 'routes_updated', 'delivery_added'].includes(msg.event)) {
          loadData();
        }
      };
    } catch (err) {
      console.error("WebSocket error:", err);
    }
    return () => ws?.close();
  }, []);

  // Simulation Tick Loop
  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(async () => {
        try {
          const res = await tickSimulation();
          setVehicles(res.vehicles || []);
          setDeliveries(res.deliveries || []);
          
          const [m, l] = await Promise.all([fetchComparisonMetrics(), fetchLogs()]);
          setMetrics(m);
          setLogs(l);
        } catch (err) {
          console.error("Simulation tick error:", err);
        }
      }, 600 / speed);
    }
    return () => clearInterval(interval);
  }, [running, speed]);

  const handleStart = async (spd) => {
    await startSimulation(spd);
    setRunning(true);
    setSpeed(spd);
  };

  const handleStop = async () => {
    await stopSimulation();
    setRunning(false);
  };

  const handleReset = async () => {
    await resetSimulation();
    setRunning(false);
    await loadData();
  };

  const handleToggleMode = async (mode) => {
    setOptimizationMode(mode);
    if (mode === 'classical') await runClassicalOptimization();
    else await runQuantumOptimization();
    await loadData();
  };

  const handleVehicleBreakdown = async (vehicleId) => {
    await triggerBreakdown(vehicleId);
    await loadData();
  };

  const handleConfirmDelivery = async (deliveryId) => {
    await fetch(`/api/driver/deliveries/${deliveryId}/confirm`, { method: 'POST' });
    await loadData();
  };

  const handleAddDelivery = async (newDeliv) => {
    await addDelivery(newDeliv);
    await loadData();
  };

  const handleMapClick = async (lat, lng) => {
    const newId = `D${String(deliveries.length + 1).padStart(2, '0')}`;
    await addDelivery({
      id: newId,
      customer: `Map Location ${newId}`,
      lat,
      lng,
      priority: 'High',
      weight: 15.0,
      time_window: '10:00-14:00',
      status: 'Pending'
    });
    setIsAddingPoint(false);
    await loadData();
  };

  const handleDeleteDelivery = async (id) => {
    await deleteDelivery(id);
    await loadData();
  };

  const handleUpdateWarehouse = async (wData) => {
    await updateWarehouse(wData);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetDemo={handleReset}
        onToggleCopilot={() => setShowCopilot(!showCopilot)}
        showCopilot={showCopilot}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1700px] mx-auto w-full">
        {/* Top Summary KPI Cards */}
        <KPICards
          vehicles={vehicles}
          deliveries={deliveries}
          metrics={metrics}
          optimizationMode={optimizationMode}
        />

        {/* Tab 1: Command Center Main View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <HackathonDemoBar
              onRunClassical={runClassicalOptimization}
              onRunQuantum={runQuantumOptimization}
              onStartSimulation={handleStart}
              onTriggerBreakdown={handleVehicleBreakdown}
              onReset={handleReset}
            />

            <QuickControls
              running={running}
              speed={speed}
              optimizationMode={optimizationMode}
              isAddingPoint={isAddingPoint}
              vehicles={vehicles}
              onStart={handleStart}
              onStop={handleStop}
              onReset={handleReset}
              onToggleMode={handleToggleMode}
              onTriggerBreakdown={handleVehicleBreakdown}
              onToggleAddPoint={() => setIsAddingPoint(!isAddingPoint)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[620px]">
              <div className="lg:col-span-2 h-full">
                <FleetMap
                  warehouse={warehouse}
                  deliveries={deliveries}
                  vehicles={vehicles}
                  isAddingPoint={isAddingPoint}
                  onMapClick={handleMapClick}
                  onVehicleBreakdown={handleVehicleBreakdown}
                />
              </div>

              <div className="lg:col-span-1 h-full">
                <LiveEventLog logs={logs} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Quantum Optimization Dashboard */}
        {activeTab === 'quantum' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px]">
              <BlochSphere3D />
              <QuantumCircuit />
              <ConvergenceChart history={quantumDetails?.convergence_history || []} />
            </div>

            <div className="h-[450px]">
              <QuantumMap
                warehouse={warehouse}
                deliveries={deliveries}
                vehicles={vehicles}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Side-by-Side Classical vs Quantum Maps & Comparison */}
        {activeTab === 'comparison' && (
          <ClassicalVsQuantum
            warehouse={warehouse}
            deliveries={deliveries}
            vehicles={vehicles}
            metrics={metrics}
            classicalRoutes={classicalRoutes}
          />
        )}

        {/* Tab 4: Office Kit Dual Screen Sync View */}
        {activeTab === 'office_kit' && (
          <OfficeKitView
            warehouse={warehouse}
            deliveries={deliveries}
            vehicles={vehicles}
            logs={logs}
            onTriggerBreakdown={handleVehicleBreakdown}
            onConfirmDelivery={handleConfirmDelivery}
          />
        )}

        {/* Tab 5: Driver Mobile Portal */}
        {activeTab === 'mobile' && (
          <DriverMobileView
            vehicles={vehicles}
            deliveries={deliveries}
            onTriggerBreakdown={handleVehicleBreakdown}
            onConfirmDelivery={handleConfirmDelivery}
          />
        )}

        {/* Tab 6: Fleet & Delivery Management */}
        {activeTab === 'fleet' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DeliveryManager
              deliveries={deliveries}
              isAddingPoint={isAddingPoint}
              onAddDelivery={handleAddDelivery}
              onDeleteDelivery={handleDeleteDelivery}
              onToggleAddPoint={() => setIsAddingPoint(!isAddingPoint)}
            />
            <div className="space-y-6">
              <VehicleManager
                vehicles={vehicles}
                onTriggerBreakdown={handleVehicleBreakdown}
              />
              <WarehouseManager
                warehouse={warehouse}
                onUpdateWarehouse={handleUpdateWarehouse}
              />
            </div>
          </div>
        )}

        {/* Tab 7: Sustainability & Impact Metrics Dashboard */}
        {activeTab === 'sustainability' && (
          <div className="space-y-6">
            <Sustainability metrics={metrics} />
            <ImpactMetrics metrics={metrics} />
          </div>
        )}
      </main>

      {/* Floating LLM Copilot Drawer */}
      {showCopilot && (
        <CopilotChat
          onClose={() => setShowCopilot(false)}
          onRefreshData={loadData}
        />
      )}

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-900 py-3 px-6 text-center text-xs text-slate-500">
        QuantumRoute AI Dispatch Command Center &copy; 2026. Built with Python FastAPI + QUBO Quantum Annealing + WebSockets + Copilot LLM + React.
      </footer>
    </div>
  );
}
