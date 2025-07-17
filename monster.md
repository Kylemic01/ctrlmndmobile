# 🧠 Mental Villain Progression System

## Overview
In the app, users do not initially see “monsters.” Instead, they are prompted to choose a **mental obstacle** they struggle with most (e.g. Doubt, Pressure, Negativity). Behind the scenes, each of these maps to a stylized villain character.

Once selected, users begin a guided journey to defeat that villain—one meditation at a time.

---

## 🪞 Selection Flow

### 1. Initial Prompt:
After they sign up, ask them this question "what do you struggle with the most" 
> "What tends to hold you back most when you're trying to perform at your best?"

They choose from a list of core struggles:
- Doubt
- Pressure
- Comparison
- Fear of Failure
- Negativity
- Impatience  

Each selection maps to a pre-designed monster character, though this is hidden from the user until after their first meditation.

named 
comparison.png
doubt.png
failure.png
impatience.png
negativity.png
pressure.png

---

Struggle           Monster Name    Description
Doubt              The Question    Represents the feeling that you're not enough or not ready.
Pressure           The Weight      The burden of expectations—from yourself or others.
Comparison         The Mirror      The habit of measuring your worth against someone else’s.
Fear of Failure    The Risk        The fear that taking action might end in embarrassment or regret.
Negativity         The Voice       The inner critic that always points out what's wrong.
Impatience         The Clock       The urge to rush results and abandon the process when it feels too slow.

- **Selection is only allowed once per villain.** Users cannot change their chosen obstacle until they defeat the current monster.
- **Monster state (current villain, health, defeated badges) is stored asynchronously (e.g., AsyncStorage or cloud sync).**


## 👾 Villain Reveal

Once the user selects an obstacle (e.g. **Doubt**), they are introduced to that villain with:
- A pop-up-screen visual of the monster (e.g. Doubt monster)
- A short explanation:
  > "This is the inner voice that questions everything.  
  > Every time you meditate, you’ll chip away at its grip on you."

They are shown the monster's **name**, **design**, and a **health bar** labeled "Inner Strength" or similar.

---

## 🔁 Meditation → Damage Loop

Each time the user completes a meditation session:

1. When the meditation audio ends, show a "Good job" message and a button.
2. When the user taps the button, show the monster popup:
   - Monster image (from assets/monsters, filenames match feeling names)
   - Damage animation:
     - Health bar zooms in slightly and decreases (simple reduction effect)
     - Optional: monster shakes/flinches, red pulse overlay
   - Health bar color transitions from green to red as health decreases (every 10%)
   - Text feedback like:
     > "Nice work. Come back tomorrow to do more damage."
3. Health starts at 126 hp, decreases by 9 per meditation session.
4. Only one meditation session per day is allowed for villain damage.

---

## 🏆 Defeating a Monster

Once a monster’s health reaches zero:

- A **final crumble animation** plays (monster falls apart / disintegrates).
- The user receives a **completion badge** for that villain (e.g. *“Doubt Defeated”*).
- Badge is saved to their profile under `Settings > Mindset Progress`.

User then sees:
> "You’ve defeated this obstacle. Ready to take on the next?"

They’re taken back to the **selection screen** to choose the next target.

- **Users cannot select a new villain until the current one is defeated.**

---

## 🎖️ Profile Progress Tracking

Users can view their defeated monsters in Settings:
- **Badges:** Each one styled uniquely (e.g. broken crown for Doubt)
- Clicking a badge shows which villain it was
- Users can view current monster progress from Settings (e.g. progress bar, health left)

---

## 🧩 Key Design Notes

- Users can only focus on **one villain at a time**
- Villain is shown only **after initial meditation** (for mystery/reveal effect)
- Each villain has:
  - Name + single static visual image (from assets/monsters)
  - **Damage animations** handled via overlays (e.g. red flash, screen shake, health bar zoom/reduce)
  - **Final defeat animation** triggered with a crumble effect overlay
  - A matching **completion badge** stored in user profile metadata
- **All monster state and progress is stored asynchronously.**

---

## 🔜 Future Ideas
- Unlock bonus meditations after defeating 3 monsters
- Seasonal “boss” events or time trials
- Collaborator/creator-led monster packs

---

## 🛠 Dev Notes
- Monster state saved to user profile (async storage or cloud)
- Badge system is string-based or object-linked per monster key
- Only one meditation per day can damage the villain
- Monster images are stored in assets/monsters, filenames match feeling names
- Animations: health bar zoom/reduce, color transitions, simple monster shake/flinch, final crumble

---

## 🚧 Implementation Plan

### 1. Data Model & Storage
- Extend user profile to store:
  - currentVillain (string)
  - villainHealth (number, default 126)
  - defeatedVillains (array of strings or objects)
- Store all data asynchronously (AsyncStorage or cloud sync).

### 2. Monster Selection Flow
- Onboarding screen after signup: “What do you struggle with most?”
- Map selection to hidden monster.
- Save selection to user profile.
- Only allow selection once per villain (until defeated).

### 3. Meditation Completion → Damage Loop
- Detect meditation session completion (audio ends).
- Show "Good job" message and button.
- On button press:
  - Show monster popup with animation.
  - Decrease health by 9.
  - Animate health bar (zoom, color, value).
  - Save updated health to profile.
  - Only allow one session per day.

### 4. Villain Reveal & Progression
- After first meditation, reveal the monster (name, image, health bar).
- Show damage animation on each session.
- When health reaches 0:
  - Play defeat animation.
  - Award badge, add to defeatedVillains.
  - Prompt user to select next villain.
  - Prevent new selection until current is defeated.

### 5. Profile & Badges
- In Settings/Profile:
  - Show defeated villain badges.
  - Show current villain progress (progress bar, health left).
  - Clicking a badge shows which villain it was.

### 6. UI Components
- Monster selection screen
- Monster popup (with image, name, health bar, animations)
- Health bar component (with color transitions, zoom/reduce)
- Badge display in profile
- Defeat animation overlay

### 7. Edge Cases & UX
- Prevent selecting a new villain until current is defeated.
- No way to reset progress unless explicitly added.
- Handle offline/online sync if using cloud storage.

### 8. (Optional) Future Features
- Unlock bonus meditations after 3 villains.
- Seasonal boss events.
- Collaborator/creator monster packs.

---

