import Match from '../models/Match.js';
import { v4 as uuidv4 } from 'uuid';
import { Chess } from 'chess.js';
import { getBotMove } from '../chess-engine/bot.js';

class MatchService {
  getTimeInMs(timeControl) {
    const timeMap = {
      '1min': 60 * 1000,
      '3min': 3 * 60 * 1000,
      '5min': 5 * 60 * 1000,
      '10min': 10 * 60 * 1000,
      '30min': 30 * 60 * 1000
    };
    return timeMap[timeControl] || 180000;
  }

  async createMatch(playerWhite, playerBlack, timeControl, isBotMatch = false, botPlayer = null) {
    const timeInMs = this.getTimeInMs(timeControl);
    
    // Handle bot matches - set bot player side to null
    let whitePlayer = playerWhite;
    let blackPlayer = playerBlack;
    
    if (isBotMatch) {
      if (botPlayer === 'white') {
        whitePlayer = null;
        blackPlayer = playerBlack; // user is black
      } else if (botPlayer === 'black') {
        whitePlayer = playerWhite; // user is white
        blackPlayer = null;
      }
    }
    
    // Validation: At least one player must be a real user (not null)
    if (!whitePlayer && !blackPlayer) {
      throw new Error('At least one player must be a real user');
    }
    
    // Validation: If not bot match, both players must be real users
    if (!isBotMatch && (!whitePlayer || !blackPlayer)) {
      throw new Error('Both players must be real users for non-bot matches');
    }
    
    const match = new Match({
      id: uuidv4(),
      playerWhite: whitePlayer,
      playerBlack: blackPlayer,
      timeControl,
      initialTime: {
        white: timeInMs,
        black: timeInMs
      },
      remainingTime: {
        white: timeInMs,
        black: timeInMs
      },
      isBotMatch,
      botPlayer,
      status: 'waiting'
    });

    await match.save();
    return await Match.findById(match._id).populate('playerWhite playerBlack');
  }

  async startMatch(matchId) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error('Match not found');

    match.status = 'ongoing';
    match.startedAt = new Date();
    await match.save();

    return await Match.findById(matchId).populate('playerWhite playerBlack');
  }

  async makeMove(matchId, userId, from, to, promotion = null) {
    const match = await Match.findById(matchId).populate('playerWhite playerBlack');
    if (!match) throw new Error('Match not found');

    if (match.status !== 'ongoing') {
      throw new Error('Match is not ongoing');
    }

    const game = new Chess(match.fen);
    
    // Check if user is white or black (handle bot matches where one player is null)
    const isWhite = match.playerWhite && match.playerWhite._id.toString() === userId.toString();
    const isBlack = match.playerBlack && match.playerBlack._id.toString() === userId.toString();

    if (!isWhite && !isBlack) {
      throw new Error('You are not a player in this match');
    }

    const currentTurn = game.turn() === 'w' ? 'white' : 'black';
    if ((currentTurn === 'white' && !isWhite) || (currentTurn === 'black' && !isBlack)) {
      throw new Error('Not your turn');
    }

    try {
      const move = game.move({ from, to, promotion });
      if (!move) throw new Error('Invalid move');

      match.fen = game.fen();
      match.moves.push({
        from,
        to,
        promotion: move.promotion,
        san: move.san,
        timestamp: new Date()
      });

      // Check game over conditions
      if (game.isGameOver()) {
        match.status = 'finished';
        match.endedAt = new Date();

        if (game.isCheckmate()) {
          match.result = isWhite ? 'white_wins' : 'black_wins';
          // Handle bot matches - winner is always the human player
          if (match.isBotMatch) {
            match.winner = isWhite ? match.playerWhite : match.playerBlack;
          } else {
            match.winner = isWhite ? match.playerWhite._id : match.playerBlack._id;
          }
        } else if (game.isDraw()) {
          match.result = 'draw';
        } else if (game.isStalemate()) {
          match.result = 'draw';
        }
      }

      await match.save();
      return await Match.findById(matchId).populate('playerWhite playerBlack');
    } catch (error) {
      throw new Error(`Invalid move: ${error.message}`);
    }
  }

  async makeBotMove(matchId, from, to, promotion = null) {
    const match = await Match.findById(matchId).populate('playerWhite playerBlack');
    if (!match) throw new Error('Match not found');

    if (match.status !== 'ongoing' || !match.isBotMatch) {
      throw new Error('Invalid match for bot move');
    }

    const game = new Chess(match.fen);

    try {
      const move = game.move({ from, to, promotion });
      if (!move) throw new Error('Invalid move');

      match.fen = game.fen();
      match.moves.push({
        from,
        to,
        promotion: move.promotion,
        san: move.san,
        timestamp: new Date()
      });

      // Check game over conditions
      if (game.isGameOver()) {
        match.status = 'finished';
        match.endedAt = new Date();

        if (game.isCheckmate()) {
          const isBotWhite = match.botPlayer === 'white';
          match.result = isBotWhite ? 'black_wins' : 'white_wins';
          // Winner is the human player (the one that's not null)
          match.winner = isBotWhite ? match.playerBlack : match.playerWhite;
        } else if (game.isDraw()) {
          match.result = 'draw';
        } else if (game.isStalemate()) {
          match.result = 'draw';
        }
      }

      await match.save();
      return await Match.findById(matchId).populate('playerWhite playerBlack');
    } catch (error) {
      throw new Error(`Invalid bot move: ${error.message}`);
    }
  }

  async updateClock(matchId, player, remainingTime) {
    const match = await Match.findById(matchId);
    if (!match) return null;

    match.remainingTime[player] = remainingTime;
    await match.save();

    // Check for time out
    if (remainingTime <= 0) {
      match.status = 'finished';
      match.endedAt = new Date();
      match.result = player === 'white' ? 'black_wins' : 'white_wins';
      match.winner = player === 'white' ? match.playerBlack : match.playerWhite;
      await match.save();
    }

    return await Match.findById(matchId).populate('playerWhite playerBlack');
  }

  async getMatch(matchId) {
    return await Match.findById(matchId).populate('playerWhite playerBlack');
  }

  async getLiveMatches() {
    return await Match.find({ status: 'ongoing' })
      .populate('playerWhite playerBlack')
      .sort({ startedAt: -1 });
  }

  async getMatchHistory(userId) {
    return await Match.find({
      $or: [{ playerWhite: userId }, { playerBlack: userId }],
      status: 'finished'
    })
      .populate('playerWhite playerBlack')
      .sort({ endedAt: -1 })
      .limit(50);
  }

  async addSpectator(matchId, userId) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error('Match not found');

    if (!match.spectators.includes(userId)) {
      match.spectators.push(userId);
      await match.save();
    }

    return await Match.findById(matchId).populate('playerWhite playerBlack spectators');
  }

  async removeSpectator(matchId, userId) {
    const match = await Match.findById(matchId);
    if (!match) return null;

    match.spectators = match.spectators.filter(id => id.toString() !== userId.toString());
    await match.save();

    return await Match.findById(matchId).populate('playerWhite playerBlack spectators');
  }
}

export default new MatchService();

