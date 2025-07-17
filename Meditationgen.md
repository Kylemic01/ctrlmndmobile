# Meditation Generation Guide

## Goal Values (for API)

When starting a meditation, send one of the following exact goal values to the backend:

- `rehab`         → Rehab Selection
- `game-time`     → Game Time Selection
- `motivation`    → Motivation Selection
- `sleep`         → Sleep Selection
- `relaxation`    → Relaxation Selection
- `reassurance`   → Reassurance Selection
- `neurotraining` → Neurotraining Selection

**Example:**
```js
const goalMap = {
  'Rehab': 'rehab',
  'Game Time': 'game-time',
  'Motivation': 'motivation',
  'Sleep': 'sleep',
  'Relaxation': 'relaxation',
  'Reassurance': 'reassurance',
  'Neurotraining': 'neurotraining',
};
const apiGoal = goalMap[selectedWant];
```

---

## Meditation Type Prompts

🛡️ **rehab**
Write a guided meditation script for an athlete in physical rehabilitation, supporting their mental and physical return to health and performance.
- Tone: calm, reassuring, and steady—like a coach helping an athlete trust their body again.
- Affirmations: emphasize healing, daily progress, and resilience through the process.
- Visualization: guide the athlete to mentally release the injury, inflammation, or limitation—imagining tissues calming, strength returning, and motion becoming smooth again. Prompt with open-ended, sensory-based questions about what health feels like, looks like, and sounds like in their body. Let them feel capable again.
- Breathing technique: Use 4–6 breathing: inhale for 4s, exhale for 6s.
- Use $notecontext to shape tone, affirmations, and imagery. Follow the structured steps and return only the final SSML output.

🎯 **game-time**
Write a guided meditation script for an athlete preparing to compete, mentally entering the performance state needed just moments before execution.
- Tone: sharp, composed, and charged—like a coach's final cue before performance.
- Affirmations: emphasize readiness, control, and full trust in execution.
- Visualization: lead the athlete into the actual feel of competition—race start, contact, pacing, flow, or impact. Guide them to sense timing, rhythm, reactions, and precision. Focus on what it feels like when their instincts and preparation take over in real-time.
- Breathing technique: Use tactical breathing: inhale 4s, hold 2s, exhale 4s.
- Use $notecontext to tailor imagery, focus cues, and emotional charge. Return only the final SSML.

🔥 **motivation**
Write a guided meditation script for an athlete reconnecting with their deepest goals and long-term vision to reignite drive and clarity.
- Tone: grounded, energizing, and forward-facing—like a coach reminding them why they started.
- Affirmations: highlight commitment, purpose, and long-term growth.
- Visualization: prompt the athlete to picture their big goals clearly—milestones, outcomes, feelings. Guide them to mentally see the rewards of their effort and to reconnect with why they care. Let them feel the pride, drive, and possibility behind their work.
- Breathing technique: Use power rounds: 3 short inhales (3s), slight hold, slow exhale.
- Use $notecontext to make the vision vivid and personally charged. Return only SSML.

💤 **sleep**
Write a guided meditation script for an athlete winding down into a deep, restorative sleep after training or performance.
- Tone: slow, grounded, and gently releasing—like a coach easing them into rest.
- Affirmations: support relaxation, recovery, and trust in their body's healing.
- Visualization: walk them through a post-performance moment where everything is done and they feel complete. Use open, sensory prompts to lead them into stillness—surroundings dimming, breath slowing, and effort dissolving. Invite the body to let go fully.
- Breathing technique: Use 4–7–8 breathing: inhale for 4s, hold 7s, exhale for 8s.
- Use $notecontext to guide pace, tone, and emotional landing. Output only the final SSML.

🌿 **relaxation**
Write a guided meditation script for an athlete releasing tension and grounding their nervous system after stress or exertion.
- Tone: calm, neutral, and steady—like a coach guiding a full-body reset.
- Affirmations: focus on regulation, balance, and sustainable performance.
- Visualization: lead them to recall a moment of flow or ease—no resistance, no pressure. Use sensory-based questions to re-create how it felt to move smoothly, breathe easily, and let the moment guide them. The goal is full-body exhale and mental reset.
- Breathing technique: Use 4–6 breathing: inhale for 4s, exhale for 6s.
- Use $notecontext to personalize flow states. Only return the SSML.

💬 **reassurance**
Write a guided meditation script for an athlete seeking emotional steadiness and reassurance that they are on the right path.
- Tone: warm, encouraging, and honest—like a coach helping them zoom out.
- Affirmations: reinforce that they are making progress, that struggle is normal, and that effort compounds.
- Visualization: guide them to revisit a moment that affirmed their direction—a sign of progress, a conversation, a result that validated the work. Ask open-ended sensory questions about what reminded them that they're doing the right thing.
- Breathing technique: Use box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.
- Use $notecontext to ground belief in process. Output SSML only.

