"""Onboarding endpoints for profile setup."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.middleware.auth import get_current_user
from app.config import settings
from supabase import create_client
from typing import Optional

router = APIRouter(prefix="/onboarding", tags=["onboarding"])
supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


class GlobalProfile(BaseModel):
    name: str
    age_range: str
    gender: str
    previous_therapy: str
    current_support: str
    profession: str
    city: str
    interests: str
    spirituality: str
    relationship_status: str
    has_kids: str
    family_info: str


class DomainProfile(BaseModel):
    situation: str
    duration: str
    severity: int
    impact: list
    support_type: str
    goals: str


class OnboardingRequest(BaseModel):
    domain: str
    global_profile: GlobalProfile
    domain_profile: DomainProfile


@router.post("/complete")
def complete_onboarding(
    req: OnboardingRequest,
    user: dict = Depends(get_current_user)
):
    """Complete user onboarding - save global and domain profiles."""
    try:
        user_id = user["user_id"]
        email = user["email"]

        # Save global profile (upsert - create if doesn't exist)
        user_result = supabase.table("users").upsert(
            {
                "id": user_id,
                "email": email,
                "name": req.global_profile.name,
                "age_range": req.global_profile.age_range,
                "gender": req.global_profile.gender,
                "previous_therapy": req.global_profile.previous_therapy,
                "current_support": req.global_profile.current_support,
                "profession": req.global_profile.profession,
                "city": req.global_profile.city,
                "interests": req.global_profile.interests,
                "spirituality": req.global_profile.spirituality,
                "relationship_status": req.global_profile.relationship_status,
                "has_kids": req.global_profile.has_kids,
                "family_info": req.global_profile.family_info,
                "domain": req.domain,
            },
            { "onConflict": "id" }
        ).execute()

        if not user_result.data:
            raise HTTPException(status_code=400, detail="Failed to save global profile")

        # Save domain-specific profile
        domain_result = supabase.table("user_domain_profiles").upsert(
            {
                "user_id": user_id,
                "domain": req.domain,
                "situation": req.domain_profile.situation,
                "duration": req.domain_profile.duration,
                "severity": req.domain_profile.severity,
                "impact": req.domain_profile.impact,
                "support_type": req.domain_profile.support_type,
                "goals": req.domain_profile.goals,
            },
            { "onConflict": "user_id,domain" }
        ).execute()

        if not domain_result.data:
            raise HTTPException(status_code=400, detail="Failed to save domain profile")

        return {
            "message": "Onboarding completed successfully",
            "user_id": user_id,
            "domain": req.domain,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Onboarding error: {str(e)}")
