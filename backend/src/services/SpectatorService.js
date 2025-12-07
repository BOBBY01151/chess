import MatchService from './MatchService.js';

class SpectatorService {
  async addSpectator(matchId, userId) {
    return await MatchService.addSpectator(matchId, userId);
  }

  async removeSpectator(matchId, userId) {
    return await MatchService.removeSpectator(matchId, userId);
  }

  async getMatchSpectators(matchId) {
    const match = await MatchService.getMatch(matchId);
    return match?.spectators || [];
  }
}

export default new SpectatorService();

