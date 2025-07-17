import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for villain state
export type VillainKey = 'doubt' | 'pressure' | 'comparison' | 'failure' | 'negativity' | 'impatience';

export interface VillainState {
  currentVillain: VillainKey | null;
  villainHealth: number;
  defeatedVillains: VillainKey[];
}

const VILLAIN_STATE_KEY = 'villainState';
const DEFAULT_HEALTH = 126;

export async function getVillainState(): Promise<VillainState> {
  const json = await AsyncStorage.getItem(VILLAIN_STATE_KEY);
  if (json) return JSON.parse(json);
  return {
    currentVillain: null,
    villainHealth: DEFAULT_HEALTH,
    defeatedVillains: [],
  };
}

export async function setCurrentVillain(villain: VillainKey) {
  const state = await getVillainState();
  const newState: VillainState = {
    currentVillain: villain,
    villainHealth: DEFAULT_HEALTH,
    defeatedVillains: state.defeatedVillains,
  };
  await AsyncStorage.setItem(VILLAIN_STATE_KEY, JSON.stringify(newState));
}

export async function updateVillainHealth(newHealth: number) {
  const state = await getVillainState();
  const newState = { ...state, villainHealth: newHealth };
  await AsyncStorage.setItem(VILLAIN_STATE_KEY, JSON.stringify(newState));
}

export async function addDefeatedVillain(villain: VillainKey) {
  const state = await getVillainState();
  const newState = {
    ...state,
    currentVillain: null,
    villainHealth: DEFAULT_HEALTH,
    defeatedVillains: [...state.defeatedVillains, villain],
  };
  await AsyncStorage.setItem(VILLAIN_STATE_KEY, JSON.stringify(newState));
} 