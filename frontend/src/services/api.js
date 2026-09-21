const API_BASE = '/api';

export async function fetchWarehouse() {
  const res = await fetch(`${API_BASE}/warehouse`);
  return res.json();
}

export async function updateWarehouse(data) {
  const res = await fetch(`${API_BASE}/warehouse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchDeliveries() {
  const res = await fetch(`${API_BASE}/deliveries`);
  return res.json();
}

export async function addDelivery(data) {
  const res = await fetch(`${API_BASE}/deliveries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteDelivery(id) {
  const res = await fetch(`${API_BASE}/deliveries/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function fetchVehicles() {
  const res = await fetch(`${API_BASE}/vehicles`);
  return res.json();
}

export async function runClassicalOptimization() {
  const res = await fetch(`${API_BASE}/optimize/classical`, { method: 'POST' });
  return res.json();
}

export async function runQuantumOptimization() {
  const res = await fetch(`${API_BASE}/optimize/quantum`, { method: 'POST' });
  return res.json();
}

export async function startSimulation(speed = 1.0) {
  const res = await fetch(`${API_BASE}/simulation/start?speed=${speed}`, { method: 'POST' });
  return res.json();
}

export async function stopSimulation() {
  const res = await fetch(`${API_BASE}/simulation/stop`, { method: 'POST' });
  return res.json();
}

export async function tickSimulation() {
  const res = await fetch(`${API_BASE}/simulation/tick`, { method: 'POST' });
  return res.json();
}

export async function resetSimulation() {
  const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
  return res.json();
}

export async function triggerBreakdown(vehicleId) {
  const res = await fetch(`${API_BASE}/vehicle/breakdown`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vehicle_id: vehicleId }),
  });
  return res.json();
}

export async function triggerDisruption(data) {
  const res = await fetch(`${API_BASE}/disruption`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchRoutes() {
  const res = await fetch(`${API_BASE}/routes`);
  return res.json();
}

export async function fetchComparisonMetrics() {
  const res = await fetch(`${API_BASE}/optimization/comparison`);
  return res.json();
}

export async function fetchQuantumDetails() {
  const res = await fetch(`${API_BASE}/quantum/details`);
  return res.json();
}

export async function fetchLogs() {
  const res = await fetch(`${API_BASE}/logs`);
  return res.json();
}
