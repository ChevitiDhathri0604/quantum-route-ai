# QuantumRoute AI - Quantum-Inspired Fleet Optimization Command Center

**QuantumRoute AI** is a full-stack, quantum-inspired real-time fleet optimization and dispatch command center. It combines **QUBO (Quadratic Unconstrained Binary Optimization)**, **QAOA (Quantum Approximate Optimization)**, an **LLM Fleet Operations Copilot**, a **Driver Mobile Portal**, **WebSockets Synchronization**, and **Green Logistics Analytics** to solve last-mile delivery inefficiencies.

---

## 🚀 Quick Start

### 1. Backend (Python FastAPI)
```bash
cd backend
python run.py
```
- Server: `http://localhost:8000`
- REST & WebSockets API Docs: `http://localhost:8000/docs`

### 2. Frontend (React + Vite + Leaflet)
```bash
cd frontend
npm install
npm run dev
```
- Application: `http://localhost:3000`

---

## 🛠️ GitHub Push & Deployment Guide

### Push to your GitHub Repository:
1. Create a new repository on [GitHub](https://github.com/new).
2. Run the following commands in your terminal:
```bash
git remote add origin https://github.com/YOUR_USERNAME/quantum-route-ai.git
git branch -M main
git push -u origin main
```

### Deployment Options:
- **Frontend Deployment (Vercel / Netlify)**:
  - Framework Preset: `Vite`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- **Backend Deployment (Render / Railway)**:
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `python run.py` or `uvicorn app.main:app --host 0.0.0.0 --port 8000`
