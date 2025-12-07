import { create } from 'zustand';

const useTournamentStore = create((set) => ({
  upcomingTournaments: [],
  ongoingTournaments: [],
  currentTournament: null,
  
  setUpcomingTournaments: (tournaments) => set({ upcomingTournaments: tournaments }),
  setOngoingTournaments: (tournaments) => set({ ongoingTournaments: tournaments }),
  setCurrentTournament: (tournament) => set({ currentTournament: tournament }),
  updateTournament: (tournament) => set((state) => ({
    currentTournament: state.currentTournament?._id === tournament._id ? tournament : state.currentTournament
  }))
}));

export default useTournamentStore;

