# Villain System UI Integration & Edge Case Plan

## Integration Points

1. **Onboarding/Signup**
   - After signup, show `MonsterSelectionScreen` for villain selection.
   - Only allow selection if no current villain is active.

2. **Meditation Completion**
   - After a meditation session ends, show `MonsterDamagePopup`.
   - If villain health reaches 0, trigger `VillainDefeatOverlay`.
   - After defeat, prompt user to select a new villain (return to `MonsterSelectionScreen`).

3. **Villain Reveal**
   - After first meditation, show `VillainReveal` to introduce the villain.
   - On subsequent sessions, show villain and health bar before/after damage.

4. **Profile/Settings**
   - In the profile or settings screen, add `VillainProfileProgress` to display badges and current villain progress.

## Edge Cases to Handle

- Prevent selecting a new villain until the current one is defeated.
- Only allow one meditation damage per day (track last damage date).
- Handle missing/invalid villain state (fallback to selection screen).
- Ensure villain state is reset/updated correctly on defeat.
- Handle offline/online sync if using cloud storage.
- Show appropriate loading and error states for all villain components.
- No way to reset progress unless explicitly added.

## Incremental Integration Checklist

- [ ] Add villain state/context provider (if needed) for global access.
- [ ] Integrate `MonsterSelectionScreen` after signup/onboarding.
- [ ] Integrate `MonsterDamagePopup` after meditation completion event.
- [ ] Integrate `VillainReveal` after first meditation and on villain screen.
- [ ] Integrate `VillainDefeatOverlay` when villain health reaches 0.
- [ ] Integrate `VillainProfileProgress` in profile/settings screen.
- [ ] Test all flows in isolation before connecting.
- [ ] Add edge case handling and error/loading states.
- [ ] Ensure no disruption to existing app functionality.
- [ ] Add unit/integration tests for villain flows.

---

This plan ensures safe, incremental integration of the villain system, with clear separation from existing app logic and robust edge case handling. 