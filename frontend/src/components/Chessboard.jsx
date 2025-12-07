import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

const SQUARE_SIZE = 60;
const BOARD_SIZE = SQUARE_SIZE * 8;

const PIECE_SYMBOLS = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

const Chessboard = ({ fen, onMove, orientation = 'white', disabled = false, isPlayer = true }) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [game, setGame] = useState(new Chess(fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'));

  useEffect(() => {
    if (fen) {
      const newGame = new Chess(fen);
      setGame(newGame);
      setSelectedSquare(null);
    }
  }, [fen]);

  const getSquare = (rank, file) => {
    if (orientation === 'black') {
      return String.fromCharCode(104 - file) + (rank + 1);
    }
    return String.fromCharCode(97 + file) + (8 - rank);
  };

  const getPiece = (rank, file) => {
    const square = getSquare(rank, file);
    return game.get(square);
  };

  const handleSquareClick = (rank, file) => {
    if (disabled || !isPlayer) return;

    const square = getSquare(rank, file);
    const piece = game.get(square);

    if (selectedSquare) {
      // Try to make move
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q'
        });

        if (move) {
          onMove(selectedSquare, square);
          setSelectedSquare(null);
          return;
        }
      } catch (error) {
        // Invalid move
      }

      // If click on own piece, select it
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    } else {
      // Select piece if it's your turn
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
    }
  };

  const isLegalMove = (from, to) => {
    try {
      const testGame = new Chess(game.fen());
      return testGame.move({ from, to }) !== null;
    } catch {
      return false;
    }
  };

  const getPossibleMoves = (square) => {
    if (!square) return [];
    const moves = game.moves({ square, verbose: true });
    return moves.map(m => m.to);
  };

  const isLightSquare = (rank, file) => {
    return (rank + file) % 2 === 0;
  };

  const possibleMoves = selectedSquare ? getPossibleMoves(selectedSquare) : [];

  return (
    <div className="flex justify-center items-center">
      <div 
        className="relative border-4 border-gray-800 shadow-2xl"
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
      >
        {/* Board squares */}
        {Array.from({ length: 64 }, (_, index) => {
          const rank = Math.floor(index / 8);
          const file = index % 8;
          const square = getSquare(rank, file);
          const piece = getPiece(rank, file);
          const isSelected = selectedSquare === square;
          const isPossibleMove = possibleMoves.includes(square);
          const isLight = isLightSquare(rank, file);

          return (
            <div
              key={`square-${rank}-${file}`}
              onClick={() => handleSquareClick(rank, file)}
              className={`absolute flex items-center justify-center text-4xl cursor-pointer transition-all ${
                isLight ? 'bg-amber-100' : 'bg-amber-800'
              } ${isSelected ? 'ring-4 ring-blue-500' : ''} ${
                isPossibleMove ? 'ring-2 ring-green-400' : ''
              } ${disabled || !isPlayer ? 'cursor-not-allowed opacity-75' : 'hover:opacity-80'}`}
              style={{
                left: file * SQUARE_SIZE,
                top: rank * SQUARE_SIZE,
                width: SQUARE_SIZE,
                height: SQUARE_SIZE
              }}
            >
              {piece && (
                <span className={piece.color === 'w' ? 'text-white' : 'text-black'}>
                  {PIECE_SYMBOLS[piece.type.toUpperCase() === piece.type ? piece.type : piece.type.toLowerCase()]}
                </span>
              )}
              {isPossibleMove && !piece && (
                <div className="w-3 h-3 rounded-full bg-green-500 opacity-60" />
              )}
            </div>
          );
        })}

        {/* Coordinates */}
        {Array.from({ length: 8 }, (_, i) => (
          <React.Fragment key={`coord-${i}`}>
            <div
              className="absolute text-xs font-bold text-gray-700"
              style={{
                bottom: -20,
                left: i * SQUARE_SIZE + SQUARE_SIZE / 2 - 6
              }}
            >
              {String.fromCharCode(97 + (orientation === 'white' ? i : 7 - i))}
            </div>
            <div
              className="absolute text-xs font-bold text-gray-700"
              style={{
                left: -20,
                top: i * SQUARE_SIZE + SQUARE_SIZE / 2 - 8
              }}
            >
              {orientation === 'white' ? 8 - i : i + 1}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Chessboard;

