# Sample Story Entry Guide

## Overview

A **sample story entry** has been created to help users understand how to write meaningful journal entries on SafeShoulder. This entry demonstrates best practices for capturing experiences, emotions, and growth.

---

## The Sample Entry

### Title
**[SAMPLE] Overcame My Fear of Speaking Up**

### Category
**Growth & Learning** 🌱

### Content Structure

The sample entry demonstrates a proven structure for writing powerful story entries:

1. **What Happened** - Describe the situation
2. **Why It Matters** - Explain the significance
3. **What I Learned** - Reflect on insights gained
4. **How I Felt After** - Capture your emotions

---

## Sample Entry in Full

```
This is a sample entry to show you what a great story entry looks like.

**What happened:**
Today in class, I had an idea about our group project but was nervous to share it. 
Usually, I stay quiet when I'm unsure, but this time I decided to speak up. I raised 
my hand and explained my idea to the group.

**Why it matters:**
My classmates thought it was a creative approach! Even though I was nervous, I realized 
my voice matters and that people actually want to hear my perspective.

**What I learned:**
- Speaking up doesn't have to be perfect to be valuable
- People are usually supportive when you share ideas
- My fear of judgment was bigger than the actual risk
- Building confidence happens one small step at a time

**How I felt after:**
Proud, relieved, and more confident. I'm going to keep practicing sharing my ideas.

---
📝 **TIP**: Use this entry as a template for writing your own. Include what happened, 
why it mattered, what you learned, and how you felt.
```

---

## Using the Sample Entry

### For New Users
- Users will see this entry as a reference when they first access the Story page
- It shows the recommended structure for meaningful entries
- Users can use it as a template for writing their own

### For Teachers
- Can reference this entry when teaching students how to use SafeShoulder
- Shows what reflective, growth-oriented writing looks like
- Demonstrates all three entry types (growth, win, bullying)

### Customization
Users should replace the sample content with their own:
- Their own experiences and stories
- Their own emotions and reflections
- Their own learnings and growth

---

## Entry Types

The sample uses **Growth & Learning**, but students can create entries in all three categories:

### 🌱 Growth & Learning
Entries about overcoming challenges, learning new skills, personal development

**Example**: "I asked for help when I didn't understand the math homework"

### 🌟 Win & Celebration
Entries celebrating achievements, successes, positive moments

**Example**: "I got an A on my presentation!"

### 😢 Bullying Experience
Entries about difficult social situations, conflicts, bullying incidents (for processing with support)

**Example**: "Someone said mean things to me at lunch today"

---

## Best Practices for Writing Entries

Based on the sample entry, here are tips for strong journal entries:

✅ **Do:**
- Be specific about what happened
- Include your feelings and emotions
- Reflect on what you learned
- Use bullet points for clarity
- Be honest and authentic

❌ **Don't:**
- Leave entries too vague
- Skip the reflection part
- Worry about perfect grammar
- Judge your own experiences
- Feel you need to share everything

---

## Sample Entry Technical Details

| Field | Value |
|-------|-------|
| **ID** | UUID (auto-generated) |
| **User ID** | `sample-reference-entry` (marked as reference) |
| **Title** | [SAMPLE] Overcame My Fear of Speaking Up |
| **Category** | growth |
| **Created** | When seeded |
| **Purpose** | Reference for users |

---

## How to Seed the Sample Entry

### Automatic (Recommended)
```bash
cd backend
python scripts/seed_sample_entry.py
```

### Manual SQL
```sql
INSERT INTO public.story_entries (
  id, user_id, title, content, category, created_at, updated_at
) VALUES (
  'uuid-here',
  'sample-reference-entry',
  '[SAMPLE] Overcame My Fear of Speaking Up',
  'content-here',
  'growth',
  NOW(),
  NOW()
);
```

### Via Backend API
The backend can expose a `/admin/seed-sample` endpoint for admin users

---

## Visibility & Access

| User Type | Can See | Can Edit | Can Delete |
|-----------|---------|----------|-----------|
| Student | Yes | No | No |
| Teacher | Yes | No | No |
| Admin | Yes | Yes | Yes |

---

## Future Enhancements

- [ ] Create samples for each category (growth, win, bullying)
- [ ] Add multilingual sample entries
- [ ] Create age-specific samples (elementary, middle, high school)
- [ ] Add video tutorials using this entry
- [ ] Track how often users reference this entry

---

## Key Message

**This sample entry is not a prescription—it's an example.**

Every student's journey is unique. Use this entry as inspiration, but write about YOUR experiences, YOUR feelings, and YOUR growth. Your story matters.

---

*Sample Entry Guide - SafeShoulder Story Feature*
