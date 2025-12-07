import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Chessboard from '../components/Chessboard.jsx';
import Clock from '../components/Clock.jsx';
import MoveList from '../components/MoveList.jsx';
import BettingPanel from '../components/BettingPanel.jsx';
import { getMatch } from '../api/matches.js';
import useAuthStore from '../store/authStore.js';
import socket from '../sockets/socket.js';

const WatchMatch = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [match, setMatch] = useState(null);
  const [remainingTime, setRemainingTime] = useState({ white: 0, black: 0 });
  const [spectatorCount, setSpectatorCount] = useState(0);

  useEffect(() => {
    loadMatch();
    socket.connect();

    socket.emit('spectator:join', { matchId, userId: user?._id });
    socket.on('spectator:joined', ({ match: matchData }) => {
      setMatch(matchData);
      setRemainingTime(matchData.remainingTime || { white: 0, black: 0 });
      setSpectatorCount(matchData.spectators?.length || 0);
    });

    socket.on('match:move', ({ match: matchData }) => {
      setMatch(matchData);
      setRemainingTime(matchData.remainingTime || remainingTime);
    });

    socket.on('match:clock:update', ({ remainingTime: time }) => {
      setRemainingTime(time);
    });

    socket.on('match:end', ({ match: matchData }) => {
      setMatch(matchData);
    });

    socket.on('spectator:update', ({ spectatorCount: count }) => {
      setSpectatorCount(count);
    });

    return () => {
      socket.emit('spectator:leave', { matchId, userId: user?._id });
      socket.off('spectator:joined');
      socket.off('match:move');
      socket.off('match:clock:update');
      socket.off('match:end');
      socket.off('spectator:update');
    };
  }, [matchId, user]);

  const loadMatch = async () => {
    try {
      const response = await getMatch(matchId);
      setMatch(response.match);
      setRemainingTime(response.match?.remainingTime || { white: 0, black: 0 });
    } catch (error) {
      console.error('Failed to load match:', error);
      navigate('/watch');
    }
  };

  if (!match) {
    return (
      <Layout>
        <div className="px-4 py-6">
          <div className="text-center">Loading match...</div>
        </div>
      </Layout>
    );
  }

  const isWhite = match.fen?.includes(' w ');

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate('/watch')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            ← Back to Live Matches
          </button>
          <div className="text-sm text-gray-600">
            {spectatorCount} spectator{spectatorCount !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-center flex-1">
                  <p className="font-bold text-lg">
                    {typeof match.playerWhite === 'object' ? match.playerWhite.username : 'Player 1'}
                  </p>
                </div>
                <div className="text-center flex-1">
                  <p className="font-bold text-lg">
                    {typeof match.playerBlack === 'object' ? match.playerBlack.username : 'Bot'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <Clock
                  time={remainingTime.white}
                  label="White"
                  isActive={isWhite && match.status === 'ongoing'}
                  isLow={remainingTime.white < 10000}
                />
                <div className="text-center">
                  <span className={`px-4 py-2 rounded-full text-sm ${
                    match.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    match.status === 'finished' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {match.status}
                  </span>
                </div>
                <Clock
                  time={remainingTime.black}
                  label="Black"
                  isActive={!isWhite && match.status === 'ongoing'}
                  isLow={remainingTime.black < 10000}
                />
              </div>
              <Chessboard
                fen={match.fen}
                onMove={() => {}}
                orientation="white"
                disabled={true}
                isPlayer={false}
              />
            </div>
          </div>
          <div className="space-y-6">
            <MoveList moves={match.moves || []} />
            <BettingPanel matchId={match._id} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WatchMatch;

