import Bet from '../models/Bet.js';
import Match from '../models/Match.js';
import User from '../models/User.js';

class BettingService {
  async placeBet(matchId, userId, amount, predictedWinner) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error('Match not found');

    if (match.status !== 'ongoing' && match.status !== 'waiting') {
      throw new Error('Cannot bet on finished match');
    }

    // Check if user already bet on this match
    const existingBet = await Bet.findOne({ matchId, userId });
    if (existingBet) {
      throw new Error('Already placed a bet on this match');
    }

    // Get user and check balance (assuming users have a balance field)
    // For now, we'll just create the bet without balance checking
    const bet = new Bet({
      matchId,
      userId,
      amount,
      predictedWinner
    });

    await bet.save();
    return await Bet.findById(bet._id).populate('userId');
  }

  async settleBets(matchId) {
    const match = await Match.findById(matchId);
    if (!match || match.status !== 'finished') {
      throw new Error('Match is not finished');
    }

    const bets = await Bet.find({ matchId, status: 'pending' });
    
    let actualWinner = null;
    if (match.result === 'white_wins') {
      actualWinner = 'white';
    } else if (match.result === 'black_wins') {
      actualWinner = 'black';
    } else if (match.result === 'draw') {
      actualWinner = 'draw';
    }

    for (const bet of bets) {
      if (bet.predictedWinner === actualWinner) {
        bet.status = 'won';
        // Simple 2x payout (can be more sophisticated)
        bet.payout = bet.amount * 2;
        
        // Update user earnings
        const user = await User.findById(bet.userId);
        if (user) {
          user.totalEarnings += bet.payout;
          await user.save();
        }
      } else {
        bet.status = 'lost';
        bet.payout = 0;
      }
      
      bet.settledAt = new Date();
      await bet.save();
    }

    return bets;
  }

  async getMatchBets(matchId) {
    return await Bet.find({ matchId })
      .populate('userId')
      .sort({ placedAt: -1 });
  }

  async getUserBets(userId) {
    return await Bet.find({ userId })
      .populate('matchId')
      .sort({ placedAt: -1 });
  }
}

export default new BettingService();

