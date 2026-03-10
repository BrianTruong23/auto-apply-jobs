from fastapi import APIRouter

from app.api.routes import answers, applications, health, jobs, profile, runs, sources, sync

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(sources.router, prefix="/sources", tags=["sources"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(answers.router, prefix="/answers", tags=["answers"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(sync.router, prefix="/sync", tags=["sync"])
api_router.include_router(runs.router, prefix="/runs", tags=["runs"])
