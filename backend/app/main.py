import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.seed_data import seed_db
from app.routers import auth, tables, menu, bookings, celebrations, orders, feedback, reports, loyalty

# Ensure database tables created and seeded
seed_db()

app = FastAPI(
    title="Maitri Cafe Operating System API",
    description="Full-stack Cafe Management, Table Ordering, Booking & Analytics Backend",
    version="1.0.0",
)

# Comma-separated origins, e.g. https://maitri.vercel.app,http://localhost:5173
_origins = os.getenv("ALLOWED_ORIGINS", "*").strip()
allow_origins = [o.strip() for o in _origins.split(",") if o.strip()] if _origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tables.router)
app.include_router(menu.router)
app.include_router(bookings.router)
app.include_router(celebrations.router)
app.include_router(orders.router)
app.include_router(feedback.router)
app.include_router(reports.router)
app.include_router(loyalty.router)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Maitri Cafe OS Backend API",
        "docs_url": "/docs",
        "status": "online",
    }


@app.get("/health")
def health():
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
