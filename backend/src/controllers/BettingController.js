import BettingService from '../services/BettingService.js';

class BettingController {
  async placeBet(req, res) {
    try {
      const { matchId, amount, predictedWinner } = req.body;
      
      if (!matchId || !amount || !predictedWinner) {
        return res.status(400).json({ error: 'Match ID, amount, and predicted winner are required' });
      }

      const bet = await BettingService.placeBet(
        matchId,
        req.user._id,
        amount,
        predictedWinner
      );
      
      res.status(201).json({ bet });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMatchBets(req, res) {
    try {
      const bets = await BettingService.getMatchBets(req.params.matchId);
      res.json({ bets });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserBets(req, res) {
    try {
      const bets = await BettingService.getUserBets(req.user._id);
      res.json({ bets });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new BettingController();

