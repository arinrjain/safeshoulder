'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TeenHeader } from '@/components/TeenHeader';
import type { ReactNode } from 'react';

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

### iCall (Tata Institute of Social Sciences)
**9152 987 821** (toll-free)
- Teen-friendly crisis counselors
- Confidential and judgment-free
- Available anytime
- Text support also available

### Vandrevala Foundation
**1860-2662-345** (toll-free, pan-India)
- Mental health crisis support
- Trained counselors
- Available anytime
- Free service

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
  },
  "9": {
    title: 'Beating Exam Anxiety',
    category: 'Exam Prep',
    icon: '🎯',
    color: '#10B981',
    content: `
# Beating Exam Anxiety

A racing heart before an exam is normal. When it takes over and blanks your mind, that's exam anxiety — and it's manageable.

## Before the Exam

### Prepare in a Way That Builds Confidence
- Practice under timed conditions, not just re-reading notes
- Do past papers so the format feels familiar
- Study in short, focused sessions over days, not one long cram
- Sleep matters more than one extra hour of revision

### The Night Before
- Do a light review, not a first pass through everything
- Lay out what you need so the morning isn't rushed
- Avoid staying up late "just to be sure" — a tired brain forgets more

## Right Before the Exam

### Calm Your Body First
- Box breathing: in for 4, hold for 4, out for 4, hold for 4
- Unclench your jaw and shoulders — anxiety hides there
- Avoid comparing prep notes with classmates outside the hall, it usually makes things worse

### Reframe the Nerves
- "I'm anxious" and "I'm excited" feel almost identical in the body
- Tell yourself: this feeling means I care, not that I'll fail
- You don't need to feel calm to perform well

## During the Exam

- Skim the whole paper first, answer what you know before the hard ones
- If your mind blanks, move to another question and come back
- Re-read the question if you freeze — often the panic is about the moment, not the content
- Watch the time, but don't let a clock-check spiral into panic

## After the Exam

- Resist the urge to replay every answer with classmates
- One paper doesn't decide the whole outcome
- Do something that resets you — walk, music, food, rest

## When It's More Than Normal Nerves

If exam anxiety causes panic attacks, stops you from sleeping for days beforehand, or makes you avoid studying entirely out of dread, that's worth talking to someone about — a counselor, a trusted adult, or Aisha.

**Nerves mean you care. They don't define how you'll do.**
    `
  },
  "10": {
    title: 'Managing Academic Pressure Without Burning Out',
    category: 'Academic Stress',
    icon: '📚',
    color: '#10B981',
    content: `
# Managing Academic Pressure Without Burning Out

Academic pressure is real — and so is the toll it takes when it never lets up.

## Where the Pressure Comes From

### External
- Parents' expectations, spoken or unspoken
- School rankings, comparisons, competition
- College or career worries that feel far too close

### Internal
- Wanting to prove something to yourself
- Fear of disappointing people who believe in you
- Tying your entire self-worth to grades

Most students carry a mix of both, which is why it feels so heavy.

## Warning Signs of Burnout

- Constant exhaustion, even after sleeping
- Dreading schoolwork you used to be fine with
- Trouble concentrating even when you try hard
- Irritability, headaches, or stomach issues with no clear cause
- Feeling numb about results either way

If several of these sound familiar, it's not laziness — it's burnout, and it needs rest, not more pressure.

## What Actually Helps

### Break the Mountain Into Steps
- Turn "finish the syllabus" into "finish this chapter today"
- Small, finishable goals reduce the dread of starting

### Redefine What Success Looks Like
- One test score is a data point, not a verdict on your future
- Effort and consistency matter more than any single result

### Ask for Help Before You're Drowning
- Teachers would rather help early than see you struggle silently
- Tutoring, study groups, or just asking a friend to explain something isn't a weakness

### Protect Non-Negotiables
- Sleep, food, and some downtime aren't rewards you earn — they're what let you function at all

## Talking to Parents About Pressure

- Lead with how you're feeling, not just what you want changed: "I'm exhausted and anxious, not just being dramatic"
- Suggest a specific ask: fewer tuition hours, one guilt-free evening a week, help figuring out priorities
- If the conversation goes badly the first time, a school counselor can sometimes help translate

## Remember

Your grades are one part of your life, not the whole of your worth. A rough term doesn't erase everything you're capable of.

**You are allowed to rest. You are more than your marks.**
    `
  },
  "11": {
    title: 'How to Say No to Peer Pressure',
    category: 'Peer Pressure',
    icon: '🙅',
    color: '#F59E0B',
    content: `
# How to Say No to Peer Pressure

Saying no to friends can feel scarier than the thing you're being pressured into. Here's how to hold your ground.

## What Peer Pressure Actually Looks Like

### Direct
- "Everyone's doing it, just try it"
- "Don't be boring, come on"
- Being dared or challenged in front of others

### Indirect (harder to spot)
- Feeling like you'll be left out if you don't go along
- Changing how you act just to fit in
- Staying quiet when something feels wrong because no one else is objecting

Both are real pressure, even if only one looks obvious from the outside.

## Why It's Hard to Say No

- Fear of being mocked or excluded
- Not wanting to seem uptight or different
- Genuinely liking the people asking, which makes it feel personal

Knowing why it's hard doesn't make you weak — it makes you human.

## Scripts You Can Actually Use

### Keep It Simple
- "Nah, not my thing"
- "I'm good, but you go ahead"
- No lengthy explanation needed — a clear no is a complete sentence

### The Broken Record
- Repeat the same calm no without escalating, even if they push
- "Still not interested" works just as well the third time as the first

### Blame an Excuse (if you need an easy out)
- "My parents would kill me"
- "I've got practice/an early morning"
- Not always necessary, but useful when you need a quick exit

### The Buddy System
- Agree with a friend beforehand to back each other up
- It's much easier to say no when you're not the only one

## When Peer Pressure Turns Into Bullying

If saying no gets you excluded, mocked, or targeted — that's no longer normal social pressure, it's bullying. That's on them, not you. Check out the bullying resources in this library, or talk to Aisha about what's happening.

## Building Friendships That Don't Require You to Bend

The people worth keeping around are the ones who respect your no the first time. If someone only likes you when you go along with everything, that's not really friendship.

**A real friend doesn't need you to compromise who you are.**
    `
  },
  "12": {
    title: 'Smart Study Habits That Reduce Stress',
    category: 'Study Skills',
    icon: '⏰',
    color: '#10B981',
    content: `
# Smart Study Habits That Reduce Stress

Studying harder isn't always the answer. Studying smarter is what actually reduces the stress.

## Why Cramming Backfires

- Information goes into short-term memory and falls out fast
- Late nights before exams cost you more than they give
- Panic-driven cramming makes recall harder, not easier, under pressure

Cramming can get you through one test. It won't get you through the stress of exam season.

## The Pomodoro Technique

- Study in focused 25-minute blocks, then take a 5-minute break
- After 4 blocks, take a longer 15-30 minute break
- Short bursts with real breaks beat marathon sessions where focus fades after 20 minutes anyway

## Active Recall Beats Re-Reading

- Close the book and try to write down what you remember
- Test yourself with flashcards instead of just re-reading notes
- Struggling to recall something is exactly how your brain strengthens the memory

## Spaced Repetition

- Review material a day later, then a few days later, then a week later
- Spacing it out beats reviewing the same thing five times in one sitting
- This is why starting early — even just 20 minutes a day — beats a single long session

## Building a Realistic Weekly Schedule

- Block out fixed commitments first (school, sleep, meals)
- Assign subjects to specific days instead of vague "study everything" blocks
- Leave at least one buffer day for whatever falls behind
- A schedule you'll actually follow beats an ambitious one you'll abandon by day two

## Protecting Sleep During Exam Season

- Memory consolidation happens during sleep — pulling all-nighters undoes your own revision
- Aim to protect at least 7 hours, especially the night before a big exam
- If you're choosing between one more hour of revision or one more hour of sleep, sleep usually wins

## Remember

Smart, consistent studying beats last-minute panic every time. Progress over perfection.

**Small, steady effort compounds. Give yourself the time to let it work.**
    `
  },
  "13": {
    title: 'Navigating Social Anxiety at School',
    category: 'Social Anxiety',
    icon: '😰',
    color: '#F59E0B',
    content: `
# Navigating Social Anxiety at School

If crowded hallways, group projects, or being called on in class fill you with dread, you're dealing with something real — and very common.

## What Social Anxiety Actually Feels Like

- Racing heart before walking into a room full of people
- Replaying conversations for hours, sure you said something wrong
- Avoiding raising your hand even when you know the answer
- Eating lunch alone to skip the anxiety of finding a seat
- Feeling exhausted after socializing, even when it went fine

It's not shyness you can just "get over." It's your brain treating normal social situations like a threat.

## Small Steps That Actually Help

### Start Smaller Than Feels Necessary
- Say hi to one person instead of trying to "make a new friend"
- Answer one question in class instead of aiming for constant participation
- Small reps build tolerance faster than forcing a big leap

### Prepare Scripts for Common Moments
- "Mind if I sit here?"
- "Can you repeat the question?" (buys you a second to think)
- Having a go-to phrase ready lowers the in-the-moment panic

### Challenge the Mind-Reading
- You can't actually know what people are thinking about you
- Most people are far more focused on themselves than on judging you
- Ask: what would I think if a friend did the thing I'm worried about?

### Ground Yourself Before Triggering Moments
- Box breathing before walking into a crowded hallway
- Name 3 things you can see, 2 you can hear — brings you back to the present
- A few seconds of grounding can prevent a full spiral

## Group Work Specifically

- Ask to take a role that fits you — note-taker, researcher — instead of always presenting
- It's okay to tell a partner "I get nervous presenting, can we split it this way?"
- Practicing your part alone first reduces in-the-moment panic

## After a Hard Social Moment

- Resist replaying it on a loop — set a timer, allow yourself to think about it, then move on
- One awkward moment is rarely as noticeable to others as it feels to you
- Write down what actually happened vs. what your anxiety told you happened — they're often very different

## When to Get More Support

If social anxiety is keeping you home from school, stopping you from eating in front of others, or causing panic attacks, that's worth talking to a counselor or trusted adult about. It's very treatable, and you don't have to white-knuckle through it alone.

**You don't need to feel confident to keep showing up. Showing up is the confidence-building part.**
    `
  }
};

