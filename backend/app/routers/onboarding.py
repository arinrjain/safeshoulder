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

        profile_data = {
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
        }

        # Always use upsert (most reliable)
        print(f"📝 Upserting user {user_id} with domain={req.domain}")
        result = supabase.table("users").upsert(profile_data).execute()

        if result.data:
            saved = result.data[0]
            print(f"✅ User saved: domain={saved.get('domain')}")
            saved_domain = saved.get("domain")
        else:
            print(f"⚠️ Upsert returned no data")
            saved_domain = None

        # Save domain-specific profile
        domain_data = {
            "user_id": user_id,
            "domain": req.domain,
            "situation": req.domain_profile.situation,
            "duration": req.domain_profile.duration,
            "severity": req.domain_profile.severity,
            "impact": req.domain_profile.impact,
            "support_type": req.domain_profile.support_type,
            "goals": req.domain_profile.goals,
        }

        # Use upsert for domain profile
        print(f"📝 Upserting domain profile for {req.domain}")
        result = supabase.table("user_domain_profiles").upsert(domain_data).execute()

        if result.data:
            print(f"✅ Domain profile saved for {req.domain}")
        else:
            print(f"⚠️ Domain profile upsert returned no data")

        return {
            "message": "Onboarding completed successfully",
            "user_id": user_id,
            "domain": req.domain,
            "saved_domain": saved_domain,
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Onboarding error: {error_msg}")
