import os
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.models import (
    Warehouse, DeliveryPoint, Vehicle, BreakdownRequest,
    DisruptionRequest, SimulationState, ComparisonMetrics
)
from app.simulation.engine import sim_engine
from app.analytics.metrics import calculate_comparison_metrics
from app.optimization.classical import solve_classical_vrp
from app.optimization.qubo_solver import solve_quantum_vrp
from app.llm import tools, copilot
from app.websocket.manager import ws_manager

app = FastAPI(
    title="QuantumRoute AI API & Command Center",
    description="Quantum-Inspired Real-Time Fleet Optimization & Copilot Command Center",
    version="2.5.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CopilotRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ConfirmActionRequest(BaseModel):
    action: str
    target_id: Optional[str] = None
    params: Optional[Dict[str, Any]] = None

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "app": "QuantumRoute AI Command Center API",
        "warehouse": sim_engine.warehouse.name,
        "active_vehicles": len([v for v in sim_engine.vehicles if v["status"] == "Active"]),
        "deliveries_count": len(sim_engine.deliveries)
    }

# WebSockets Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await ws_manager.broadcast({"event": "ping", "data": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.get("/api/warehouse", response_model=Warehouse)
def get_warehouse():
    return sim_engine.warehouse

@app.post("/api/warehouse")
async def update_warehouse(warehouse: Warehouse):
    sim_engine.warehouse = warehouse
    sim_engine.log_event(f"Warehouse location updated: {warehouse.name} ({warehouse.lat}, {warehouse.lng})")
    sim_engine.optimize_routes()
    await ws_manager.broadcast({"event": "warehouse_updated", "warehouse": warehouse.model_dump()})
    return {"status": "success", "warehouse": sim_engine.warehouse}

@app.get("/api/deliveries")
def get_deliveries():
    return sim_engine.deliveries

@app.post("/api/deliveries")
async def add_delivery(delivery: DeliveryPoint):
    existing = [d for d in sim_engine.deliveries if d["id"] == delivery.id]
    if existing:
        delivery.id = f"D{len(sim_engine.deliveries) + 1:02d}"
    
    d_dict = delivery.model_dump()
    sim_engine.deliveries.append(d_dict)
    sim_engine.log_event(f"New delivery added: {d_dict['id']} - {d_dict['customer']} ({d_dict['lat']}, {d_dict['lng']})")
    sim_engine.optimize_routes()
    await ws_manager.broadcast({"event": "delivery_added", "delivery": d_dict})
    return {"status": "success", "delivery": d_dict}

@app.post("/api/driver/deliveries/{delivery_id}/confirm")
async def driver_confirm_delivery(delivery_id: str):
    target_d = next((d for d in sim_engine.deliveries if d["id"] == delivery_id), None)
    if not target_d:
        raise HTTPException(status_code=404, detail="Delivery not found")
        
    target_d["status"] = "Delivered"
    sim_engine.log_event(f"PACKAGE CONFIRMED DELIVERED from Driver Phone: {delivery_id} ({target_d['customer']})", level="SUCCESS")
    await ws_manager.broadcast({"event": "delivery_confirmed", "delivery_id": delivery_id})
    return {"status": "success", "delivery": target_d}

@app.delete("/api/deliveries/{delivery_id}")
async def delete_delivery(delivery_id: str):
    sim_engine.deliveries = [d for d in sim_engine.deliveries if d["id"] != delivery_id]
    sim_engine.log_event(f"Delivery {delivery_id} removed.")
    sim_engine.optimize_routes()
    await ws_manager.broadcast({"event": "delivery_deleted", "delivery_id": delivery_id})
    return {"status": "success"}

@app.get("/api/vehicles")
def get_vehicles():
    return sim_engine.vehicles

@app.post("/api/vehicles")
async def add_vehicle(vehicle: Vehicle):
    v_dict = vehicle.model_dump()
    sim_engine.vehicles.append(v_dict)
    sim_engine.log_event(f"New vehicle added to fleet: {v_dict['id']} ({v_dict['name']})")
    sim_engine.optimize_routes()
    await ws_manager.broadcast({"event": "vehicle_added", "vehicle": v_dict})
    return {"status": "success", "vehicle": v_dict}

@app.post("/api/optimize/classical")
async def run_classical_optimization():
    w_dict = {"lat": sim_engine.warehouse.lat, "lng": sim_engine.warehouse.lng}
    res = solve_classical_vrp(w_dict, sim_engine.deliveries, sim_engine.vehicles)
    sim_engine.classical_result = res
    sim_engine.optimization_mode = "classical"
    sim_engine.optimize_routes()
    await ws_manager.broadcast({"event": "routes_updated", "mode": "classical"})
    return res

@app.post("/api/optimize/quantum")
async def run_quantum_optimization():
    w_dict = {"lat": sim_engine.warehouse.lat, "lng": sim_engine.warehouse.lng}
    res = solve_quantum_vrp(w_dict, sim_engine.deliveries, sim_engine.vehicles)
    sim_engine.quantum_result = res
    sim_engine.optimization_mode = "quantum"
    sim_engine.optimize_routes()
    await ws_manager.broadcast({"event": "routes_updated", "mode": "quantum"})
    return res

