import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Chessboard from '../components/Chessboard.jsx';
import Chessboard3D from '../components/Chessboard3D.jsx';
import Clock from '../components/Clock.jsx';
import MoveList from '../components/MoveList.jsx';
import useAuthStore from '../store/authStore.js';
import useMatchStore from '../store/matchStore.js';
import socket from '../sockets/socket.js';
import { getBots } from '../api/bots.js';

const TIME_CONTROLS = [
  { value: '1min', label: '1 minute' },
  { value: '3min', label: '3 minutes' },
  { value: '5min', label: '5 minutes' },
  { value: '10min', label: '10 minutes' },
  { value: '30min', label: '30 minutes' }
];

const Play = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { currentMatch, setCurrentMatch, updateMatch } = useMatchStore();
  const [selectedTimeControl, setSelectedTimeControl] = useState('5min');
  const [selectedBotDifficulty, setSelectedBotDifficulty] = useState('easy');
  const [selectedColor, setSelectedColor] = useState('white'); // 'white' or 'black'
  const [isQueued, setIsQueued] = useState(false);
  const [matchMode, setMatchMode] = useState('selection'); // 'selection', 'bot', 'matchmaking', 'playing'
  const [remainingTime, setRemainingTime] = useState({ white: 0, black: 0 });
  const [bots, setBots] = useState([]);
  const [loadingBots, setLoadingBots] = useState(true);
  const [boardView, setBoardView] = useState('3d'); // '2d' or '3d' - Default to 3D
  const navigate = useNavigate();

  // Load bots from API when component mounts
  useEffect(() => {
    const loadBots = async () => {
      try {
        setLoadingBots(true);
        const response = await getBots();
        setBots(response.bots || []);
        if (response.bots && response.bots.length > 0) {
          setSelectedBotDifficulty(response.bots[0].difficulty);
        }
      } catch (error) {
        console.error('Failed to load bots:', error);
        // Fallback to default bots if API fails
        setBots([
          { id: 'easy', name: 'Easy Bot', difficulty: 'easy', description: 'Random legal moves', rating: 800, icon: '🤖' },
          { id: 'hard', name: 'Hard Bot', difficulty: 'hard', description: 'Smart evaluation', rating: 1600, icon: '🤖' }
        ]);
      } finally {
        setLoadingBots(false);
      }
    };

    loadBots();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    socket.connect();
    
    socket.on('match:queued', () => {
      setIsQueued(true);
      setMatchMode('matchmaking');
    });

    socket.on('match:start', ({ match }) => {
      setIsQueued(false);
      setCurrentMatch(match);
      setMatchMode('playing');
      setRemainingTime(match.remainingTime || {
        white: match.initialTime?.white || 0,
        black: match.initialTime?.black || 0
      });
      
      // Join match room to receive updates
      socket.emit('match:join', { matchId: match._id });
    });

    socket.on('match:move', ({ match }) => {
      updateMatch(match);
      setRemainingTime(match.remainingTime || remainingTime);
    });

    socket.on('match:clock:update', ({ remainingTime: time }) => {
      setRemainingTime(time);
    });

    socket.on('match:end', ({ match }) => {
      updateMatch(match);
      setTimeout(() => {
        setCurrentMatch(null);
        setMatchMode('selection');
        navigate('/');
      }, 5000);
    });

    socket.on('match:error', ({ error }) => {
      alert(error);
      setIsQueued(false);
      setMatchMode('selection');
    });

    return () => {
      socket.off('match:queued');
      socket.off('match:start');
      socket.off('match:move');
      socket.off('match:clock:update');
      socket.off('match:end');
      socket.off('match:error');
    };
  }, [isAuthenticated, navigate, setCurrentMatch, updateMatch]);

  const handlePlayVsBot = () => {
    if (!user) return;
    setMatchMode('bot');
    socket.emit('match:bot', {
      timeControl: selectedTimeControl,
      userId: user._id,
      botDifficulty: selectedBotDifficulty,
      userColor: selectedColor // 'white' or 'black'
    });
  };

  const handleFindMatch = () => {
    if (!user) return;
    setMatchMode('matchmaking');
    socket.emit('match:request', {
      timeControl: selectedTimeControl,
      userId: user._id
    });
    setIsQueued(true);
  };

  const handleCancelMatch = () => {
    socket.emit('match:cancel', { userId: user?._id });
    setIsQueued(false);
    setMatchMode('selection');
  };

  const handleMove = (from, to) => {
    if (!currentMatch || !user) {
      console.error('Cannot make move: missing match or user');
      return;
    }

    // Determine user's color - for bot matches, use botPlayer to infer user color
    let isWhite = false;
    
    if (currentMatch.isBotMatch) {
      // Bot match logic:
      // - If bot plays 'black', user plays 'white'
      // - If bot plays 'white', user plays 'black'
      if (currentMatch.botPlayer === 'black') {
        isWhite = true; // User is white, bot is black
      } else if (currentMatch.botPlayer === 'white') {
        isWhite = false; // User is black, bot is white
      }
    } else {
      // Regular match - check which player matches user ID
      const isUserIdMatch = (player, userId) => {
        if (!player) return false;
        const playerId = typeof player === 'object' && player._id ? player._id : player;
        return playerId?.toString() === userId.toString();
      };
      isWhite = isUserIdMatch(currentMatch.playerWhite, user._id);
    }

    console.log('Making move:', { from, to, matchId: currentMatch._id, userId: user._id, isWhite });
    socket.emit('match:move', {
      matchId: currentMatch._id,
      userId: user._id,
      from,
      to
    });
  };

  // Playing match view
  if (currentMatch && matchMode === 'playing') {
    // Determine user's color - for bot matches, use botPlayer to infer user color
    let isWhite = false;
    
    if (currentMatch.isBotMatch) {
      // In bot matches: determine user color based on botPlayer field
      // If bot plays 'black', user plays 'white'
      // If bot plays 'white', user plays 'black'
      if (currentMatch.botPlayer === 'black') {
        isWhite = true; // User is white, bot is black
      } else if (currentMatch.botPlayer === 'white') {
        isWhite = false; // User is black, bot is white
      } else {
        // Fallback: check which player slot is not null
        if (currentMatch.playerWhite !== null && currentMatch.playerWhite !== undefined) {
          isWhite = true; // playerWhite exists, user is white
        } else if (currentMatch.playerBlack !== null && currentMatch.playerBlack !== undefined) {
          isWhite = false; // playerBlack exists, user is black
        }
      }
    } else {
      // Regular match - check which player matches user ID
      // Helper function to compare user IDs
      const isUserIdMatch = (player, userId) => {
        if (!player) return false;
        const playerId = typeof player === 'object' && player._id ? player._id : player;
        return playerId?.toString() === userId.toString();
      };
      isWhite = isUserIdMatch(currentMatch.playerWhite, user._id);
    }
    
    // Parse FEN to determine whose turn it is
    const fenTurn = currentMatch.fen?.split(' ')[1]; // 'w' or 'b'
    const isWhiteTurn = fenTurn === 'w';
    const isMyTurn = isWhite ? isWhiteTurn : !isWhiteTurn;
    
    const orientation = isWhite ? 'white' : 'black';
    
    // Debug logging - CRITICAL for troubleshooting
    console.log('🔍 MATCH STATE DEBUG:', {
      isBotMatch: currentMatch.isBotMatch,
      botPlayer: currentMatch.botPlayer,
      playerWhite: currentMatch.playerWhite,
      playerBlack: currentMatch.playerBlack,
      playerWhiteType: typeof currentMatch.playerWhite,
      playerBlackType: typeof currentMatch.playerBlack,
      user_id: user._id,
      isWhite,
      orientation,
      fen: currentMatch.fen,
      fenTurn,
      isWhiteTurn,
      isMyTurn,
      status: currentMatch.status,
      disabled: currentMatch.status !== 'ongoing',
      canMove: currentMatch.status === 'ongoing' && isMyTurn
    });

    return (
      <Layout>
        <div className="px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <Clock
                    time={remainingTime.white}
                    label="White"
                    isActive={isMyTurn && isWhite}
                    isLow={remainingTime.white < 10000}
                  />
                  <div className="text-center">
                    <h3 className="text-lg font-bold">vs</h3>
                    <p className="text-sm text-gray-600">
                      {currentMatch.isBotMatch ? 'Bot' : (currentMatch.playerBlack?.username || 'Opponent')}
                    </p>
                    {/* View Toggle */}
                    <div className="flex gap-2 mt-2 justify-center">
                      <button
                        onClick={() => setBoardView('2d')}
                        className={`px-3 py-1 text-xs rounded ${
                          boardView === '2d'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        2D
                      </button>
                      <button
                        onClick={() => setBoardView('3d')}
                        className={`px-3 py-1 text-xs rounded ${
                          boardView === '3d'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        3D
                      </button>
                    </div>
                  </div>
                  <Clock
                    time={remainingTime.black}
                    label="Black"
                    isActive={isMyTurn && !isWhite}
                    isLow={remainingTime.black < 10000}
                  />
                </div>
                {boardView === '3d' ? (
                  <Chessboard3D
                    fen={currentMatch.fen}
                    onMove={handleMove}
                    orientation={orientation}
                    disabled={currentMatch.status !== 'ongoing'}
                    isPlayer={true}
                    userColor={isWhite ? 'white' : 'black'}
                  />
                ) : (
                  <Chessboard
                    fen={currentMatch.fen}
                    onMove={handleMove}
                    orientation={orientation}
                    disabled={currentMatch.status !== 'ongoing'}
                    isPlayer={true}
                    userColor={isWhite ? 'white' : 'black'}
                  />
                )}
                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-2 bg-gray-100 text-xs">
                    <div>Status: {currentMatch.status}</div>
                    <div>User is White: {isWhite ? 'Yes' : 'No'}</div>
                    <div>My Turn: {isMyTurn ? 'Yes' : 'No'}</div>
                    <div>Disabled: {(!isMyTurn || currentMatch.status !== 'ongoing') ? 'Yes' : 'No'}</div>
                    <div>Bot Player: {currentMatch.botPlayer}</div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <MoveList moves={currentMatch.moves || []} />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Match selection view
  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Play Chess</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Time Control</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {TIME_CONTROLS.map((tc) => (
                  <button
                    key={tc.value}
                    onClick={() => setSelectedTimeControl(tc.value)}
                    className={`px-4 py-2 rounded-md border-2 transition-colors ${
                      selectedTimeControl === tc.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bot Selection Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Play vs AI Bot</h3>
              {loadingBots ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading bots...</p>
                </div>
              ) : bots.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {bots.map((bot) => {
                      const isSelected = selectedBotDifficulty === bot.difficulty;
                      const colorClasses = {
                        green: isSelected ? 'border-green-500 bg-green-50' : '',
                        blue: isSelected ? 'border-blue-500 bg-blue-50' : '',
                        red: isSelected ? 'border-red-500 bg-red-50' : '',
                        purple: isSelected ? 'border-purple-500 bg-purple-50' : '',
                      };
                      
                      return (
                        <button
                          key={bot.id}
                          onClick={() => setSelectedBotDifficulty(bot.difficulty)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? `${colorClasses[bot.color] || 'border-green-500 bg-green-50'} shadow-md`
                              : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{bot.icon}</span>
                            <div>
                              <div className="font-medium text-lg">{bot.name}</div>
                              <div className="text-xs text-gray-500">Rating: {bot.rating}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mt-2">{bot.description}</div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Color Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Choose Your Color</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedColor('white')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedColor === 'white'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-8 h-8 bg-white border-2 border-gray-400 rounded shadow-sm"></div>
                          <span className="font-medium">White</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Play first (moves first)</p>
                      </button>
                      <button
                        onClick={() => setSelectedColor('black')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedColor === 'black'
                            ? 'border-gray-800 bg-gray-100 shadow-md'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-8 h-8 bg-gray-800 border-2 border-gray-600 rounded shadow-sm"></div>
                          <span className="font-medium">Black</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Play second (responds)</p>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handlePlayVsBot}
                    disabled={matchMode === 'bot' || loadingBots}
                    className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {matchMode === 'bot' ? 'Starting Bot Match...' : 'Play vs Selected Bot'}
                  </button>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No bots available at the moment.</p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Or Find a Real Player</h3>
              
              {isQueued ? (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                  <p className="text-lg mb-2">Looking for opponent...</p>
                  <p className="text-sm text-gray-600 mb-4">
                    If no player found, we'll match you with a bot automatically
                  </p>
                  <button
                    onClick={handleCancelMatch}
                    className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleFindMatch}
                  disabled={matchMode === 'bot'}
                  className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Find Match
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Play;