// Parses inline **bold** markers within a line into text + <strong> segments.
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

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
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(1rem, 5vw, 2rem)' }}>
          {/* Header */}
          <div style={{ marginBottom: 'clamp(1.5rem, 5vw, 2rem)' }}>
            <Link href="/teen/resources" style={{ color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
              ← Back to Resources
            </Link>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', display: 'block', marginBottom: '1rem' }}>{resource.icon}</span>
              <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: resource.color, fontWeight: '600', marginBottom: '0.5rem' }}>
                {resource.category}
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 'bold', marginBottom: '1rem', lineHeight: '1.2' }}>{resource.title}</h1>
            </div>
          </div>

          {/* Content */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(1rem, 5vw, 2rem)',
            lineHeight: '1.7',
            fontSize: 'clamp(0.95rem, 2vw, 1rem)',
          }}>
            {(() => {
              let titleSkipped = false;
              const lines = resource.content.split('\n');
              const elements: ReactNode[] = [];
              let listBuffer: string[] = [];

              const flushList = (key: string | number) => {
                if (listBuffer.length === 0) return;
                elements.push(
                  <ul key={`ul-${key}`} style={{ marginBottom: 'clamp(0.75rem, 2vw, 1rem)', paddingLeft: '1.25rem', color: 'var(--color-text)', listStyleType: 'disc' }}>
                    {listBuffer.map((item, i) => (
                      <li key={i} style={{ marginBottom: '0.35rem' }}>{renderInline(item)}</li>
                    ))}
                  </ul>
                );
                listBuffer = [];
              };

              lines.forEach((paragraph: string, idx: number) => {
                // Skip the first heading if it matches the resource title
                if (!titleSkipped && paragraph.startsWith('# ') && paragraph.replace(/^#\s/, '') === resource.title) {
                  titleSkipped = true;
                  return;
                }
                if (paragraph.startsWith('- ')) {
                  listBuffer.push(paragraph.replace(/^- /, ''));
                  return;
                }
                flushList(idx);
                if (paragraph.startsWith('#')) {
                  const level = paragraph.match(/^#+/)?.[0].length || 1;
                  const text = paragraph.replace(/^#+\s/, '');
                  const sizes = ['clamp(1.25rem, 4vw, 2rem)', 'clamp(1.1rem, 3vw, 1.75rem)', 'clamp(1rem, 2.5vw, 1.5rem)', 'clamp(0.9rem, 2vw, 1.25rem)'];
                  elements.push(
                    <h2 key={idx} style={{ fontSize: sizes[level - 2] || 'clamp(0.9rem, 2vw, 1.25rem)', fontWeight: 'bold', marginTop: 'clamp(1rem, 3vw, 2rem)', marginBottom: 'clamp(0.75rem, 2vw, 1rem)', color: 'var(--color-text)', lineHeight: '1.2' }}>
                      {text}
                    </h2>
                  );
                } else if (paragraph.trim()) {
                  elements.push(
                    <p key={idx} style={{ marginBottom: 'clamp(0.75rem, 2vw, 1rem)', color: 'var(--color-text)' }}>
                      {renderInline(paragraph)}
                    </p>
                  );
                }
              });
              flushList('end');
              return elements;
            })()}
          </div>

          {/* CTA */}
          <div style={{ marginTop: 'clamp(1.5rem, 5vw, 2rem)', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
              Need someone to talk to? Aisha is here 24/7
            </p>
            <Link
              href="/teen/support"
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 5vw, 2rem)',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
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
