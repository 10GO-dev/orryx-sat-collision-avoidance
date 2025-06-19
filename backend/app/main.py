from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import database, models
from app.routes import collision, collisionScan, dashboard, orbit, topCollision
from app.tle_fetcher import fetch_and_store_tles

# 🔧 Create tables if they don't exist
models.Base.metadata.create_all(bind=database.engine)

# 🛰️ Setup scheduler
scheduler = BackgroundScheduler()


def start_tle_scheduler():
    # Avoid duplicate jobs on reload
    if not scheduler.get_job("tle-fetch"):
        scheduler.add_job(fetch_and_store_tles, "interval", hours=6, id="tle-fetch")
        print("🔁 Scheduled TLE fetch every 6 hours.")
    scheduler.start()


# 🚀 FastAPI's lifespan handler (replaces @on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🟢 App starting up...")

    # Fetch TLEs on startup (respects 6-hour skip logic)
    fetch_and_store_tles()

    # Start 6-hour repeating TLE fetch job
    start_tle_scheduler()

    yield  # app runs after this

    # 🔻 Optional: Shutdown logic
    print("🛑 App shutting down...")
    scheduler.shutdown()


# 🧠 Create FastAPI app
app = FastAPI(lifespan=lifespan)

# 🌐 CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # adjust for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔌 Register routers
app.include_router(orbit.router, prefix="/api")
app.include_router(collision.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(collisionScan.router, prefix="/api")
app.include_router(topCollision.router, prefix="/api")
