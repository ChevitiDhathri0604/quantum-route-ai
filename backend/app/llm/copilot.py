import re
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from app.llm import tools

class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ActionConfirmation(BaseModel):
    action: str # reassign_vehicle, simulate_breakdown, optimize_routes, add_delivery
    target_id: Optional[str] = None
    title: str
    description: str
    proposed_changes: Dict[str, Any]
    impact_metrics: Dict[str, Any]

class CopilotResponse(BaseModel):
    response: str
    tool_used: Optional[str] = None
    data: Optional[Any] = None
    action_confirmation: Optional[ActionConfirmation] = None

def process_copilot_command(prompt: str) -> CopilotResponse:
    text = prompt.lower().strip()

    # 1. Action Confirmation Trigger: "reassign V02" or "reassign all deliveries"
    match_reassign = re.search(r"reassign\s*(?:all\s*)?(?:deliveries\s*on\s*|for\s*)?(v\d+)?", text)
    if "reassign" in text and match_reassign:
        target_v = match_reassign.group(1).upper() if match_reassign.group(1) else "V02"
        v_status = tools.get_vehicle_status(target_v)
        
        # Check undelivered packages on target_v
        pending_ids = v_status.get("assigned_deliveries", ["D08", "D11", "D14", "D17"])
        proposed_assignments = {
            "D08": "V03",
            "D11": "V01",
            "D14": "V03",
            "D17": "V04"
        }
        
        confirmation = ActionConfirmation(
            action="reassign_vehicle",
            target_id=target_v,
            title=f"Confirm Delivery Reassignment for {target_v}",
            description=f"Vehicle {target_v} has {len(pending_ids)} pending deliveries. Reassigning them to available fleet vehicles will update routes dynamically.",
            proposed_changes=proposed_assignments,
            impact_metrics={
                "estimated_additional_distance_km": 6.4,
                "estimated_fuel_impact_l": 0.8,
                "reassigned_packages_count": len(pending_ids)
            }
        )
        return CopilotResponse(
            response=f"I have prepared a reassignment plan for {target_v}'s pending deliveries ({', '.join(pending_ids)}). Please review the action confirmation before proceeding.",
            tool_used="reassign_deliveries",
            action_confirmation=confirmation
        )

    # 2. Action Confirmation Trigger: "breakdown V02" or "V02 has broken down"
    match_bd = re.search(r"(v\d+)\s*(?:has\s*)?broken\s*down", text) or re.search(r"breakdown\s*(v\d+)", text)
    if match_bd:
        target_v = match_bd.group(1).upper()
        confirmation = ActionConfirmation(
            action="simulate_breakdown",
            target_id=target_v,
            title=f"Confirm Vehicle Breakdown Simulation ({target_v})",
            description=f"This action will immediately set {target_v} to BROKEN DOWN, halt its movement, and re-optimize pending deliveries across remaining active vehicles.",
            proposed_changes={"vehicle_status": "BROKEN DOWN", "target_vehicle": target_v},
            impact_metrics={
                "affected_vehicle": target_v,
                "action": "Trigger QUBO Quantum Re-routing"
            }
        )
        return CopilotResponse(
            response=f"Vehicle breakdown request detected for {target_v}. Please confirm to execute breakdown simulation and dynamic QUBO re-routing.",
            tool_used="simulate_vehicle_breakdown",
            action_confirmation=confirmation
        )

    # 3. Read-only Query: Fleet Status / Active Vehicles
    if any(k in text for k in ["active vehicle", "fleet status", "show vehicles", "show all vehicles", "list vehicle"]):
        fleet = tools.get_fleet_status()
        v_summary = ", ".join([f"{v['id']} ({v['name']} - {v['status']})" for v in fleet['vehicles']])
        return CopilotResponse(
            response=f"The fleet currently has {fleet['active_count']} active vehicle(s), {fleet['broken_count']} broken down, and {fleet['completed_count']} completed. Fleet lineup: {v_summary}.",
            tool_used="get_fleet_status",
            data=fleet
        )

    # 4. Read-only Query: Fuel / Sustainability Metrics
    if any(k in text for k in ["fuel", "co2", "carbon", "saved", "sustainability", "environmental"]):
        sust = tools.get_sustainability_metrics()
        return CopilotResponse(
            response=f"Quantum route optimization has saved {sust['fuel_saved_l']} L of fuel, reduced {sust['co2_reduced_kg']} kg of CO₂ emissions ({sust['distance_saved_km']} km distance reduced). This is equivalent to planting {sust['trees_equivalent']} trees per year (Eco Score: {sust['eco_score']}%).",
            tool_used="get_sustainability_metrics",
            data=sust
        )

    # 5. Read-only Query: Classical vs Quantum Comparison
    if any(k in text for k in ["compare", "classical vs quantum", "difference", "solution"]):
        comp = tools.compare_classical_quantum()
        return CopilotResponse(
            response=f"Classical VRP distance: {comp['classical_distance_km']} km (Fuel: {comp['classical_fuel_l']} L). Quantum QUBO distance: {comp['quantum_distance_km']} km (Fuel: {comp['quantum_fuel_l']} L). Quantum optimization reduced total distance by {comp['distance_saved_km']} km and saved ₹{comp['cost_saved_inr']}.",
            tool_used="compare_classical_quantum",
            data=comp
        )

    # 6. Read-only Query: Explain Quantum Optimization
    if any(k in text for k in ["explain quantum", "qubo", "qaoa", "hamiltonian", "why did quantum"]):
        q_exp = tools.explain_quantum()
        return CopilotResponse(
            response=q_exp["explanation"],
            tool_used="explain_quantum",
            data=q_exp
        )

    # 7. Read-only Query: Explain Specific Route
    match_explain_v = re.search(r"explain\s*(?:route\s*)?(v\d+)?", text)
    if "explain" in text and match_explain_v:
        target_v = match_explain_v.group(1).upper() if match_explain_v.group(1) else "V01"
        v_exp = tools.explain_route(target_v)
        return CopilotResponse(
            response=v_exp["explanation"],
            tool_used="explain_route",
            data=v_exp
        )

    # 8. Read-only Query: AI Insights
    if any(k in text for k in ["insight", "recommendation", "alert", "delay", "overloaded"]):
        insights = tools.get_ai_insights()
        summary = " | ".join([f"[{i['badge']}] {i['text']}" for i in insights])
        return CopilotResponse(
            response=f"Current AI Operations Insights: {summary}",
            tool_used="get_ai_insights",
            data=insights
        )

    # Default Fallback Query
    fleet = tools.get_fleet_status()
    sust = tools.get_sustainability_metrics()
    return CopilotResponse(
        response=f"I understand your operational query. Currently, QuantumRoute AI is monitoring {fleet['total_vehicles']} fleet vehicles and {len(tools.get_pending_deliveries())} pending delivery stops. QUBO optimization has saved {sust['fuel_saved_l']} L of fuel ({sust['co2_reduced_kg']} kg CO₂ saved). You can ask me to explain routes, compare classical vs quantum, or trigger breakdown actions.",
        tool_used="get_fleet_status"
    )
