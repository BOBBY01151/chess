import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Chess } from 'chess.js';
import * as THREE from 'three';

const SQUARE_SIZE = 1;
const BOARD_HEIGHT = 0.1;

// 3D Piece Components with better geometry
const Piece = ({ position, piece, isSelected, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      const targetY = isSelected ? position[1] + 0.2 : position[1];
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
      
      if (hovered && !isSelected) {
        meshRef.current.position.y = position[1] + 0.1;
      }
    }
  });

  const pieceColor = piece.color === 'w' ? '#f5f5dc' : '#2c2c2c';
  
  const renderPiece = () => {
    switch (piece.type.toLowerCase()) {
      case 'k': // King
        return (
          <group>
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.15, 0.25, 32]} />
              <meshStandardMaterial color={pieceColor} metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.35, 0]} castShadow>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color={pieceColor} metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
      case 'q': // Queen
        return (
          <group>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.13, 0.2, 32]} />
              <meshStandardMaterial color={pieceColor} metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.3, 0]} castShadow>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color={pieceColor} metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.42, 0]} castShadow>
              <coneGeometry args={[0.08, 0.1, 16]} />
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
      case 'r': // Rook
        return (
          <group>
            <mesh position={[0, 0.15, 0]} castShadow>
              <boxGeometry args={[0.2, 0.3, 0.2]} />
              <meshStandardMaterial color={pieceColor} metalness={0.4} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.35, 0]} castShadow>
              <boxGeometry args={[0.25, 0.1, 0.25]} />
              <meshStandardMaterial color={pieceColor} metalness={0.4} roughness={0.4} />
            </mesh>
          </group>
        );
      case 'b': // Bishop
        return (
          <group>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.12, 0.2, 32]} />
              <meshStandardMaterial color={pieceColor} metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.3, 0]} castShadow>
              <coneGeometry args={[0.08, 0.2, 32]} />
              <meshStandardMaterial color={pieceColor} metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.42, 0]} castShadow>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
      case 'n': // Knight
        return (
          <group>
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 0.2, 32]} />
              <meshStandardMaterial color={pieceColor} metalness={0.4} roughness={0.4} />
            </mesh>
            <mesh position={[0.05, 0.3, 0]} castShadow>
              <boxGeometry args={[0.15, 0.15, 0.12]} />
              <meshStandardMaterial color={pieceColor} metalness={0.4} roughness={0.4} />
            </mesh>
            <mesh position={[0.08, 0.38, 0]} castShadow>
              <boxGeometry args={[0.1, 0.1, 0.08]} />
              <meshStandardMaterial color={pieceColor} metalness={0.4} roughness={0.4} />
            </mesh>
          </group>
        );
      case 'p': // Pawn
        return (
          <group>
            <mesh position={[0, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.1, 32]} />
              <meshStandardMaterial color={pieceColor} metalness={0.3} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.15, 0]} castShadow>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color={pieceColor} metalness={0.3} roughness={0.5} />
            </mesh>
          </group>
        );
      default:
        return (
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.3, 0.2]} />
            <meshStandardMaterial color={pieceColor} />
          </mesh>
        );
    }
  };

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {renderPiece()}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.4, 32]} />
          <meshStandardMaterial color="#4ade80" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

// Board Square Component
const Square = ({ position, isLight, isSelected, isPossibleMove, onClick }) => {
  const squareColor = isLight ? '#f0d9b5' : '#b58863';
  let highlightColor = squareColor;

  if (isSelected) {
    highlightColor = '#4ade80';
  } else if (isPossibleMove) {
    highlightColor = '#86efac';
  }

  return (
    <mesh
      position={position}
      onClick={onClick}
      receiveShadow
    >
      <boxGeometry args={[SQUARE_SIZE, BOARD_HEIGHT, SQUARE_SIZE]} />
      <meshStandardMaterial 
        color={highlightColor}
        roughness={0.8}
        metalness={0.1}
      />
      {isPossibleMove && (
        <mesh position={[0, BOARD_HEIGHT / 2 + 0.01, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
          <meshStandardMaterial color="#22c55e" transparent opacity={0.5} />
        </mesh>
      )}
    </mesh>
  );
};

// Main 3D Board Component
const Chessboard3D = ({ fen, onMove, orientation = 'white', disabled = false, isPlayer = true, userColor = 'white' }) => {
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

  const getPossibleMoves = (square) => {
    if (!square) return [];
    const moves = game.moves({ square, verbose: true });
    return moves.map(m => m.to);
  };

  const handleSquareClick = (rank, file) => {
    if (!isPlayer || disabled) return;

    const square = getSquare(rank, file);
    const piece = game.get(square);
    const currentTurn = game.turn();
    const userPieceColor = userColor === 'white' ? 'w' : 'b';
    const isMyTurn = (currentTurn === 'w' && userColor === 'white') || (currentTurn === 'b' && userColor === 'black');

    if (selectedSquare) {
      // Try to make move
      if (isMyTurn && !disabled) {
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
          console.error('Invalid move:', error);
        }
      }

      // If click on own piece, select it
      if (piece && piece.color === userPieceColor && isMyTurn && !disabled) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    } else {
      // Select piece if it's your piece and your turn
      if (piece && piece.color === userPieceColor && isMyTurn && !disabled) {
        setSelectedSquare(square);
      }
    }
  };

  const possibleMoves = selectedSquare ? getPossibleMoves(selectedSquare) : [];
  const boardOffset = -3.5;

  return (
    <div className="w-full" style={{ height: '600px' }}>
      <Canvas
        shadows
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)' }}
      >
        <PerspectiveCamera makeDefault position={orientation === 'white' ? [6, 6, 6] : [6, 6, -6]} fov={50} />
        
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, 10, -5]} intensity={0.4} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={15}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0, 0]}
        />

        {/* Board */}
        <group>
          {/* Board squares */}
          {Array.from({ length: 64 }, (_, index) => {
            const rank = Math.floor(index / 8);
            const file = index % 8;
            const square = getSquare(rank, file);
            const isLight = (rank + file) % 2 === 0;
            const isSelected = selectedSquare === square;
            const isPossible = possibleMoves.includes(square);

            return (
              <Square
                key={`square-${rank}-${file}`}
                position={[
                  boardOffset + file * SQUARE_SIZE,
                  BOARD_HEIGHT / 2,
                  boardOffset + rank * SQUARE_SIZE
                ]}
                isLight={isLight}
                isSelected={isSelected}
                isPossibleMove={isPossible}
                onClick={() => handleSquareClick(rank, file)}
              />
            );
          })}

          {/* Pieces */}
          {Array.from({ length: 64 }, (_, index) => {
            const rank = Math.floor(index / 8);
            const file = index % 8;
            const piece = getPiece(rank, file);
            const square = getSquare(rank, file);
            
            if (!piece) return null;

            return (
              <Piece
                key={`piece-${rank}-${file}-${piece.color}-${piece.type}`}
                position={[
                  boardOffset + file * SQUARE_SIZE,
                  BOARD_HEIGHT + 0.25,
                  boardOffset + rank * SQUARE_SIZE
                ]}
                piece={piece}
                isSelected={selectedSquare === square}
                onClick={() => handleSquareClick(rank, file)}
              />
            );
          })}
        </group>

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#90EE90" />
        </mesh>

        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
};

export default Chessboard3D;
