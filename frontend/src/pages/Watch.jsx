import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { getLiveMatches } from '../api/matches.js';
import socket from '../sockets/socket.js';

const Watch = () => {
  const [liveMatches, setLiveMatches] = useState([]);

  useEffect(() => {
    loadLiveMatches();
    socket.connect();

    socket.on('match:live', () => {
      loadLiveMatches();
    });

    return () => {
      socket.off('match:live');
    };
  }, []);

  const loadLiveMatches = async () => {
    try {
      const response = await getLiveMatches();
      setLiveMatches(response.matches || []);
    } catch (error) {
      console.error('Failed to load live matches:', error);
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Live Matches</h1>
        
        {liveMatches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No live matches at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveMatches.map((match) => (
              <Link
                key={match._id}
                to={`/watch/${match._id}`}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-bold text-lg">
                      {typeof match.playerWhite === 'object' ? match.playerWhite.username : 'Player 1'}
                    </p>
                    <p className="text-sm text-gray-600">vs</p>
                    <p className="font-bold text-lg">
                      {typeof match.playerBlack === 'object' ? match.playerBlack.username : 'Bot'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Time Control</p>
                    <p className="font-medium">{match.timeControl}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Live
                  </span>
                  <span className="text-sm text-gray-600">
                    {match.spectators?.length || 0} spectators
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Watch;

