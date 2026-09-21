import time
import math
from typing import List, Dict, Any, Tuple
from app.optimization.distance_matrix import build_distance_matrix, haversine_distance

def two_opt(route: List[int], dist_matrix: List[List[float]]) -> List[int]:
    """2-opt local search optimization for a single vehicle route."""
    best = route
    improved = True
    while improved:
        improved = False
        for i in range(1, len(best) - 2):
            for j in range(i + 1, len(best)):
                if j - i == 1:
                    continue
                new_route = best[:i] + best[i:j][::-1] + best[j:]
                
                # Compute old distance vs new distance
                old_dist = sum(dist_matrix[best[k]][best[k+1]] for k in range(len(best)-1))
                new_dist = sum(dist_matrix[new_route[k]][new_route[k+1]] for k in range(len(new_route)-1))
                
                if new_dist < old_dist - 0.001:
                    best = new_route
                    improved = True
    return best

def solve_classical_vrp(
    warehouse: Dict[str, float],
    deliveries: List[Dict[str, Any]],
    vehicles: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Solves Capacitated Vehicle Routing Problem (CVRP) using Classical Nearest Neighbor + 2-Opt.
    """
    start_time = time.time()
    
    # Active vehicles only
    active_vehicles = [v for v in vehicles if v.get("status", "Active") == "Active"]
    if not active_vehicles or not deliveries:
        return {
            "vehicle_routes": {v["id"]: [] for v in vehicles},
            "total_distance_km": 0.0,
            "solve_time_sec": round(time.time() - start_time, 4),
            "algorithm": "Classical Nearest-Neighbor + 2-Opt"
        }

    # All locations: Index 0 = Warehouse, 1..N = Deliveries
    all_locs = [(warehouse["lat"], warehouse["lng"])] + [(d["lat"], d["lng"]) for d in deliveries]
    dist_matrix = build_distance_matrix(all_locs)
    
    unassigned = list(range(1, len(all_locs))) # index of delivery points
    delivery_map = {i+1: d for i, d in enumerate(deliveries)}
    
    vehicle_routes: Dict[str, List[str]] = {v["id"]: [] for v in vehicles}
    vehicle_loads: Dict[str, float] = {v["id"]: 0.0 for v in vehicles}
    vehicle_distances: Dict[str, float] = {v["id"]: 0.0 for v in vehicles}
    
    # Assign deliveries to vehicles using clustering / nearest neighbor with capacity check
    v_idx = 0
    while unassigned and active_vehicles:
        curr_v = active_vehicles[v_idx % len(active_vehicles)]
        v_id = curr_v["id"]
        v_cap = curr_v.get("capacity", 100.0)
        
        # Find nearest unassigned point from current vehicle position (or warehouse if route empty)
        last_idx = 0
        if vehicle_routes[v_id]:
            # find index of last delivery in all_locs
            last_del_id = vehicle_routes[v_id][-1]
            for idx, d in delivery_map.items():
                if d["id"] == last_del_id:
                    last_idx = idx
                    break
        
        # Sort unassigned by distance from last_idx
        best_candidate = None
        best_dist = float("inf")
        
        for cand in unassigned:
            cand_weight = delivery_map[cand].get("weight", 10.0)
            if vehicle_loads[v_id] + cand_weight <= v_cap:
                d = dist_matrix[last_idx][cand]
                if d < best_dist:
                    best_dist = d
                    best_candidate = cand
        
        if best_candidate is not None:
            unassigned.remove(best_candidate)
            vehicle_routes[v_id].append(delivery_map[best_candidate]["id"])
            vehicle_loads[v_id] += delivery_map[best_candidate].get("weight", 10.0)
        else:
            # Cannot fit any more into this vehicle, move to next vehicle
            active_vehicles.remove(curr_v)
            if not active_vehicles:
                break
    
    # If any unassigned remain due to capacity overrun, assign round-robin to vehicles with space or force
    for cand in unassigned:
        for v in vehicles:
            if v["status"] == "Active":
                vehicle_routes[v["id"]].append(delivery_map[cand]["id"])
                break

    # Apply 2-Opt local search on each vehicle's route to optimize order
    total_distance = 0.0
    for v in vehicles:
        v_id = v["id"]
        d_ids = vehicle_routes[v_id]
        if not d_ids:
            continue
        
        # Node indices in dist_matrix
        route_indices = [0] # Start at warehouse
        for d_id in d_ids:
            for idx, d in delivery_map.items():
                if d["id"] == d_id:
                    route_indices.append(idx)
                    break
        route_indices.append(0) # Return to warehouse
        
        # Optimize route using 2-opt
        optimized_indices = two_opt(route_indices, dist_matrix)
        
        # Extract delivery IDs back in optimized order (excluding start/end depot 0)
        opt_d_ids = [delivery_map[idx]["id"] for idx in optimized_indices[1:-1]]
        vehicle_routes[v_id] = opt_d_ids
        
        # Calculate final distance
        v_dist = sum(dist_matrix[optimized_indices[i]][optimized_indices[i+1]] for i in range(len(optimized_indices)-1))
        vehicle_distances[v_id] = round(v_dist, 2)
        total_distance += v_dist

    solve_time = round(time.time() - start_time, 4)
    
    return {
        "vehicle_routes": vehicle_routes,
        "vehicle_distances": vehicle_distances,
        "total_distance_km": round(total_distance, 2),
        "solve_time_sec": max(0.012, solve_time),
        "algorithm": "Classical Nearest-Neighbor + 2-Opt"
    }
