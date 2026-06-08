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

        # Try to create user if doesn't exist, otherwise update
        # First try insert (will fail if exists)
        try:
            result = supabase.table("users").insert(profile_data).execute()
            print(f"✅ User inserted: {user_id}")
        except Exception as insert_err:
            # If insert fails, user exists - do update instead
            print(f"⚠️ Insert failed (user probably exists): {insert_err}")
            result = supabase.table("users").update(profile_data).eq("id", user_id).execute()
            print(f"✅ User updated: {user_id}")

        # Verify domain was saved
        verify = supabase.table("users").select("domain").eq("id", user_id).single().execute()
        saved_domain = verify.data.get("domain") if verify.data else None
        print(f"Domain verify: requested={req.domain}, saved={saved_domain}")

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

        # Try insert first, then update
        try:
            result = supabase.table("user_domain_profiles").insert(domain_data).execute()
            print(f"✅ Domain profile inserted for {req.domain}")
        except Exception as insert_err:
            # If insert fails, record exists - do update instead
            print(f"⚠️ Domain profile insert failed: {insert_err}")
            result = supabase.table("user_domain_profiles").update(domain_data).eq("user_id", user_id).eq("domain", req.domain).execute()
            print(f"✅ Domain profile updated for {req.domain}")

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
