'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TeenHeader } from '@/components/TeenHeader';

const resources: Record<string, any> = {
  "1": {
    title: 'How to Handle Cyberbullying',
    category: 'Coping Strategies',
    icon: '💪',
    color: '#06B6D4',
    content: `
# How to Handle Cyberbullying

Cyberbullying can feel relentless because it follows you home. Unlike school bullying, online harassment doesn't stop at the bell—it's 24/7. Here's how to take back control.

## Immediate Steps

### 1. Document Everything
- Screenshot comments, messages, or posts (including timestamps)
- Save everything, even if it seems minor
- Build evidence for reporting

### 2. Don't Respond
- Never reply to cyberbullies
- Engaging feeds the behavior
- Your silence removes their power

### 3. Use Platform Tools
- Block the person on all platforms
- Report the content to the app
- Most platforms have anti-harassment policies
- Use "restrict" features to limit what they see

## Who to Tell

- **Parents/guardians** - They can help strategize and provide support
- **School counselor** - If it involves school-connected people
- **Platform support team** - Report violations directly
- **Police** - If threats are serious or criminal

## Protect Your Digital Space

- Set accounts to private
- Review privacy settings across all platforms
- Unfollow/mute accounts that stress you
- Turn off comments on posts
- Don't share personal details with people you don't know

## The Emotional Side

- Remind yourself: Their words aren't truth
- Talk to someone you trust
- Take breaks from social media
- Focus on relationships that matter
- Practice self-care daily

Remember: Cyberbullying says something about THEM, not about you.
    `
  },
  "2": {
    title: '10 Coping Strategies That Actually Work',
    category: 'Coping Strategies',
    icon: '🧠',
    color: '#06B6D4',
    content: `
# 10 Coping Strategies That Actually Work

When stress piles up, these evidence-based techniques can help you regain control.

## Immediate Relief (Use When Overwhelmed)

### 1. Box Breathing (4-4-4-4)
- Breathe in for 4 counts
- Hold for 4 counts
- Breathe out for 4 counts
- Hold for 4 counts
- Repeat 5 times
Takes 2 minutes and calms your nervous system.

### 2. 5-4-3-2-1 Grounding
- Name 5 things you see
- 4 things you can touch
- 3 things you hear
- 2 things you smell
- 1 thing you taste
Brings you back to the present moment.

### 3. Cold Water Splash
- Splash your face with cold water
- Or hold ice cubes in your hand
- Activates your calm-down response
- Works in 30 seconds

## Build Resilience (Daily Practices)

### 4. Movement (20 minutes)
- Walk, dance, run, swim
- Releases stress chemicals
- Improves mood
- Sleep becomes easier

### 5. Creative Expression
- Draw, write, paint, music
- No judgment needed
- Processes emotions
- Builds confidence

### 6. Time in Nature
- 15-30 minutes outside
- Reduces stress hormones
- Clears your mind
- Improves mood

### 7. Connect with People
- Talk to someone you trust
- Share what's bothering you
- Feel less alone
- Get different perspectives

## Reframe Your Thinking

### 8. Thought Records (CBT)
When you catch a negative thought:
- Write the situation
- Write the thought
- Write evidence against it
- Replace with realistic thought

### 9. Progressive Muscle Relaxation
- Tense muscles for 5 seconds
- Release and notice the difference
- Start with toes, move up
- Reduces physical tension

### 10. Gratitude Practice
- Write 3 things you're grateful for daily
- Shifts focus to good things
- Rewires your brain
- Improves mood long-term

## Remember

Different strategies work for different people. Try all 10 and keep the ones that help YOU.
    `
  },
  "3": {
    title: 'Why Do Bullies Bully?',
    category: 'Understanding',
    icon: '🤔',
    color: '#7C3AED',
    content: `
# Why Do Bullies Bully?

Understanding the motivation behind bullying doesn't excuse it—but it can help you stop taking it personally.

## Common Reasons People Bully

### 1. They're Hurting Too
- Often bullies have difficult home lives
- They're experiencing abuse themselves
- Lashing out is how they cope
- Doesn't excuse their behavior, but explains it

### 2. They're Insecure
- Put others down to feel superior
- Threatened by your confidence
- Jealous of something you have
- Targeting you makes them feel powerful

### 3. They Want Acceptance
- Bully to fit into a group
- Following the "popular kids"
- Seeking status or respect
- Peer pressure drives behavior

### 4. They Lack Empathy
- Haven't developed the ability to understand others' feelings
- Think only about themselves
- Don't realize the impact of their words
- Sometimes this is developmental, sometimes deeper

### 5. They Enjoy Power
- Bullying makes them feel in control
- In their own life, they feel powerless
- Controlling others feels good
- Especially online where there's distance

### 6. They're Copying What They Learned
- Saw bullying at home
- Think it's normal behavior
- Learned aggression from their environment
- Repeating patterns

## What This Means for YOU

**Their reasons are NOT your fault.**

You didn't cause their pain. You didn't make them insecure. You're not responsible for their choices.

The truth: It's about THEM, not YOU.

## How This Helps

Understanding doesn't mean forgiving. It means:
- Not taking it personally (easier said than done, we know)
- Recognizing it says nothing about your worth
- Being able to set boundaries calmly
- Potentially helping them get help
    `
  },
  "4": {
    title: 'How to Talk to Your Parents About Bullying',
    category: 'Communication',
    icon: '💬',
    color: '#EC4899',
    content: `
# How to Talk to Your Parents About Bullying

Telling a parent can feel scary. Here's how to have the conversation.

## Before You Talk

- Pick a calm time (not when they're stressed)
- Plan what you want to say
- Decide what help you need
- Write it down if that helps

## The Conversation

### Start Simple
"I need to talk to you about something serious that's been happening at school."

### Give Specific Details
- Who is bullying you
- What they say/do
- When it happens
- How it makes you feel
- How long it's been going on

### Say How It's Affecting You
- "I'm having trouble sleeping"
- "I'm anxious about going to school"
- "My grades are dropping"
- "I feel alone"

### Be Clear About What You Need
- Do you want them to contact the school?
- Do you want emotional support?
- Do you want help making a safety plan?
- Do you want privacy while you handle it?

## If They Don't Respond Well

Some parents minimize, blame, or deny. If that happens:

- Try again with a different adult (teacher, counselor, trusted family member)
- Write them a letter if talking is hard
- Show them resources
- Be patient but persistent

## What Not to Do

- Don't blame yourself
- Don't hide it to protect them
- Don't expect them to fix it overnight
- Don't give up if they're slow to understand

## They Care

Most parents want to help. Sometimes they just need time to understand how serious it is.

You deserve support. Keep asking until you get it.
    `
  },
  "5": {
    title: 'Know Your School\'s Anti-Bullying Policy',
    category: 'Rights & Policies',
    icon: '📋',
    color: '#06B6D4',
    content: `
# Know Your School's Anti-Bullying Policy

Your school has a legal obligation to protect you. Here's how to use it.

## Find Your School's Policy

- Check the school website
- Ask guidance counselor
- Look in student handbook
- Request from principal's office

## What It Should Include

- Definition of bullying
- Reporting procedures
- Investigation process
- Consequences for bullies
- Student protections
- Appeal process

## Your Rights

### You Have the Right To:
- A safe learning environment
- Report bullying without retaliation
- Have the school investigate
- Know the outcome
- Appeal if not satisfied
- Privacy during the process

### The School Must:
- Take reports seriously
- Investigate promptly (usually 5-10 days)
- Protect you from retaliation
- Document everything
- Involve parents/guardians
- Follow their own policy

## How to Report

### To Your School:
1. Talk to teacher, counselor, or principal
2. Submit written report (keep a copy)
3. Email is good (creates a record)
4. Include: what, who, when, where, witnesses

### If School Doesn't Act:
1. Request meeting with principal
2. Bring parent/guardian
3. Provide written report
4. Ask for timeline on investigation
5. Document everything in writing

### Escalate If Needed:
- District superintendent
- School board
- Department of Education
- Legal action (with parent)

## Document Everything

Keep a "bullying journal":
- Date and time
- What happened
- Who saw it
- How you felt
- Your response

This is gold if you need to escalate.

## You're Protected

Most schools have anti-retaliation policies. You cannot be punished for reporting bullying.

If retaliation happens, report that too. Schools take this very seriously.

**Know your rights. Use them.**
    `
  },
  "6": {
    title: 'Building Your Support Network',
    category: 'Support Network',
    icon: '👥',
    color: '#EC4899',
    content: `
# Building Your Support Network

You don't have to handle this alone. Here's how to build your safety circle.

## Types of Support You Need

### Emotional Support
- People who listen without judgment
- People who believe you
- People who make you feel less alone

### Practical Support
- Adults who can help (parents, teachers, counselors)
- People who can help with safety planning
- People who understand systems (school, legal, etc.)

### Peer Support
- Friends who have your back
- People going through similar things
- People you can just be yourself around

## Who to Include

### Adults
- Parent/guardian (if safe)
- Trusted teacher
- School counselor
- Coach or mentor
- Relative you trust
- Therapist/counselor

### Peers
- Close friends (quality over quantity)
- People with similar values
- Online communities (supportive ones)
- Peer support groups

### Professional
- School counselor
- Therapist
- Crisis helpline
- Online support communities

## How to Build It

### Be Honest
- Tell people what's happening
- Say what help you need
- Ask for what you want
- Be specific

### Give Reciprocal Support
- Support others too
- Listen when they need you
- Be reliable and trustworthy
- Show up for them

### Maintain Relationships
- Spend time with supportive people
- Check in regularly
- Thank them for their support
- Keep nurturing the connection

### Recognize Red Flags
- People who blame you for bullying
- People who minimize your experience
- People who betray your trust
- People who make you feel worse

## Start Small

You don't need 10 supporters. 2-3 solid people can change everything.

**Quality over quantity. Always.**

## Remember

Asking for help is strength, not weakness.

You deserve a network of people who have your back.
    `
  },
  "7": {
    title: 'Self-Care When You\'re Under Stress',
    category: 'Self-Care',
    icon: '🧘',
    color: '#7C3AED',
    content: `
# Self-Care When You're Under Stress

Self-care isn't selfish. It's how you survive and thrive.

## Daily Non-Negotiables

### Sleep (7-9 hours)
- Stress steals sleep. Sleep heals stress.
- No screens 1 hour before bed
- Keep consistent sleep schedule
- Dark, cool room

### Eat Decent Food
- Stress makes eating hard, but eat anyway
- Focus on fuel, not perfection
- Protein helps stabilize mood
- Hydrate (most people don't drink enough water)

### Move Your Body
- 20 minutes of movement daily
- Walk, dance, stretch, anything
- Releases stress chemicals
- Improves sleep and mood

### Connect with Someone
- Text a friend
- Call a family member
- Sit near someone
- Even 5 minutes counts

## When Stress Peaks

### Quick Wins (5 minutes)
- Take a shower
- Step outside
- Listen to a song
- Journal your feelings
- Do breathing exercises

### Medium Resets (30 minutes)
- Go for a walk
- Do yoga or stretching
- Create something
- Watch something you love
- Take a bath

### Deep Resets (1-2 hours)
- Spend time in nature
- Do a hobby you love
- Hang out with a friend
- Sleep
- Unplug from everything

## Protect Your Mental Space

### Reduce Triggers
- Limit social media
- Mute/unfollow accounts that stress you
- Avoid the bully when possible
- Create calm spaces

### Set Boundaries
- Say no to things
- Protect your time
- Limit news/negativity
- Protect your energy

### Celebrate Small Wins
- You got through the day? WIN
- You asked for help? WIN
- You had one good moment? WIN
- You're still here? HUGE WIN

## Permission to Rest

Stress is exhausting. You don't have to be productive or perfect.

**Rest is productive.**

**Surviving is enough.**

**You're doing better than you think.**
    `
  },
  "8": {
    title: 'Crisis Helplines & Emergency Support',
    category: 'Crisis Support',
    icon: '🆘',
    color: '#EC4899',
    isCrisis: true,
    content: `
# Crisis Helplines & Emergency Support

If you're having thoughts of self-harm or suicide, you're not alone. Help is available right now.

## In India - Call 24/7

### iCall
**9152 987 821** (toll-free)
- Teen-friendly crisis counselors
- Confidential and judgment-free
- Available anytime
- Text support also available

### AASRA
**9820 466 726**
- Crisis intervention
- Emotional support counseling
- 24/7 availability
- Confidential

### Vandrevala Foundation
**9999 666 555** (Mumbai area)
- Mental health crisis support
- Trained counselors
- Available anytime
- Free service

### SABERA (Bangalore)
**080 65000111**
- Emotional distress support
- Confidential counseling
- 3 PM - Midnight

## Crisis Hotline Tips

- It's okay to call even if you're not sure
- You can be anonymous
- They've heard it before, no judgment
- They can help you make a plan
- Calling doesn't mean hospitalization (unless you want it)

## Warning Signs You Should Call

- Thoughts of suicide
- Wanting to hurt yourself
- Feeling like nothing matters
- Plan or method in mind
- Feeling completely hopeless
- Hearing voices
- In unbearable emotional pain

## What Happens When You Call

1. Someone trained will answer
2. They'll listen to you
3. They'll help you feel safe
4. They'll help make a plan
5. They'll give resources
6. You can call back anytime

## What to Tell Them

- How you're feeling
- What triggered this
- What you've tried
- What's helped before
- What you need right now

## After the Crisis

- Tell a trusted adult
- Make a safety plan
- Keep numbers programmed
- Go to therapy/counseling
- Be patient with yourself
- Recovery is possible

## Know This

- This feeling will pass
- You deserve to feel better
- Asking for help is brave
- Your life has value
- There are people who care
- It gets better - for real

**You matter. Call.**
    `
  }
};

