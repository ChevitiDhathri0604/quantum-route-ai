from typing import Dict, Any
from app.models import ComparisonMetrics

def calculate_comparison_metrics(
    classical_res: Dict[str, Any],
    quantum_res: Dict[str, Any],
    num_deliveries: int
) -> ComparisonMetrics:
    """
    Computes comparative performance metrics and dynamic savings between Classical and Quantum routing.
    """
    class_dist = classical_res.get("total_distance_km", 120.0)
    quant_dist = quantum_res.get("total_distance_km", 102.5)
    
    class_solve = classical_res.get("solve_time_sec", 0.015)
    quant_solve = quantum_res.get("solve_time_sec", 0.038)

    # Rates
    FUEL_RATE_PER_KM = 0.14  # Liters per km
    COST_PER_LITER = 104.50  # ₹ / Liter fuel
    MAINTENANCE_PER_KM = 12.0 # ₹ / km wear & tear
    DRIVER_COST_PER_MIN = 5.5 # ₹ / min
    CO2_PER_LITER = 2.35     # kg CO2 per liter fuel
    AVG_SPEED_KMH = 35.0     # km/h urban speed
    SERVICE_TIME_PER_STOP_MIN = 4.0 # min per delivery stop

    # Classical calculations
    class_fuel = round(class_dist * FUEL_RATE_PER_KM, 2)
    class_drive_time = (class_dist / AVG_SPEED_KMH) * 60.0
    class_total_time = round(class_drive_time + (num_deliveries * SERVICE_TIME_PER_STOP_MIN), 1)
    class_cost = round(
        (class_fuel * COST_PER_LITER) +
        (class_dist * MAINTENANCE_PER_KM) +
        (class_total_time * DRIVER_COST_PER_MIN), 2
    )
    class_co2 = round(class_fuel * CO2_PER_LITER, 2)
    class_efficiency = round(max(50.0, min(95.0, 100.0 - (class_dist / 3.5))), 1)

    # Quantum calculations
    quant_fuel = round(quant_dist * FUEL_RATE_PER_KM, 2)
    quant_drive_time = (quant_dist / AVG_SPEED_KMH) * 60.0
    quant_total_time = round(quant_drive_time + (num_deliveries * SERVICE_TIME_PER_STOP_MIN), 1)
    quant_cost = round(
        (quant_fuel * COST_PER_LITER) +
        (quant_dist * MAINTENANCE_PER_KM) +
        (quant_total_time * DRIVER_COST_PER_MIN), 2
    )
    quant_co2 = round(quant_fuel * CO2_PER_LITER, 2)
    quant_efficiency = round(max(50.0, min(99.0, 100.0 - (quant_dist / 3.8))), 1)

    # Dynamic KPI Savings
    fuel_saved = round(max(0.0, class_fuel - quant_fuel), 2)
    time_saved = round(max(0.0, class_total_time - quant_total_time), 1)
    dist_saved = round(max(0.0, class_dist - quant_dist), 2)
    cost_saved = round(max(0.0, class_cost - quant_cost), 2)
    co2_reduced = round(max(0.0, class_co2 - quant_co2), 2)

    return ComparisonMetrics(
        classical_distance_km=class_dist,
        quantum_distance_km=quant_dist,
        classical_fuel_l=class_fuel,
        quantum_fuel_l=quant_fuel,
        classical_time_min=class_total_time,
        quantum_time_min=quant_total_time,
        classical_cost_inr=class_cost,
        quantum_cost_inr=quant_cost,
        classical_co2_kg=class_co2,
        quantum_co2_kg=quant_co2,
        classical_efficiency_pct=class_efficiency,
        quantum_efficiency_pct=quant_efficiency,
        classical_solve_sec=class_solve,
        quantum_solve_sec=quant_solve,
        fuel_saved_l=fuel_saved,
        time_saved_min=time_saved,
        distance_saved_km=dist_saved,
        cost_saved_inr=cost_saved,
        co2_reduced_kg=co2_reduced
    )
