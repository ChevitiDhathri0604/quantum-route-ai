from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Warehouse(BaseModel):
    id: str = "depot_1"
    name: str = "Hyderabad Logistics Hub"
    lat: float = 17.385044
    lng: float = 78.486671
    address: Optional[str] = "Hitec City / Madhapur Logistics Node"

class DeliveryPoint(BaseModel):
    id: str
    customer: str
    lat: float
    lng: float
    priority: str = "Medium" # Low, Medium, High, Emergency
    weight: float = 10.0 # kg
    time_window: str = "09:00 - 18:00"
    status: str = "Pending" # Pending, Assigned, In Transit, Delivered, Reassigned, Cancelled
    assigned_vehicle: Optional[str] = None
    delivery_order: Optional[int] = None

class Vehicle(BaseModel):
    id: str
    name: str
    type: str = "Electric Van"
    capacity: float = 100.0 # kg
    current_load: float = 0.0
    fuel_level: float = 100.0 # %
    lat: float = 17.385044
    lng: float = 78.486671
    speed: float = 40.0 # km/h
    status: str = "Active" # Active, Broken Down, Maintenance, Completed
    assigned_deliveries: List[str] = []
    route: List[Dict[str, float]] = [] # list of lat/lng dicts
    eta_minutes: float = 0.0
    route_distance_km: float = 0.0
    fuel_consumed_l: float = 0.0
    co2_emitted_kg: float = 0.0

class SimulationState(BaseModel):
    running: bool = False
    speed_multiplier: float = 1.0
    current_step: int = 0
    ticks_elapsed: int = 0
    optimization_mode: str = "quantum" # classical or quantum
    last_disruption: Optional[str] = None

class BreakdownRequest(BaseModel):
    vehicle_id: str
    reason: Optional[str] = "Engine overheating / mechanical failure"

class DisruptionRequest(BaseModel):
    type: str # breakdown, traffic_jam, road_closure, emergency_delivery
    target_id: Optional[str] = None
    severity: Optional[float] = 1.0
    new_delivery: Optional[DeliveryPoint] = None

class ComparisonMetrics(BaseModel):
    classical_distance_km: float
    quantum_distance_km: float
    classical_fuel_l: float
    quantum_fuel_l: float
    classical_time_min: float
    quantum_time_min: float
    classical_cost_inr: float
    quantum_cost_inr: float
    classical_co2_kg: float
    quantum_co2_kg: float
    classical_efficiency_pct: float
    quantum_efficiency_pct: float
    classical_solve_sec: float
    quantum_solve_sec: float
    
    fuel_saved_l: float
    time_saved_min: float
    distance_saved_km: float
    cost_saved_inr: float
    co2_reduced_kg: float
