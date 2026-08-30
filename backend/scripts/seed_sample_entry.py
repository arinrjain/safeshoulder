#!/usr/bin/env python3
"""
Seed a sample story entry into the database for reference
Run: python seed_sample_entry.py
"""

import os
import uuid
from datetime import datetime
from supabase import create_client

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://aovdmocxjglpiokiximn.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_SERVICE_KEY:
    print("Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Sample entry - clearly marked as a reference
SAMPLE_ENTRY = {
    "id": str(uuid.uuid4()),
    "user_id": "sample-reference-entry",  # Special marker
    "title": "[SAMPLE] Overcame My Fear of Speaking Up",
    "content": """This is a sample entry to show you what a great story entry looks like.

**What happened:**
Today in class, I had an idea about our group project but was nervous to share it. Usually, I stay quiet when I'm unsure, but this time I decided to speak up. I raised my hand and explained my idea to the group.

**Why it matters:**
My classmates thought it was a creative approach! Even though I was nervous, I realized my voice matters and that people actually want to hear my perspective.

**What I learned:**
- Speaking up doesn't have to be perfect to be valuable
- People are usually supportive when you share ideas
- My fear of judgment was bigger than the actual risk
- Building confidence happens one small step at a time

**How I felt after:**
Proud, relieved, and more confident. I'm going to keep practicing sharing my ideas.

---
📝 **TIP**: Use this entry as a template for writing your own. Include what happened, why it mattered, what you learned, and how you felt.""",
    "category": "growth",
    "created_at": datetime.utcnow().isoformat(),
    "updated_at": datetime.utcnow().isoformat(),
}

def seed_entry():
    """Insert sample entry into database"""
    try:
        print(f"Seeding sample entry: {SAMPLE_ENTRY['title']}")

        result = supabase.table("story_entries").insert(SAMPLE_ENTRY).execute()

        if result.data:
            print(f"✅ Sample entry created successfully!")
            print(f"   ID: {SAMPLE_ENTRY['id']}")
            print(f"   Title: {SAMPLE_ENTRY['title']}")
            print(f"   Category: {SAMPLE_ENTRY['category']}")
            print(f"\n📌 This entry will appear in the 'Growth & Learning' category")
            print(f"📌 Users can reference this as they write their own entries")
            return True
        else:
            print(f"⚠️  Entry may not have been created properly")
            return False

    except Exception as e:
        print(f"❌ Error seeding entry: {str(e)}")
        return False

if __name__ == "__main__":
    success = seed_entry()
    exit(0 if success else 1)
