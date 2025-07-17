# Meditation Completion Villain Integration Instructions

## Goal
Show the MonsterDamagePopup after a meditation session ends, using villain context for state and updates.

## Steps

1. **Access Villain State**
   - In the screen/component where meditation completion is handled (e.g., MeditateScreen.tsx), use the `useVillain` hook.

2. **Show Damage Popup**
   - After the meditation audio ends, if a villain is active, render `<MonsterDamagePopup />` as a modal or screen.
   - Pass any necessary props or use context directly.

3. **Update Health and Trigger Defeat**
   - Use the context's `damageVillain` function to decrease health by 9.
   - If health reaches 0, trigger defeat logic (e.g., show VillainDefeatOverlay, call `defeatVillain`).

4. **One Damage Per Day**
   - Track the last damage date in villain state (add `lastDamageDate: string` to villain state and storage).
   - Before allowing damage, check if today's date matches `lastDamageDate`. If so, disable damage for the day.
   - Update `lastDamageDate` when damage is applied.

5. **Example Logic**
   ```tsx
   import { useVillain } from './components/VillainProvider';
   import MonsterDamagePopup from './components/MonsterDamagePopup';
   // ...
   const { currentVillain, villainHealth, damageVillain } = useVillain();
   // After meditation audio ends:
   if (currentVillain) {
     // Show <MonsterDamagePopup />
     // On damage, call damageVillain(9)
   }
   ```

6. **Notes**
   - Ensure this does not disrupt users not using the villain system.
   - Add UI feedback if damage is not allowed (already damaged today).
   - Test for both new and returning users.

---

This ensures villain damage is handled after meditation, with daily limits and defeat logic integrated. 