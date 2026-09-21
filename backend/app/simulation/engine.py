import math
from typing import List, Dict, Any, Tuple
from app.models import Vehicle, DeliveryPoint, Warehouse
from app.optimization.classical import solve_classical_vrp
from app.optimization.qubo_solver import solve_quantum_vrp

class DispatchSimulationEngine:
    def __init__(self):
        self.warehouse = Warehouse()
        self.deliveries: List[Dict[str, Any]] = []
        self.vehicles: List[Dict[str, Any]] = []
        self.running: bool = False
        self.speed_multiplier: float = 1.0
        self.optimization_mode: str = "quantum"
        self.ticks_elapsed: int = 0
        self.event_logs: List[Dict[str, str]] = []
        self.classical_result: Dict[str, Any] = {}
        self.quantum_result: Dict[str, Any] = {}
        self.load_demo_preset()

    def log_event(self, message: str, level: str = "INFO"):
        """Append event log entry with timestamp."""
        import datetime
        now_str = datetime.datetime.now().strftime("%H:%M:%S")
        self.event_logs.append({
            "timestamp": now_str,
            "message": message,
            "level": level
        })
        # Keep latest 100 log entries
        if len(self.event_logs) > 100:
            self.event_logs.pop(0)

    def load_demo_preset(self):
        """Pre-populate Hyderabad Logistics Hub demo scenario with 4 vehicles and 20 deliveries."""
        self.warehouse = Warehouse(
            id="depot_hyd",
            name="Hyderabad Logistics Hub",
            lat=17.385044,
            lng=78.486671,
            address="Hitec City / Madhapur Main Hub, Hyderabad"
        )
        
        # 4 Vehicles
        self.vehicles = [
            {
                "id": "V01",
                "name": "Quantum Express 1",
                "type": "Heavy EV Van",
                "capacity": 120.0,
                "current_load": 0.0,
                "fuel_level": 92.0,
                "lat": 17.385044,
                "lng": 78.486671,
                "speed": 45.0,
                "status": "Active",
                "assigned_deliveries": [],
                "route": [{"lat": 17.385044, "lng": 78.486671}],
                "route_progress": 0.0,
                "current_step_idx": 0,
                "eta_minutes": 15.0,
                "route_distance_km": 0.0,
                "fuel_consumed_l": 0.0,
                "co2_emitted_kg": 0.0
            },
            {
                "id": "V02",
                "name": "Quantum Express 2",
                "type": "Medium EV Van",
                "capacity": 90.0,
                "current_load": 0.0,
                "fuel_level": 88.0,
                "lat": 17.385044,
                "lng": 78.486671,
                "speed": 42.0,
                "status": "Active",
                "assigned_deliveries": [],
                "route": [{"lat": 17.385044, "lng": 78.486671}],
                "route_progress": 0.0,
                "current_step_idx": 0,
                "eta_minutes": 18.0,
                "route_distance_km": 0.0,
                "fuel_consumed_l": 0.0,
                "co2_emitted_kg": 0.0
            },
            {
                "id": "V03",
                "name": "Quantum Express 3",
                "type": "Electric Cargo Trike",
                "capacity": 70.0,
                "current_load": 0.0,
                "fuel_level": 95.0,
                "lat": 17.385044,
                "lng": 78.486671,
                "speed": 35.0,
                "status": "Active",
                "assigned_deliveries": [],
                "route": [{"lat": 17.385044, "lng": 78.486671}],
                "route_progress": 0.0,
                "current_step_idx": 0,
                "eta_minutes": 22.0,
                "route_distance_km": 0.0,
                "fuel_consumed_l": 0.0,
                "co2_emitted_kg": 0.0
            },
            {
                "id": "V04",
                "name": "Quantum Express 4",
                "type": "Heavy EV Van",
                "capacity": 130.0,
                "current_load": 0.0,
                "fuel_level": 84.0,
                "lat": 17.385044,
                "lng": 78.486671,
                "speed": 48.0,
                "status": "Active",
                "assigned_deliveries": [],
                "route": [{"lat": 17.385044, "lng": 78.486671}],
                "route_progress": 0.0,
                "current_step_idx": 0,
                "eta_minutes": 14.0,
                "route_distance_km": 0.0,
                "fuel_consumed_l": 0.0,
                "co2_emitted_kg": 0.0
            }
        ]

        # 20 Deliveries spread around Hyderabad (Gachibowli, Jubilee Hills, Banjara Hills, Kondapur, Begumpet, Secunderabad, etc.)
        hyd_points = [
            ("D01", "Nexus Mall - KPHB", 17.4842, 78.3889, "High", 18.0, "09:00-11:00"),
            ("D02", "Cyber Towers - Hitec City", 17.4504, 78.3808, "Emergency", 12.0, "09:30-10:30"),
            ("D03", "Inorbit Mall - Madhapur", 17.4348, 78.3867, "Medium", 25.0, "10:00-12:00"),
            ("D04", "IKEA Hyderabad - Raidurg", 17.4375, 78.3761, "High", 30.0, "10:30-12:30"),
            ("D05", "Mindspace IT Park", 17.4419, 78.3813, "Medium", 15.0, "11:00-13:00"),
            ("D06", "Financial District - Nanakramguda", 17.4140, 78.3490, "High", 22.0, "11:30-13:30"),
            ("D07", "Gachibowli Stadium Hub", 17.4447, 78.3483, "Low", 10.0, "12:00-14:00"),
            ("D08", "DLF Cyber City - Gachibowli", 17.4498, 78.3592, "Medium", 14.0, "12:30-14:30"),
            ("D09", "Jubilee Hills Checkpost", 17.4325, 78.4072, "High", 20.0, "13:00-15:00"),
            ("D10", "Apollo Hospital - Jubilee Hills", 17.4162, 78.4124, "Emergency", 8.0, "09:00-10:00"),
            ("D11", "Banjara Hills Road No 12", 17.4100, 78.4350, "Medium", 16.0, "13:30-15:30"),
            ("D12", "Panjagutta Circle Node", 17.4256, 78.4512, "Low", 11.0, "14:00-16:00"),
            ("D13", "Begumpet Airport Zone", 17.4450, 78.4680, "High", 28.0, "14:30-16:30"),
            ("D14", "Secunderabad Railway Logistics", 17.4399, 78.5017, "Medium", 35.0, "15:00-17:00"),
            ("D15", "Paradise Circle - Secunderabad", 17.4420, 78.4870, "Low", 9.0, "15:30-17:30"),
            ("D16", "Kukatpally Housing Board", 17.4930, 78.3990, "Medium", 19.0, "16:00-18:00"),
            ("D17", "Miyapur Metro Station", 17.4960, 78.3610, "Low", 15.0, "16:30-18:00"),
            ("D18", "Hafeezpet Station Depot", 17.4820, 78.3520, "High", 21.0, "10:00-12:00"),
            ("D19", "Kondapur Botanical Garden", 17.4620, 78.3670, "Medium", 13.0, "11:00-13:00"),
            ("D20", "Manikonda Marichettu", 17.4010, 78.3820, "Low", 17.0, "12:00-14:00"),
        ]
        
        self.deliveries = []
        for d in hyd_points:
            self.deliveries.append({
                "id": d[0],
                "customer": d[1],
                "lat": d[2],
                "lng": d[3],
                "priority": d[4],
                "weight": d[5],
                "time_window": d[6],
                "status": "Pending",
                "assigned_vehicle": None,
                "delivery_order": None
            })

        self.event_logs = []
        self.log_event("Hyderabad Logistics Hub demo preset initialized (4 Vehicles, 20 Deliveries)")
        self.optimize_routes()

    def optimize_routes(self):
        """Run both Classical and Quantum solvers and build full geographic waypoints for vehicles."""
        w_dict = {"lat": self.warehouse.lat, "lng": self.warehouse.lng}
        
        # 1. Classical optimization
        self.classical_result = solve_classical_vrp(w_dict, self.deliveries, self.vehicles)
        
        # 2. Quantum optimization
        self.quantum_result = solve_quantum_vrp(w_dict, self.deliveries, self.vehicles)
        
        # Choose routes based on active optimization mode
        chosen_res = self.quantum_result if self.optimization_mode == "quantum" else self.classical_result
        assigned_routes = chosen_res.get("vehicle_routes", {})
        
        delivery_dict = {d["id"]: d for d in self.deliveries}
        
        # Build smooth lat/lng polyline routes for each vehicle
        for v in self.vehicles:
            v_id = v["id"]
            assigned_d_ids = assigned_routes.get(v_id, [])
            v["assigned_deliveries"] = assigned_d_ids
            
            # Reset delivery status
            total_load = 0.0
            route_coords = [{"lat": self.warehouse.lat, "lng": self.warehouse.lng}]
            
            for idx, d_id in enumerate(assigned_d_ids):
                if d_id in delivery_dict:
                    d = delivery_dict[d_id]
                    d["assigned_vehicle"] = v_id
                    d["delivery_order"] = idx + 1
                    d["status"] = "Assigned"
                    total_load += d.get("weight", 10.0)
                    route_coords.append({"lat": d["lat"], "lng": d["lng"]})
            
            # Return to warehouse
            route_coords.append({"lat": self.warehouse.lat, "lng": self.warehouse.lng})
            
            v["current_load"] = round(total_load, 1)
            v["route"] = route_coords
            v["route_distance_km"] = chosen_res.get("vehicle_distances", {}).get(v_id, 25.0)
            v["eta_minutes"] = round((v["route_distance_km"] / v["speed"]) * 60.0 + len(assigned_d_ids) * 4.0, 1)
            
        self.log_event(f"Route optimization completed ({self.optimization_mode.upper()} mode). Total distance: {chosen_res.get('total_distance_km')} km")

    def simulate_tick(self):
        """Simulate single animation step for moving vehicles along their polyline routes."""
        if not self.running:
            return
            
        self.ticks_elapsed += 1
        delivery_dict = {d["id"]: d for d in self.deliveries}
        
        for v in self.vehicles:
            if v["status"] != "Active":
                continue
                
            route = v.get("route", [])
            if len(route) <= 1:
                continue
                
            curr_idx = v.get("current_step_idx", 0)
            if curr_idx >= len(route) - 1:
                v["status"] = "Completed"
                v["eta_minutes"] = 0.0
                self.log_event(f"Vehicle {v['id']} completed all assigned deliveries and returned to depot.")
                continue
                
            p1 = route[curr_idx]
            p2 = route[curr_idx + 1]
            
            # Progress interpolation along segment (p1 -> p2)
            prog = v.get("route_progress", 0.0) + (0.08 * self.speed_multiplier)
            
            if prog >= 1.0:
                # Reached waypoint p2!
                v["current_step_idx"] = curr_idx + 1
                v["route_progress"] = 0.0
                v["lat"] = p2["lat"]
                v["lng"] = p2["lng"]
                
                # Check if p2 was a delivery point
                for d_id in v["assigned_deliveries"]:
                    if d_id in delivery_dict:
                        d = delivery_dict[d_id]
                        if abs(d["lat"] - p2["lat"]) < 0.0001 and abs(d["lng"] - p2["lng"]) < 0.0001:
                            if d["status"] != "Delivered":
                                d["status"] = "Delivered"
                                self.log_event(f"Vehicle {v['id']} successfully delivered package {d['id']} ({d['customer']}).")
            else:
                v["route_progress"] = prog
                v["lat"] = round(p1["lat"] + (p2["lat"] - p1["lat"]) * prog, 6)
                v["lng"] = round(p1["lng"] + (p2["lng"] - p1["lng"]) * prog, 6)

            # Update fuel & distance stats
            v["fuel_level"] = max(5.0, round(v["fuel_level"] - (0.05 * self.speed_multiplier), 1))
            v["fuel_consumed_l"] = round(v["fuel_consumed_l"] + (0.02 * self.speed_multiplier), 2)
            v["co2_emitted_kg"] = round(v["fuel_consumed_l"] * 2.35, 2)
            v["eta_minutes"] = max(0.0, round(v["eta_minutes"] - (0.2 * self.speed_multiplier), 1))

    def trigger_breakdown(self, vehicle_id: str):
        """
        Vehicle Breakdown Simulation & Dynamic Re-Routing:
        1. Instantly set vehicle status to BROKEN DOWN.
        2. Stop its movement.
        3. Identify remaining undelivered packages.
        4. Re-optimize remaining active fleet using Quantum QUBO solver.
        5. Dynamically redraw new routes and update metrics!
        """
        target_v = next((v for v in self.vehicles if v["id"] == vehicle_id), None)
        if not target_v:
            return {"error": f"Vehicle {vehicle_id} not found"}
            
        target_v["status"] = "BROKEN DOWN"
        target_v["speed"] = 0.0
        self.log_event(f"CRITICAL DISRUPTION: Vehicle {vehicle_id} ({target_v['name']}) BROKEN DOWN!", level="ERROR")
        
        # Find undelivered packages previously assigned to this vehicle
        undelivered_d_ids = [
            d["id"] for d in self.deliveries
            if d.get("assigned_vehicle") == vehicle_id and d.get("status") != "Delivered"
        ]
        
        self.log_event(f"Identified {len(undelivered_d_ids)} pending packages on {vehicle_id}: {', '.join(undelivered_d_ids)}")
        
        # Reset assignment for undelivered packages
        for d in self.deliveries:
            if d["id"] in undelivered_d_ids:
                d["status"] = "Pending"
                d["assigned_vehicle"] = None
                
        # Trigger dynamic re-optimization across active remaining vehicles!
        self.log_event("Triggering dynamic QUBO quantum re-optimization for fleet re-assignment...", level="WARNING")
        self.optimize_routes()
        self.log_event(f"DYNAMIC RE-ROUTING DEPLOYED! Undelivered packages reassigned across active fleet.", level="SUCCESS")
        
        return {
            "broken_vehicle": vehicle_id,
            "reassigned_deliveries": undelivered_d_ids,
            "message": f"Vehicle {vehicle_id} broken down. Reassigned {len(undelivered_d_ids)} deliveries and recalculated optimal routes."
        }

# Global Singleton instance
sim_engine = DispatchSimulationEngine()
