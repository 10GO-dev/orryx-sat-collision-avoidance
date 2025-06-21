# 🛰️ Satellite Collision Predictor

A full-stack application that predicts potential **satellite collisions** by fetching live orbital data (TLEs), simulating future orbits using orbital mechanics, and detecting near-miss events. This project uses modern tools like **FastAPI**, **Skyfield**, and soon **CesiumJS** for 3D visualization.

> 🚀 Currently in active development. Phase 1 (live TLE fetch) and Phase 2 (collision detection engine) are complete.

---

## 🎯 Motivation

With thousands of satellites in orbit and more being launched every month, the risk of **accidental collisions** is growing. This project aims to:

- Fetch live orbital data from public sources
- Simulate satellite trajectories using real physics
- Detect close-approach scenarios
- Raise collision alerts
- Visualize orbits and alerts in a 3D dashboard (coming soon)

---

## ⚙️ Tech Stack

| Area                | Tool                   | Description                             |
|---------------------|------------------------|-----------------------------------------|
| Backend API         | FastAPI                | High-performance async API framework    |
| Orbit Propagation   | Skyfield, sgp4         | TLE parsing & orbital mechanics         |
| Database            | SQLite (PostgreSQL ready) | Stores satellites + alerts           |
| ORM                 | SQLAlchemy             | Manages DB models + queries             |
| Scheduling          | APScheduler            | Background tasks for periodic updates   |
| Frontend (WIP)      | React + Tailwind       | Collision dashboard & search interface  |
| 3D Visualization    | CesiumJS (Planned)     | Orbit rendering engine                  |

---

## ✅ Completed Features

### 🔧 Backend Setup
- FastAPI app with modular structure
- SQLite + SQLAlchemy ORM
- CORS support for frontend access

### 🛰️ Live TLE Fetching
- Pulls TLEs from Celestrak's active satellite feed
- Stores satellite name, TLE line 1, and TLE line 2
- Skips unnecessary re-fetching via `TLEMetadata` timestamp
- Auto-fetches on app startup
- Re-fetches automatically every 6 hours using APScheduler

### ⚠️ Collision Detection Engine
- Simulates orbits using Skyfield
- Compares ISS against all satellites
- Ignores docked modules (e.g., NAUKA, PROGRESS)
- Stores close approaches in `collision_alerts` table
- Identifies top 5 closest encounters
- Background scans run on startup and periodically

---

## 📂 Project Structure

```
sat-collision-predictor/
├── app/
│   ├── main.py               # FastAPI app + lifespan + scheduler
│   ├── database.py           # DB engine + session
│   ├── models.py             # Satellite + collisionAlert + TLEMetadata
│   ├── tle_fetcher.py        # Fetches & stores TLEs (with 6h cooldown)
│   ├── collision_detector.py # Skyfield-based close approach detector
│   ├── routes/
│   │   ├── collision.py      # /collision endpoint (manual check)
│   │   ├── collisionScan.py  # ISS vs all scan + background insert
│   │   ├── dashboard.py      # /summary, /top-collision endpoints
│   │   ├── orbit.py          # Orbit simulation (coming UI support)
│
├── satellites.db             # Local SQLite DB
├── requirements.txt
├── README.md
```

---

## 🧪 How It Works

### 1. Live TLE Fetching
- TLEs fetched from:  
  `https://celestrak.com/NORAD/elements/gp.php?GROUP=active&FORMAT=tle`
- Each set parsed and inserted or updated
- Fetch skipped if already done within 6 hours
- `TLEMetadata` tracks last fetch timestamp

### 2. Collision Detection
- ISS orbit is simulated using TLE data
- Compared against all satellites except:
  - ISS modules
  - Docked vehicles
  - Objects too far apart in altitude
- Approaches < 100 km are recorded
- Top 5 closest events served to frontend

---

## 🧑‍💻 Getting Started

### 1. Clone & Set Up
```bash
git clone https://github.com/shivarag200701/sat-collision-predictor.git
cd sat-collision-predictor
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run the Server
```bash
uvicorn app.main:app --reload
```

This will:
- Auto-fetch TLEs (if not fetched recently)
- Auto-run ISS collision scan in background
- Start API at: `http://localhost:8000`

---

## 🌐 Key API Endpoints

| Endpoint                        | Description                              |
|----------------------------------|------------------------------------------|
| `/api/summary`                  | Total satellites + last TLE fetch time   |
| `/api/top-collision`           | Top 5 closest approach records           |
| `/api/collision?norad1=...`     | Manual collision check between 2 sats    |
| `/api/collision-scan`           | Runs ISS-vs-all scan and stores alerts   |
| `/api/orbit/{norad_id}`         | Simulates orbit path (24h)               |

---

## 📌 Roadmap

### ✅ Phase 1 – TLE Integration
- Live TLE fetching from CelesTrak  
- Satellite DB population  
- 6-hour cooldown logic  

### ✅ Phase 2 – Collision Detection
- Orbit propagation using Skyfield  
- ISS-vs-all satellite scanning  
- Database alert storage  

### ✅ Phase 3 – Dashboard UI
- Search by NORAD ID  
- Show latest alerts + predictions  
- Add severity badges + filtering  

### ✅ Phase 4 – Orbit Visualizations
- CesiumJS + satellite paths  
- Interactive altitude/time explorer  

---

## 🧠 Concepts Involved

- **TLE (Two-Line Element):** Compact orbital data format  
- **Skyfield:** Computes precise satellite positions over time  
- **Collision Alerts:** Triggered when two orbits come within ~100km  
- **Background Tasks:** Run scan jobs without blocking requests  

---

## ⭐ Star This Repo

If you find this project valuable or interesting, consider giving it a star!  
It helps others discover the project and motivates future work ✨

---

## 📜 License

MIT License. Free to use with credit.