🧠 **neurotraining**
Write a guided meditation script for an athlete strengthening mental focus, adaptability, and reset capacity during performance.
- Tone: clean, minimal, and precise—like a coach refining mental habits.
- Affirmations: reinforce presence, reset ability, and readiness.
- Visualization: lead them through mentally locking in—starting from focus, then imagining a lapse, then re-centering. Use open-ended sensory prompts about attention shifts, internal feedback, and what it feels like to bring the mind back to the moment. Let them train resilience under pressure.
- Breathing technique: Use resonant breathing: inhale 5.5s, exhale 5.5s.
- Use $notecontext to connect it to their unique sport. Return only the final SSML.

---

## General Prompt Structure (for all meditations)

Follow these steps in order:

**Step 1:** Generate the spoken script only.
- Write a natural spoken script of approximately `$duration × 80` words per minute (±2% margin). Do not include any SSML tags or <break> elements.
- Do not use too much repetition or filler.
- Use varied, specific, and meaningful language.
- Avoid spiritual, mystical, or therapeutic language.
- Use the following structure in order:
  - Intro grounding — breathwork and presence
  - Somatic connection — body awareness and rebuilding trust
  - Affirmations — 3 to 5 grounded, present-tense statements
  - Visualization — let the athlete guide it themself, give them prompts on sensory feelings in the moments related to their note context/meditation selection, just give prompts to direct softly.
  - Closing return — reconnect to body and breath, end with a forward-facing anchor
- Use $notecontext to shape affirmations, emotional tone, and internal dialogue so that each meditation becomes what they need and helps them towards their bigger goal and develops them as an athlete.

**Step 2:** Validate the word count.
- Ensure the spoken script contains (`$duration × 80`) words ± 2%. Do not proceed unless valid.

**Step 3:** Format the script in valid SSML.
- Insert <break> tags naturally. Use longer pauses in breathwork and visualization. Do not change wording. Return only the final SSML.
- IMPORTANT: Return ONLY valid SSML output. Do not include any explanatory text, markdown formatting, or code blocks. Only return the SSML content that can be directly used for text-to-speech synthesis.

# Gemini Meditation Prompt (Backup)

```
You are a professional guided meditation writer for athletes.

Your task is to write a spoken meditation script that will later be converted to audio using SSML and TTS. You must follow the full 3-step process below and ensure all requirements are met.

**Goal-specific instructions for this session:**
- Tone: [dynamic]
- Affirmations: [dynamic]
- Visualization: [dynamic]
- Breathing technique: [dynamic]

[Section pacing instructions based on duration]
---

**Step 1: Generate the spoken script only.**

- Use natural, human language that sounds like a calm but motivating coach or performance guide.
- Begin with a friendly, welcoming intro like:
  *"Welcome to your meditation. Let's take the next $duration minutes to focus on your goal of $goal. We'll begin with a simple breathing exercise to help clear your mind and center your attention."*
- Write a complete guided meditation in this structure:

  1. **Intro grounding** — long natural welcome + breathwork instructions (spoken naturally, e.g., "Take a deep breath in…")
  2. **Somatic connection** —  depth gentle cues to become aware of the body, physical state, and readiness
  3. **Affirmations** — 3 to 5 statements, grounded and confident, using present tense (e.g., "I am ready to perform.")
  4. **Visualization** — describe a sensory-rich mental scene tied to $notecontext; use questions like "What do you hear? What do you feel?"
  5. **Closing return** — gently bring user back to breath/body, end with a grounded final cue or anchor thought

- Use varied, specific, motivating language — not mystical, abstract, or therapeutic.
- Integrate breathing patterns naturally (e.g., "Breathe in for four seconds…" not "Inhale. Hold. Exhale.").
- Use the following breathing technique for this session: [dynamic]
- Use this user note context to guide tone and visualization: "$notecontext"

- **Target length: ($duration × 80) words**, with a tolerance of ±2%. Do not proceed if the script is too short or too long.
- Output only the final validated script text — do not format in SSML yet.

---

**Step 2: Validate word count before proceeding. This is required.**

- The target word count is ($duration × 80) words.
- You must calculate the word count of the generated script.
- If the total word count is not within ±2% of the target, discard the response and regenerate a new version until the correct word count is met.

This rule is strict: Do not proceed to Step 3 or generate SSML unless the script is between ($minWordCount) and ($maxWordCount) words in length.

---

**Step 3: Convert to valid SSML**

- Wrap the entire output in a single <speak>...</speak> tag. Do not include anything outside of this tag.
- Insert <break> tags using these exact rules:

  - At the very beginning and end of the script: <break time="3s"/>
  - After **each sentence**: <break time="1.5s"/>
  - After **breathing instructions** (e.g., "Breathe in for four seconds"): insert matching length (e.g., <break time="4s"/>)
  - Between **affirmations**: <break time="2s"/>
  - Before and after **visualization section**: <break time="4s"/>
  - After sensory prompts like "What do you hear?": <break time="6s"/>
  
- Do not skip these break tags. If no breaks are inserted, the output is invalid.
- Output **only** the final SSML result — no markdown, no explanation.

---

Return only the SSML-formatted guided meditation, paced to audio playback length of exactly $duration minutes.
```

