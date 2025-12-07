import { Chess } from 'chess.js';
import { getBotMove } from '../chess-engine/bot.js';
import MatchService from './MatchService.js';

class BotService {
  async makeBotMove(matchId) {
    const match = await MatchService.getMatch(matchId);
    if (!match || !match.isBotMatch || match.status !== 'ongoing') {
      return null;
    }

    const game = new Chess(match.fen);
    const currentTurn = game.turn();
    
    // Check if it's bot's turn
    const isBotWhite = match.botPlayer === 'white';
    const isBotBlack = match.botPlayer === 'black';
    
    if ((currentTurn === 'w' && !isBotWhite) || (currentTurn === 'b' && !isBotBlack)) {
      return null; // Not bot's turn
    }

    // Get bot move
    const botMove = getBotMove(match.fen, 'easy');
    if (!botMove) return null;

    // Add small delay for realism (100-500ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100));

    // Make the bot move using the dedicated bot move method
    return await MatchService.makeBotMove(matchId, botMove.from, botMove.to, botMove.promotion);
  }

  async checkAndPlayBotMove(matchId) {
    try {
      const updatedMatch = await this.makeBotMove(matchId);
      return updatedMatch;
    } catch (error) {
      console.error('Bot move error:', error);
      return null;
    }
  }
}

export default new BotService();

