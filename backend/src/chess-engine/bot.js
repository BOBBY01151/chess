import { Chess } from 'chess.js';

// Simple bot that makes random legal moves
export const makeRandomMove = (game) => {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;
  
  const randomMove = moves[Math.floor(Math.random() * moves.length)];
  return {
    from: randomMove.from,
    to: randomMove.to,
    promotion: randomMove.promotion
  };
};

// Bot with basic evaluation (depth 1)
export const makeSmartMove = (game) => {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestScore = -Infinity;

  // Simple evaluation: prefer captures and checks
  moves.forEach(move => {
    const testGame = new Chess(game.fen());
    testGame.move(move);
    
    let score = 0;
    
    // Check if move is a capture
    if (move.captured) {
      const pieceValues = {
        'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
      };
      score += pieceValues[move.captured] || 0;
    }
    
    // Check if move gives check
    if (testGame.inCheck()) {
      score += 2;
    }
    
    // Check if move is checkmate
    if (testGame.isCheckmate()) {
      score += 1000;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  });

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion
  };
};

// Main bot move function
export const getBotMove = (fen, difficulty = 'easy') => {
  const game = new Chess(fen);
  
  if (difficulty === 'hard') {
    return makeSmartMove(game);
  } else {
    return makeRandomMove(game);
  }
};

