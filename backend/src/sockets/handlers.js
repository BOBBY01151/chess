import { Chess } from 'chess.js';
import MatchService from '../services/MatchService.js';
import BotService from '../services/BotService.js';
import BettingService from '../services/BettingService.js';
import SpectatorService from '../services/SpectatorService.js';
import TournamentService from '../services/TournamentService.js';
import { addToQueue, removeFromAllQueues, getQueue } from './matchmaking.js';

// Active matches with clock timers
const activeMatches = new Map();

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Direct Bot Match Request
    socket.on('match:bot', async (data) => {
      try {
        const { timeControl, userId, botDifficulty = 'easy', userColor = 'white' } = data;
        
        if (!timeControl || !userId) {
          socket.emit('match:error', { error: 'Invalid request data' });
          return;
        }

        // Determine bot player based on user's color choice
        // If user chooses white, bot plays black (and vice versa)
        const botPlayer = userColor === 'white' ? 'black' : 'white';
        
        // Create bot match with user's selected color
        const match = await MatchService.createMatch(
          userColor === 'white' ? userId : null,
          userColor === 'black' ? userId : null,
          timeControl,
          true,
          botPlayer
        );

        await MatchService.startMatch(match._id);
        startMatchClock(match._id, match.timeControl, io);

        // Join match room
        socket.join(`match:${match._id}`);

        // Get updated match with 'ongoing' status
        const updatedMatch = await MatchService.getMatch(match._id);
        
        socket.emit('match:start', { match: updatedMatch || match });
        io.emit('match:live', { matchId: match._id });
        
        // If user chose black, bot plays first (white moves first)
        if (userColor === 'black') {
          setTimeout(() => {
            BotService.checkAndPlayBotMove(match._id).then(updatedMatch => {
              if (updatedMatch) {
                io.to(`match:${match._id}`).emit('match:move', { match: updatedMatch });
                io.to(`match:${match._id}`).emit('match:clock:update', {
                  remainingTime: updatedMatch.remainingTime
                });
              }
            });
          }, 500);
        }
      } catch (error) {
        console.error('Bot match error:', error);
        socket.emit('match:error', { error: error.message });
      }
    });

    // Match Request - Matchmaking
    socket.on('match:request', async (data) => {
      try {
        const { timeControl, userId } = data;
        
        if (!timeControl || !userId) {
          socket.emit('match:error', { error: 'Invalid request data' });
          return;
        }

        // Add to queue
        addToQueue(timeControl, userId, socket.id);
        socket.emit('match:queued', { timeControl });

        // Check for match
        const queue = getQueue(timeControl);
        
        if (queue.length >= 2) {
          // Match two players
          const player1 = queue.shift();
          const player2 = queue.shift();
          
          removeFromAllQueues(player1.userId);
          removeFromAllQueues(player2.userId);

          const match = await MatchService.createMatch(
            player1.userId,
            player2.userId,
            timeControl
          );

          await MatchService.startMatch(match._id);
          
          // Start clock
          startMatchClock(match._id, match.timeControl, io);

          io.to(player1.socketId).emit('match:start', { match });
          io.to(player2.socketId).emit('match:start', { match });
          io.emit('match:live', { matchId: match._id });
        } else {
          // Assign bot after short wait
          setTimeout(async () => {
            const currentQueue = getQueue(timeControl);
            if (currentQueue.some(p => p.userId === userId)) {
              removeFromAllQueues(userId);

              const match = await MatchService.createMatch(
                userId,
                null,
                timeControl,
                true,
                'black'
              );

              await MatchService.startMatch(match._id);
              startMatchClock(match._id, match.timeControl, io);

              socket.emit('match:start', { match });
              io.emit('match:live', { matchId: match._id });
              
              // User plays white (goes first), bot will move after user's move
            }
          }, 3000); // Wait 3 seconds for another player
        }
      } catch (error) {
        console.error('Match request error:', error);
        socket.emit('match:error', { error: error.message });
      }
    });

    // Cancel matchmaking
    socket.on('match:cancel', (data) => {
      const { userId } = data;
      removeFromAllQueues(userId);
      socket.emit('match:cancelled');
    });

    // Join match room
    socket.on('match:join', (data) => {
      const { matchId } = data;
      socket.join(`match:${matchId}`);
    });

    // Make move
    socket.on('match:move', async (data) => {
      try {
        const { matchId, userId, from, to, promotion } = data;
        
        // Join room if not already joined
        socket.join(`match:${matchId}`);
        
        const match = await MatchService.makeMove(matchId, userId, from, to, promotion);
        
        // Update clock turn based on new FEN
        if (match.status === 'ongoing') {
          const game = new Chess(match.fen);
          const newTurn = game.turn() === 'w' ? 'white' : 'black';
          updateClockTurn(matchId, newTurn);
        }
        
        // Broadcast move to all connected clients
        io.to(`match:${matchId}`).emit('match:move', { match });

        // Check if match is finished
        if (match.status === 'finished') {
          stopMatchClock(matchId);
          
          // Settle bets
          try {
            await BettingService.settleBets(matchId);
          } catch (betError) {
            console.error('Bet settlement error:', betError);
          }

          // Update tournament if applicable
          if (match.tournamentId) {
            try {
              await TournamentService.updateTournamentMatch(match.tournamentId, matchId);
            } catch (tournamentError) {
              console.error('Tournament update error:', tournamentError);
            }
          }
        } else if (match.isBotMatch) {
          // Bot's turn - make bot move after delay
          setTimeout(() => {
            BotService.checkAndPlayBotMove(matchId).then(updatedMatch => {
              if (updatedMatch) {
                // Get updated match with populated players
                MatchService.getMatch(matchId).then(fullMatch => {
                  io.to(`match:${matchId}`).emit('match:move', { match: fullMatch || updatedMatch });
                  io.to(`match:${matchId}`).emit('match:clock:update', {
                    remainingTime: (fullMatch || updatedMatch).remainingTime
                  });
                }).catch(() => {
                  io.to(`match:${matchId}`).emit('match:move', { match: updatedMatch });
                  io.to(`match:${matchId}`).emit('match:clock:update', {
                    remainingTime: updatedMatch.remainingTime
                  });
                });
                
                if (updatedMatch.status === 'finished') {
                  stopMatchClock(matchId);
                  
                  BettingService.settleBets(matchId).catch(err => 
                    console.error('Bet settlement error:', err)
                  );
                  
                  if (updatedMatch.tournamentId) {
                    TournamentService.updateTournamentMatch(
                      updatedMatch.tournamentId, 
                      matchId
                    ).catch(err => console.error('Tournament update error:', err));
                  }
                }
              }
            }).catch(err => {
              console.error('Bot move failed:', err);
            });
          }, 800);
        }

        // Update clocks
        io.to(`match:${matchId}`).emit('match:clock:update', {
          remainingTime: match.remainingTime
        });
      } catch (error) {
        console.error('Move error:', error);
        socket.emit('match:error', { error: error.message });
      }
    });

    // Join match room (for spectators)
    socket.on('spectator:join', async (data) => {
      try {
        const { matchId, userId } = data;
        
        socket.join(`match:${matchId}`);
        
        if (userId) {
          await SpectatorService.addSpectator(matchId, userId);
        }

        const match = await MatchService.getMatch(matchId);
        
        socket.emit('spectator:joined', { match });
        socket.to(`match:${matchId}`).emit('spectator:update', {
          spectatorCount: match.spectators.length
        });
      } catch (error) {
        socket.emit('spectator:error', { error: error.message });
      }
    });

    // Leave match room
    socket.on('spectator:leave', async (data) => {
      try {
        const { matchId, userId } = data;
        
        socket.leave(`match:${matchId}`);
        
        if (userId) {
          await SpectatorService.removeSpectator(matchId, userId);
        }

        socket.to(`match:${matchId}`).emit('spectator:update', {
          spectatorCount: (await MatchService.getMatch(matchId))?.spectators.length || 0
        });
      } catch (error) {
        console.error('Spectator leave error:', error);
      }
    });

    // Place bet
    socket.on('bet:place', async (data) => {
      try {
        const { matchId, userId, amount, predictedWinner } = data;
        
        const bet = await BettingService.placeBet(matchId, userId, amount, predictedWinner);
        
        socket.emit('bet:placed', { bet });
        
        // Broadcast to match room
        const bets = await BettingService.getMatchBets(matchId);
        io.to(`match:${matchId}`).emit('bet:update', { bets });
      } catch (error) {
        socket.emit('bet:error', { error: error.message });
      }
    });

    // Tournament events
    socket.on('tournament:create', async (data) => {
      try {
        const { name, startTime, maxPlayers, timeControl, userId } = data;
        
        const tournament = await TournamentService.createTournament(
          name,
          userId,
          startTime,
          maxPlayers,
          timeControl
        );
        
        socket.emit('tournament:created', { tournament });
        io.emit('tournament:new', { tournament });
      } catch (error) {
        socket.emit('tournament:error', { error: error.message });
      }
    });

    socket.on('tournament:join', async (data) => {
      try {
        const { tournamentId, userId } = data;
        
        const tournament = await TournamentService.joinTournament(tournamentId, userId);
        
        socket.emit('tournament:joined', { tournament });
        io.emit('tournament:updated', { tournament });
      } catch (error) {
        socket.emit('tournament:error', { error: error.message });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      removeFromAllQueues(socket.userId);
    });
  });
};

