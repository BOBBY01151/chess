import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { getUpcomingTournaments, getOngoingTournaments } from '../api/tournaments.js';
import useAuthStore from '../store/authStore.js';
import socket from '../sockets/socket.js';

const Tournaments = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [ongoingTournaments, setOngoingTournaments] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadTournaments();
    socket.connect();

    socket.on('tournament:new', () => {
      loadTournaments();
    });

    socket.on('tournament:updated', () => {
      loadTournaments();
    });

    return () => {
      socket.off('tournament:new');
      socket.off('tournament:updated');
    };
  }, []);

  const loadTournaments = async () => {
    try {
      const [upcoming, ongoing] = await Promise.all([
        getUpcomingTournaments(),
        getOngoingTournaments()
      ]);
      setUpcomingTournaments(upcoming.tournaments || []);
      setOngoingTournaments(ongoing.tournaments || []);
    } catch (error) {
      console.error('Failed to load tournaments:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tournaments</h1>
          {isAuthenticated && (
            <Link
              to="/tournaments/create"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create Tournament
            </Link>
          )}
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upcoming'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming ({upcomingTournaments.length})
              </button>
              <button
                onClick={() => setActiveTab('ongoing')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ongoing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ongoing ({ongoingTournaments.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'upcoming' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTournaments.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No upcoming tournaments</p>
              </div>
            ) : (
              upcomingTournaments.map((tournament) => (
                <div key={tournament._id} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-2">{tournament.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>Start: {formatDate(tournament.startTime)}</p>
                    <p>Players: {tournament.participants?.length || 0}/{tournament.maxPlayers}</p>
                    <p>Time Control: {tournament.timeControl}</p>
                  </div>
                  <Link
                    to={`/tournaments/${tournament._id}`}
                    className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    View Tournament
                  </Link>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoingTournaments.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No ongoing tournaments</p>
              </div>
            ) : (
              ongoingTournaments.map((tournament) => (
                <div key={tournament._id} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-2">{tournament.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>Round: {tournament.currentRound + 1}/{tournament.bracket?.rounds || 1}</p>
                    <p>Players: {tournament.participants?.length || 0}</p>
                    <p>Time Control: {tournament.timeControl}</p>
                  </div>
                  <Link
                    to={`/tournaments/${tournament._id}`}
                    className="block w-full text-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Watch Tournament
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tournaments;

