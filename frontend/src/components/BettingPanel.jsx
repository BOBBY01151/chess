import { useState, useEffect } from 'react';
import { placeBet, getMatchBets } from '../api/betting.js';
import useAuthStore from '../store/authStore.js';

const BettingPanel = ({ matchId }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [bets, setBets] = useState([]);
  const [amount, setAmount] = useState(10);
  const [predictedWinner, setPredictedWinner] = useState('white');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBets();
  }, [matchId]);

  const loadBets = async () => {
    try {
      const response = await getMatchBets(matchId);
      setBets(response.bets || []);
    } catch (error) {
      console.error('Failed to load bets:', error);
    }
  };

  const handlePlaceBet = async () => {
    if (!isAuthenticated) {
      alert('Please login to place bets');
      return;
    }

    setLoading(true);
    try {
      await placeBet(matchId, amount, predictedWinner);
      await loadBets();
      setAmount(10);
      alert('Bet placed successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to place bet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold mb-4">Betting</h3>
      
      {isAuthenticated ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Predict Winner</label>
            <select
              value={predictedWinner}
              onChange={(e) => setPredictedWinner(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="white">White</option>
              <option value="black">Black</option>
              <option value="draw">Draw</option>
            </select>
          </div>

          <button
            onClick={handlePlaceBet}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Placing...' : 'Place Bet'}
          </button>
        </>
      ) : (
        <p className="text-gray-500 text-sm">Login to place bets</p>
      )}

      <div className="mt-4">
        <h4 className="font-medium mb-2">Recent Bets</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {bets.length === 0 ? (
            <p className="text-gray-500 text-sm">No bets yet</p>
          ) : (
            bets.map((bet, index) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                <span className="font-medium">{bet.userId?.username || 'User'}</span>
                {' '}bet {bet.amount} on{' '}
                <span className="font-medium">{bet.predictedWinner}</span>
                {' '}
                <span className={`text-xs ${
                  bet.status === 'won' ? 'text-green-600' :
                  bet.status === 'lost' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  ({bet.status})
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BettingPanel;