@app.post("/api/simulation/start")
def start_simulation(speed: float = 1.0):
    sim_engine.running = True
    sim_engine.speed_multiplier = speed
    sim_engine.log_event(f"Simulation STARTED (Speed: {speed}x)")
    return {"status": "started", "running": True, "speed": speed}

@app.post("/api/simulation/stop")
def stop_simulation():
    sim_engine.running = False
    sim_engine.log_event("Simulation PAUSED")
    return {"status": "paused", "running": False}

@app.post("/api/simulation/tick")
async def tick_simulation():
    sim_engine.simulate_tick()
    return {
        "running": sim_engine.running,
        "ticks_elapsed": sim_engine.ticks_elapsed,
        "vehicles": sim_engine.vehicles,
        "deliveries": sim_engine.deliveries
    }

@app.post("/api/simulation/reset")
async def reset_simulation():
    sim_engine.running = False
    sim_engine.ticks_elapsed = 0
    sim_engine.load_demo_preset()
    await ws_manager.broadcast({"event": "simulation_reset"})
    return {"status": "reset", "message": "Simulation state reset to default demo scenario."}

@app.post("/api/vehicle/breakdown")
async def vehicle_breakdown(req: BreakdownRequest):
    res = sim_engine.trigger_breakdown(req.vehicle_id)
    await ws_manager.broadcast({"event": "breakdown_reported", "vehicle_id": req.vehicle_id, "result": res})
    return res

@app.post("/api/disruption")
async def trigger_disruption(req: DisruptionRequest):
    if req.type == "breakdown" and req.target_id:
        return await vehicle_breakdown(BreakdownRequest(vehicle_id=req.target_id))
    elif req.type == "emergency_delivery" and req.new_delivery:
        return await add_delivery(req.new_delivery)
    else:
        sim_engine.log_event(f"Disruption event simulated: {req.type} on {req.target_id or 'network'}", level="WARNING")
        sim_engine.optimize_routes()
        await ws_manager.broadcast({"event": "disruption_triggered", "type": req.type})
        return {"status": "disruption_applied", "type": req.type}

@app.get("/api/routes")
def get_routes():
    mode_res = sim_engine.quantum_result if sim_engine.optimization_mode == "quantum" else sim_engine.classical_result
    return {
        "mode": sim_engine.optimization_mode,
        "routes": mode_res.get("vehicle_routes", {}),
        "distances": mode_res.get("vehicle_distances", {}),
        "total_distance_km": mode_res.get("total_distance_km", 0.0),
        "vehicles": sim_engine.vehicles
    }

@app.get("/api/optimization/comparison", response_model=ComparisonMetrics)
def get_optimization_comparison():
    num_deliveries = len(sim_engine.deliveries)
    return calculate_comparison_metrics(
        sim_engine.classical_result,
        sim_engine.quantum_result,
        num_deliveries
    )

@app.get("/api/quantum/details")
def get_quantum_details():
    res = sim_engine.quantum_result
    return {
        "qubo_matrix_size": res.get("qubo_matrix_size", "80x80"),
        "qubit_count": res.get("qubit_count", 80),
        "convergence_history": res.get("convergence_history", []),
        "qubo_heatmap": res.get("qubo_heatmap", []),
        "simulation_disclaimer": res.get("simulation_disclaimer", "")
    }

@app.get("/api/logs")
def get_activity_logs():
    return sim_engine.event_logs

# LLM COPILOT ENDPOINTS
@app.post("/api/copilot/chat")
def copilot_chat(req: CopilotRequest):
    return copilot.process_copilot_command(req.message)

@app.post("/api/copilot/confirm")
async def copilot_confirm_action(req: ConfirmActionRequest):
    if req.action == "reassign_vehicle" and req.target_id:
        sim_engine.log_event(f"Action Confirmed: Delivery reassignment executed for {req.target_id}.", level="SUCCESS")
        sim_engine.optimize_routes()
        await ws_manager.broadcast({"event": "routes_updated"})
        return {"status": "executed", "message": f"Deliveries for {req.target_id} successfully reassigned."}
    elif req.action == "simulate_breakdown" and req.target_id:
        res = sim_engine.trigger_breakdown(req.target_id)
        await ws_manager.broadcast({"event": "breakdown_reported", "vehicle_id": req.target_id})
        return {"status": "executed", "result": res}
    else:
        sim_engine.optimize_routes()
        return {"status": "executed"}

@app.get("/api/copilot/insights")
def get_copilot_insights():
    return tools.get_ai_insights()

@app.post("/api/copilot/explain-route")
def copilot_explain_route(vehicle_id: str):
    return tools.explain_route(vehicle_id)

@app.get("/api/copilot/explain-quantum")
def copilot_explain_quantum():
    return tools.explain_quantum()

# SERVE BUILT REACT FRONTEND (Unified Full-Stack Deployment)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api") or full_path.startswith("ws"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