export default function ResourceDetailPage() {
  const params = useParams();
  const resource = resources[params.id as string];

  if (!resource) {
    return (
      <>
        <TeenHeader />
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text)' }}>
          <p>Resource not found.</p>
          <Link href="/teen/resources" style={{ color: 'var(--color-primary)' }}>
            ← Back to Resources
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <TeenHeader />
      <div style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', minHeight: '100vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <Link href="/teen/resources" style={{ color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
              ← Back to Resources
            </Link>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>{resource.icon}</span>
              <div style={{ fontSize: '0.875rem', color: resource.color, fontWeight: '600', marginBottom: '0.5rem' }}>
                {resource.category}
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{resource.title}</h1>
            </div>
          </div>

          {/* Content */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            lineHeight: '1.8',
            fontSize: '1.1rem',
          }}>
            {resource.content.split('\n').map((paragraph: string, idx: number) => {
              if (paragraph.startsWith('#')) {
                const level = paragraph.match(/^#+/)?.[0].length || 1;
                const text = paragraph.replace(/^#+\s/, '');
                const sizes = ['3rem', '2rem', '1.75rem', '1.5rem'];
                return (
                  <h2 key={idx} style={{ fontSize: sizes[level - 1] || '1.25rem', fontWeight: 'bold', marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
                    {text}
                  </h2>
                );
              } else if (paragraph.trim()) {
                return (
                  <p key={idx} style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>
                    {paragraph}
                  </p>
                );
              }
              return null;
            })}
          </div>

          {/* CTA */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              Need someone to talk to? Aisha is here 24/7
            </p>
            <Link
              href="/teen/support"
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Chat with Aisha →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
