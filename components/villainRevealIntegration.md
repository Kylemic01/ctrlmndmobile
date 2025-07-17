# VillainReveal Integration Instructions

## Goal
Show the VillainReveal screen after the first meditation, and allow users to view their current villain at any time.

## Steps

1. **After First Meditation**
   - After the user completes their first meditation session (and villain is selected), render `<VillainReveal />` to introduce the villain.
   - Optionally, show this only once (track with a flag in AsyncStorage or context, e.g., `villainRevealed`).

2. **View Villain Button**
   - Add a button or menu item (e.g., on dashboard or profile) labeled “View Villain.”
   - When pressed, render `<VillainReveal />` as a modal or screen.

3. **Use Context**
   - Use the `useVillain` hook to fetch and display the current villain and health.

4. **Edge Cases**
   - If no villain is selected, do not show the reveal screen.
   - If villain is defeated, show defeat state or prompt to select a new villain.

5. **Example Logic**
   ```tsx
   import { useVillain } from './components/VillainProvider';
   import VillainReveal from './components/VillainReveal';
   // ...
   const { currentVillain } = useVillain();
   // After first meditation or on button press:
   if (currentVillain) {
     return <VillainReveal />;
   }
   ```

---

This ensures the villain reveal is shown at the right moments and is always accessible to the user. 