import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import TournamentBracket from '../components/TournamentBracket.jsx';
import { getTournament, joinTournament, startTournament, getTournamentMatches } from '../api/tournaments.js';
import useAuthStore from '../store/authStore.js';
import socket from '../sockets/socket.js';

const TournamentDetail = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadTournament();
    socket.connect();

    socket.on('tournament:updated', ({ tournament: updatedTournament }) => {
      if (updatedTournament._id === tournamentId) {
        setTournament(updatedTournament);
        loadMatches();
      }
    });

    return () => {
      socket.off('tournament:updated');
    };
  }, [tournamentId]);

  const loadTournament = async () => {
    try {
      const response = await getTournament(tournamentId);
      setTournament(response.tournament);
      await loadMatches();
    } catch (error) {
      console.error('Failed to load tournament:', error);
      navigate('/tournaments');
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      const response = await getTournamentMatches(tournamentId);
      setMatches(response.matches || []);
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setJoining(true);
    try {
      await joinTournament(tournamentId);
      socket.emit('tournament:join', { tournamentId, userId: user._id });
      await loadTournament();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to join tournament');
    } finally {
      setJoining(false);
    }
  };

  const handleStart = async () => {
    try {
      await startTournament(tournamentId);
      await loadTournament();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to start tournament');
    }
  };

  const isParticipant = tournament?.participants?.some(
    p => (typeof p === 'object' ? p._id : p) === user?._id
  );
  const isCreator = tournament?.creator?._id === user?._id || tournament?.creator === user?._id;
  const canJoin = tournament?.status === 'upcoming' && 
                  tournament?.participants?.length < tournament?.maxPlayers &&
                  !isParticipant;

  if (loading) {
    return (
      <Layout>
        <div className="px-4 py-6 text-center">Loading tournament...</div>
      </Layout>
    );
  }

  if (!tournament) {
    return null;
  }

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/tournaments')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mb-4"
          >
            ← Back to Tournaments
          </button>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <div className="mt-4 flex gap-4 flex-wrap">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-bold text-lg capitalize">{tournament.status}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Players</p>
              <p className="font-bold text-lg">
                {tournament.participants?.length || 0}/{tournament.maxPlayers}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Time Control</p>
              <p className="font-bold text-lg">{tournament.timeControl}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Start Time</p>
              <p className="font-bold text-lg">
                {new Date(tournament.startTime).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          {canJoin && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {joining ? 'Joining...' : 'Join Tournament'}
            </button>
          )}
          {isCreator && tournament.status === 'upcoming' && (
            <button
              onClick={handleStart}
              className="ml-4 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Start Tournament
            </button>
          )}
        </div>

        {tournament.bracket && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Tournament Bracket</h2>
            <TournamentBracket tournament={tournament} />
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.length === 0 ? (
              <p className="text-gray-500">No matches yet</p>
            ) : (
              matches.map((match) => (
                <div key={match._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      match.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      match.status === 'finished' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                  <p className="font-medium">
                    {typeof match.playerWhite === 'object' ? match.playerWhite.username : 'Player 1'}
                    {' vs '}
                    {typeof match.playerBlack === 'object' ? match.playerBlack.username : 'Bot'}
                  </p>
                  {match.status === 'ongoing' && (
                    <a
                      href={`/watch/${match._id}`}
                      className="mt-2 block text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Watch
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TournamentDetail;

