Quiz flow to replace the current questions, keep the same design, and this is going to be the new flow, keep the progress bar and everything like that. 

This is meant to update everything in the quiz wizard screen

1. What drives you?
Proving people wrong
Becoming the best version of myself
Winning and dominating
Pushing past limits
Fear of failure
Making the most of my potential

2. How do you respond to failure or a bad performance?
Replay it obsessively
Blame myself
Move on quickly
Shut down emotionally
Use it as motivation
Analyze it and learn


3. How is your mindset throughout the week?
Locked in every day
Mostly consistent with some dips
Good during training, but not under pressure
Up and down depending on how I feel
Inconsistent and unpredictable
I haven't really thought about it


4. How do you prepare mentally before a big moment?
I follow a mental routine
I try to calm myself but struggle
I get hyped but sometimes overdo it
I visualize success
I try to stay loose and relaxed
I just wing it


5. How do you currently handle stress or pressure?
I ignore it and push through
I vent or distract myself
I overthink and get stuck in my head
I use breathing or meditation
I reflect and try to learn from it
I don't handle it well at all

6. What's one thing your best performances have in common?
I felt calm and in control
I believed in myself
I stayed focused the entire time
I was loose and confident
I had a strong routine leading up to it
I didn't overthink


7. If you could upgrade just one part of your mindset, what would it be?
Confidence under pressure
Ability to stay focused
Letting go of mistakes faster
Consistent motivation
Emotional control
Belief in myself

8. Are you ready to train your mind and take yourself to the next level?
Yes, I'm fully committed
I'm ready to build consistency
I want to see what's possible
I'm curious but unsure
Not yet, improving isn't important


9. Are you willing to put in 7 minutes a day to train the one muscle that controls everything else — your mind?
Yes, fully committed
7 Minutes is too much

Reviews page: use the quizreviewscreen


// 🎯 GOAL: Build a personalized quiz result generator for an athlete mindset quiz.
// The result includes:
// - A mindset profile title (based on Q4)
// - A stat sentence (generic or mapped to profile)
// - A motivational sentence combining:
//     → Q1: What drives you
//     → Q8: What mindset area they'd improve
//     → Q6: What their best performances have in common

// 🧠 Step 1: Map Q4 (How do you prepare mentally?) to a mindset profile title:
const profileTitleMap: Record<string, string> = {
  "I follow a mental routine": "The Locked-In Leader",
  "I try to calm myself but struggle": "The Wired-But-Wavering",
  "I get hyped but sometimes overdo it": "The High-Intensity Hustler",
  "I visualize success": "The Mental Mapper",
  "I try to stay loose and relaxed": "The Flow-Seeker",
  "I just wing it": "The Freestyle Performer"
};

// 📊 Step 2: Map Q1 (What drives you?) to a natural-sounding trait phrase:
const driveMap: Record<string, string> = {
  "Proving people wrong": "a hunger to prove others wrong",
  "Becoming the best version of myself": "a drive to grow and evolve",
  "Winning and dominating": "a competitive fire",
  "Pushing past limits": "a desire to test your limits",
  "Fear of failure": "the pressure of not falling short",
  "Making the most of my potential": "a deep sense of untapped potential"
};

// 🚀 Step 3: Map Q6 (Best performance trait) to a motivational outcome:
const performanceMap: Record<string, string> = {
  "I felt calm and in control": "stay composed and sharp",
  "I believed in myself": "trust yourself more often",
  "I stayed focused the entire time": "build laser focus",
  "I was loose and confident": "stay relaxed under pressure",
  "I had a strong routine leading up to it": "build powerful habits",
  "I didn't overthink": "compete with clarity"
};

// 🛠️ Step 4: Combine everything into a final result generator:
function generateQuizResult(answers: Record<string, string>) {
  const profileTitle = profileTitleMap[answers["How do you prepare mentally before a big moment?"]] || "The Focused Competitor";
  const drivePhrase = driveMap[answers["What drives you"]] || "a desire to improve";
  const mindsetImprovement = answers["If you could upgrade just one part of your mindset, what would it be?"] || "your mindset";
  const outcomePhrase = performanceMap[answers["What's one thing your best performances have in common?"]] || "reach your next level";
  const stat = "Based on your selections, 27% of athletes have similar responses to you.";

  return {
    title: profileTitle,
    stat,
    sentence: `You are driven by ${drivePhrase}, so let's get you ${mindsetImprovement.toLowerCase()}.`,
    outcome: `We want you to ${outcomePhrase} and unlock your best performances.`
  };
}



{{mindset profile}} Athletes have reported these results: (using circle percentage icon that is filled according to the stat)
"96% of athletes improved."
"81% felt they recovered faster."
"87% increase in confidence"
"74% performed better under pressure."
"95% felt more focused."
"90% felt happier & healthier"
Button text: I want results


Paywall - designed in revenue cat will go here

---

## Implementation Steps (2024-06-28)

1. **Quiz Data Storage**
   - After the user completes the quiz and sees the result, save their answers (not the result screen) to Supabase under their user profile (using their Supabase user ID).
   - This is for admin/analytics use only; users do not need to see their past results in-app.

2. **Result Screen Structure**
   - The result screen is part of the QuizWizard flow (not a separate screen).
   - The "I want results" button is always visible.

3. **Athlete Stats**
   - Use fixed percentage stats as provided in the plan.
   - Animate the circle percentage icon to the stat value.

4. **Paywall Flow**
   - After clicking "I want results," show a temporary "Continue" button/page (to be replaced by the RevenueCat paywall later).
   - The paywall is always shown after the result.

5. **Design Consistency & Animation**
   - The result screen uses the app's color scheme and typography.
   - Add a reveal animation for the profile name/content (e.g., fade/slide in).

6. **Quiz Navigation**
   - Users can go back and change answers at any time during the quiz.
   - No "restart quiz" button is needed.
