import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { getMatchHistory } from '../api/matches.js';
import { getUserBets } from '../api/betting.js';
import useAuthStore from '../store/authStore.js';

const Profile = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [matchHistory, setMatchHistory] = useState([]);
  const [userBets, setUserBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    try {
      const [matches, bets] = await Promise.all([
        getMatchHistory(),
        getUserBets()
      ]);
      setMatchHistory(matches.matches || []);
      setUserBets(bets.bets || []);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="px-4 py-6 text-center">Loading...</div>
      </Layout>
    );
  }

  const winRate = user?.matchesPlayed > 0
    ? ((user.matchesWon / user.matchesPlayed) * 100).toFixed(1)
    : 0;

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2">Rating</h3>
            <p className="text-3xl font-bold text-blue-600">{user?.rating || 1200}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2">Matches Played</h3>
            <p className="text-3xl font-bold text-gray-800">{user?.matchesPlayed || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2">Win Rate</h3>
            <p className="text-3xl font-bold text-green-600">{winRate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Match History</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {matchHistory.length === 0 ? (
                <p className="text-gray-500">No matches played yet</p>
              ) : (
                matchHistory.map((match) => (
                  <div key={match._id} className="border-b pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          vs {match.playerWhite?._id === user?._id 
                            ? (match.playerBlack?.username || 'Bot')
                            : (match.playerWhite?.username || 'Player')}
                        </p>
                        <p className="text-sm text-gray-600">{match.timeControl}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          match.winner?._id === user?._id || match.winner === user?._id
                            ? 'bg-green-100 text-green-800'
                            : match.result === 'draw'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {match.winner?._id === user?._id || match.winner === user?._id
                            ? 'Won'
                            : match.result === 'draw'
                            ? 'Draw'
                            : 'Lost'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Betting History</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {userBets.length === 0 ? (
                <p className="text-gray-500">No bets placed yet</p>
              ) : (
                userBets.map((bet) => (
                  <div key={bet._id} className="border-b pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Bet on {bet.predictedWinner}</p>
                        <p className="text-sm text-gray-600">Amount: {bet.amount}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          bet.status === 'won'
                            ? 'bg-green-100 text-green-800'
                            : bet.status === 'lost'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bet.status}
                        </span>
                        {bet.payout > 0 && (
                          <p className="text-sm text-green-600 mt-1">+{bet.payout}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

