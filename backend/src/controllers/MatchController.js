import MatchService from '../services/MatchService.js';

class MatchController {
  async getMatch(req, res) {
    try {
      const match = await MatchService.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
      res.json({ match });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getLiveMatches(req, res) {
    try {
      const matches = await MatchService.getLiveMatches();
      res.json({ matches });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMatchHistory(req, res) {
    try {
      const matches = await MatchService.getMatchHistory(req.user._id);
      res.json({ matches });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new MatchController();

