import { create } from 'zustand';

const useMatchStore = create((set) => ({
  currentMatch: null,
  liveMatches: [],
  matchHistory: [],
  isInMatch: false,
  
  setCurrentMatch: (match) => set({ currentMatch: match, isInMatch: !!match }),
  clearCurrentMatch: () => set({ currentMatch: null, isInMatch: false }),
  setLiveMatches: (matches) => set({ liveMatches: matches }),
  setMatchHistory: (matches) => set({ matchHistory: matches }),
  updateMatch: (match) => set((state) => ({
    currentMatch: state.currentMatch?._id === match._id ? match : state.currentMatch
  }))
}));

export default useMatchStore;

