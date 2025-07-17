import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getVillainState, setCurrentVillain, updateVillainHealth, addDefeatedVillain, VillainKey, VillainState } from './villainStorage';

interface VillainContextType extends VillainState {
  setVillain: (villain: VillainKey) => Promise<void>;
  damageVillain: (amount: number) => Promise<void>;
  defeatVillain: () => Promise<void>;
  refresh: () => Promise<void>;
}

const VillainContext = createContext<VillainContextType | undefined>(undefined);

export function VillainProvider({ children }: { children: ReactNode }) {
  const [currentVillain, setCurrent] = useState<VillainKey | null>(null);
  const [villainHealth, setHealth] = useState(126);
  const [defeatedVillains, setDefeated] = useState<VillainKey[]>([]);

  const refresh = async () => {
    const state = await getVillainState();
    setCurrent(state.currentVillain);
    setHealth(state.villainHealth);
    setDefeated(state.defeatedVillains);
  };

  useEffect(() => {
    refresh();
  }, []);

  const setVillain = async (villain: VillainKey) => {
    await setCurrentVillain(villain);
    await refresh();
  };

  const damageVillain = async (amount: number) => {
    const newHealth = Math.max(0, villainHealth - amount);
    await updateVillainHealth(newHealth);
    await refresh();
  };

  const defeatVillain = async () => {
    if (currentVillain) {
      await addDefeatedVillain(currentVillain);
      await refresh();
    }
  };

  return (
    <VillainContext.Provider
      value={{ currentVillain, villainHealth, defeatedVillains, setVillain, damageVillain, defeatVillain, refresh }}
    >
      {children}
    </VillainContext.Provider>
  );
}

export function useVillain() {
  const ctx = useContext(VillainContext);
  if (!ctx) throw new Error('useVillain must be used within a VillainProvider');
  return ctx;
} 