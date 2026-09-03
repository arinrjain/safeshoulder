"""
Schemas for user stress profiles extracted from conversations.
These are built over time, not collected upfront in forms.
"""

from typing import Optional, List
from pydantic import BaseModel


class StressProfile(BaseModel):
    """Generic stress profile structure."""
    intensity: Optional[int] = None  # 1-5 scale
    main_stressors: Optional[List[str]] = None  # Selected from options
    impact_level: Optional[str] = None  # Frequency or severity
    last_updated: Optional[str] = None  # ISO timestamp


class AcademicStressProfile(StressProfile):
    """Academic-specific stress profile."""
    stressor_keywords: Optional[List[str]] = None  # JEE, exams, grades, etc.
    pressure_level: Optional[int] = None  # 1-5
    burnout_frequency: Optional[str] = None  # Everyday, Few times/week, etc.
    sleep_hours: Optional[str] = None  # <4, 5-6, 7-9, >9
    mental_well_being_impact: Optional[str] = None  # Frequently, Sometimes, etc.


class RelationshipStressProfile(StressProfile):
    """Relationship-specific stress profile."""
    time_since_event: Optional[str] = None  # Days, weeks, months, years ago
    contact_urge_strength: Optional[str] = None  # Very strong to None
    relationship_type: Optional[str] = None  # Dating, married, ex, crush


class FamilyStressProfile(StressProfile):
    """Family-specific stress profile."""
    family_closeness: Optional[str] = None  # Very close to Estranged
    abuse_concern: Optional[bool] = None  # Safety flag
    support_source: Optional[str] = None  # Whether family is support or source


class FinancialStressProfile(StressProfile):
    """Financial-specific stress profile."""
    support_system: Optional[str] = None  # Has support, some, none, solo
    income_stability: Optional[str] = None  # Stable, variable, job loss


class WorkplaceStressProfile(StressProfile):
    """Workplace-specific stress profile."""
    burnout_level: Optional[str] = None  # Severe, Moderate, Mild, Not yet, No
    job_satisfaction: Optional[int] = None  # 1-5


class BodyImageStressProfile(StressProfile):
    """Body image-specific stress profile."""
    focus_areas: Optional[List[str]] = None  # Weight, skin, height, etc.
    behavioral_impact: Optional[List[str]] = None  # Social, dating, eating, etc.


# Map domains to their profile schemas
DOMAIN_PROFILE_SCHEMAS = {
    "school_bullying": AcademicStressProfile,
    "academic": AcademicStressProfile,
    "heartbreak": RelationshipStressProfile,
    "relationship_issues": RelationshipStressProfile,
    "domestic": FamilyStressProfile,
    "financial": FinancialStressProfile,
    "workplace": WorkplaceStressProfile,
    "body_image": BodyImageStressProfile,
}


def get_profile_schema(domain: str):
    """Get the appropriate profile schema for a domain."""
    return DOMAIN_PROFILE_SCHEMAS.get(domain, StressProfile)
