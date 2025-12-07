import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import MatchService from './MatchService.js';
import { generateBracket, getNextMatch } from '../utils/bracket.js';

class TournamentService {
  async createTournament(name, creatorId, startTime, maxPlayers, timeControl) {
    // Get next tournament ID
    const lastTournament = await Tournament.findOne().sort({ id: -1 });
    const nextId = lastTournament ? lastTournament.id + 1 : 1;

    // Generate unique link
    const link = `tournament_${nextId}_${Date.now()}`;

    const tournament = new Tournament({
      id: nextId,
      name,
      creator: creatorId,
      startTime: new Date(startTime),
      maxPlayers,
      timeControl: timeControl || '5min',
      link,
      participants: [creatorId],
      status: 'upcoming'
    });

    await tournament.save();
    return await Tournament.findById(tournament._id).populate('creator participants');
  }

  async joinTournament(tournamentId, userId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) throw new Error('Tournament not found');

    if (tournament.status !== 'upcoming') {
      throw new Error('Tournament is not accepting participants');
    }

    if (tournament.participants.length >= tournament.maxPlayers) {
      throw new Error('Tournament is full');
    }

    if (tournament.participants.includes(userId)) {
      throw new Error('Already registered');
    }

    tournament.participants.push(userId);
    await tournament.save();

    return await Tournament.findById(tournamentId).populate('creator participants');
  }

  async startTournament(tournamentId) {
    const tournament = await Tournament.findById(tournamentId).populate('participants');
    if (!tournament) throw new Error('Tournament not found');

    if (tournament.status !== 'upcoming') {
      throw new Error('Tournament cannot be started');
    }

    // Fill remaining slots with bots
    const neededBots = tournament.maxPlayers - tournament.participants.length;
    for (let i = 0; i < neededBots; i++) {
      tournament.participants.push('BOT');
    }

    // Generate bracket
    const bracket = generateBracket(tournament.participants);
    tournament.bracket = bracket;
    tournament.status = 'ongoing';
    tournament.currentRound = 0;

    await tournament.save();

    // Create matches for first round
    await this.createRoundMatches(tournamentId, 0);

    return await Tournament.findById(tournamentId).populate('creator participants');
  }

  async createRoundMatches(tournamentId, round) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament || !tournament.bracket) return;

    const roundMatches = tournament.bracket.matches[round];
    if (!roundMatches) return;

    const matches = [];

    for (const bracketMatch of roundMatches) {
      if (bracketMatch.status === 'pending') {
        const player1 = bracketMatch.player1 === 'BOT' ? null : bracketMatch.player1;
        const player2 = bracketMatch.player2 === 'BOT' ? null : bracketMatch.player2;

        // Create match - use null for bot players
        const match = await MatchService.createMatch(
          player1 || null,
          player2 || null,
          tournament.timeControl,
          !player1 || !player2,
          !player1 ? 'white' : (!player2 ? 'black' : null)
        );

        match.tournamentId = tournament._id;
        await match.save();

        bracketMatch.matchId = match._id.toString();
        bracketMatch.status = 'ongoing';
        matches.push(match._id);
      }
    }

    tournament.matches.push(...matches);
    await tournament.save();

    return matches;
  }

  async updateTournamentMatch(tournamentId, matchId) {
    const tournament = await Tournament.findById(tournamentId);
    const match = await Match.findById(matchId);
    
    if (!tournament || !match) return null;

    if (match.status !== 'finished') return tournament;

    // Find and update bracket
    for (let round = 0; round < tournament.bracket.matches.length; round++) {
      for (let matchIdx = 0; matchIdx < tournament.bracket.matches[round].length; matchIdx++) {
        const bracketMatch = tournament.bracket.matches[round][matchIdx];
        
        if (bracketMatch.matchId === matchId.toString()) {
          bracketMatch.status = 'finished';
          
          if (match.result === 'white_wins') {
            bracketMatch.winner = bracketMatch.player1;
          } else if (match.result === 'black_wins') {
            bracketMatch.winner = bracketMatch.player2;
          } else {
            // Draw - choose randomly or use tiebreaker
            bracketMatch.winner = Math.random() > 0.5 ? bracketMatch.player1 : bracketMatch.player2;
          }

          // Check if round is complete
          const roundComplete = tournament.bracket.matches[round].every(m => m.status === 'finished');
          
          if (roundComplete && round < tournament.bracket.rounds - 1) {
            // Advance winners to next round
            const nextRound = tournament.bracket.matches[round + 1];
            const nextMatchIdx = Math.floor(matchIdx / 2);
            
            if (nextMatchIdx < nextRound.length) {
              if (matchIdx % 2 === 0) {
                nextRound[nextMatchIdx].player1 = bracketMatch.winner;
              } else {
                nextRound[nextMatchIdx].player2 = bracketMatch.winner;
              }
              
              nextRound[nextMatchIdx].status = 'pending';
            }
          }

          await tournament.save();

          // Check if tournament is complete
          if (round === tournament.bracket.rounds - 1 && roundComplete) {
            tournament.status = 'finished';
            const finalMatch = tournament.bracket.matches[round][0];
            tournament.winner = finalMatch.winner !== 'BOT' ? finalMatch.winner : null;
            await tournament.save();
          } else if (roundComplete) {
            // Start next round
            tournament.currentRound = round + 1;
            await tournament.save();
            await this.createRoundMatches(tournamentId, round + 1);
          }

          return await Tournament.findById(tournamentId).populate('creator participants');
        }
      }
    }

    return tournament;
  }

  async getTournament(tournamentId) {
    return await Tournament.findById(tournamentId)
      .populate('creator participants winner matches');
  }

  async getUpcomingTournaments() {
    return await Tournament.find({ status: 'upcoming' })
      .populate('creator')
      .sort({ startTime: 1 });
  }

  async getOngoingTournaments() {
    return await Tournament.find({ status: 'ongoing' })
      .populate('creator participants')
      .sort({ startTime: -1 });
  }

  async getTournamentMatches(tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return [];

    return await Match.find({ tournamentId: tournament._id })
      .populate('playerWhite playerBlack')
      .sort({ createdAt: 1 });
  }
}

export default new TournamentService();