// Clock management
const startMatchClock = (matchId, timeControl, io) => {
  const timeInMs = getTimeInMs(timeControl);
  
  if (activeMatches.has(matchId)) {
    clearInterval(activeMatches.get(matchId));
  }

  let whiteTime = timeInMs;
  let blackTime = timeInMs;
  let currentTurn = 'white';
  let lastUpdate = Date.now();

  const interval = setInterval(async () => {
    const now = Date.now();
    const elapsed = now - lastUpdate;
    lastUpdate = now;

    if (currentTurn === 'white') {
      whiteTime -= elapsed;
      if (whiteTime <= 0) {
        whiteTime = 0;
        clearInterval(interval);
        activeMatches.delete(matchId);
        
        // Time out - black wins
        const match = await MatchService.getMatch(matchId);
        if (match && match.status === 'ongoing') {
          match.status = 'finished';
          match.result = 'black_wins';
          match.winner = match.playerBlack;
          match.endedAt = new Date();
          await match.save();
          
          io.to(`match:${matchId}`).emit('match:end', { match });
          await BettingService.settleBets(matchId);
        }
        return;
      }
    } else {
      blackTime -= elapsed;
      if (blackTime <= 0) {
        blackTime = 0;
        clearInterval(interval);
        activeMatches.delete(matchId);
        
        // Time out - white wins
        const match = await MatchService.getMatch(matchId);
        if (match && match.status === 'ongoing') {
          match.status = 'finished';
          match.result = 'white_wins';
          match.winner = match.playerWhite;
          match.endedAt = new Date();
          await match.save();
          
          io.to(`match:${matchId}`).emit('match:end', { match });
          await BettingService.settleBets(matchId);
        }
        return;
      }
    }

    // Update match in database periodically
    try {
      await MatchService.updateClock(matchId, currentTurn, currentTurn === 'white' ? whiteTime : blackTime);
    } catch (error) {
      console.error('Clock update error:', error);
    }

    // Broadcast clock update
    io.to(`match:${matchId}`).emit('match:clock:update', {
      remainingTime: {
        white: whiteTime,
        black: blackTime
      }
    });
  }, 100); // Update every 100ms

  activeMatches.set(matchId, { interval, currentTurn, setTurn: (turn) => { currentTurn = turn; } });
};

const stopMatchClock = (matchId) => {
  if (activeMatches.has(matchId)) {
    clearInterval(activeMatches.get(matchId).interval);
    activeMatches.delete(matchId);
  }
};

const getTimeInMs = (timeControl) => {
  const timeMap = {
    '1min': 60 * 1000,
    '3min': 3 * 60 * 1000,
    '5min': 5 * 60 * 1000,
    '10min': 10 * 60 * 1000,
    '30min': 30 * 60 * 1000
  };
  return timeMap[timeControl] || 180000;
};

// Export clock control functions for move handler
export const updateClockTurn = (matchId, turn) => {
  if (activeMatches.has(matchId)) {
    activeMatches.get(matchId).setTurn(turn);
  }
};

