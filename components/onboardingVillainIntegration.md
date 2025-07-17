# Onboarding Villain Integration Instructions

## Goal
After user signup/onboarding, show the MonsterSelectionScreen if no current villain is active.

## Steps

1. **Wrap App or Navigation Subtree**
   - Import and wrap your app (or the relevant navigation subtree) with `VillainProvider` from `components/VillainProvider`.

2. **Check Villain State After Signup**
   - In the screen/component where onboarding/signup completes, use the `useVillain` hook.
   - If `currentVillain` is `null`, render `<MonsterSelectionScreen />` as the next step.
   - If a villain is already selected, proceed as normal.

3. **Example Logic**
   ```tsx
   import { useVillain } from './components/VillainProvider';
   import MonsterSelectionScreen from './components/MonsterSelectionScreen';
   // ...
   const { currentVillain } = useVillain();
   if (currentVillain === null) {
     return <MonsterSelectionScreen />;
   }
   // ...rest of your onboarding completion logic
   ```

4. **Notes**
   - Ensure this logic does not affect users who already have a villain selected.
   - Test onboarding flow for both new and returning users.
   - Do not remove or alter any existing onboarding logic unless necessary.

---

This ensures villain selection is seamlessly integrated after onboarding, with minimal disruption to existing flows. 