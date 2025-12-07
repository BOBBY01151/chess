import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

const Dashboard = () => {
  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Chess Platform</h1>
          <p className="text-xl text-gray-600">Play, Watch, Bet, and Compete in Tournaments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/play"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold mb-2">Play Chess</h3>
            <p className="text-gray-600">Start a quick match or join a game with time controls</p>
          </Link>

          <Link
            to="/watch"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">👁️</div>
            <h3 className="text-xl font-bold mb-2">Watch Live</h3>
            <p className="text-gray-600">Spectate ongoing matches and bet on outcomes</p>
          </Link>

          <Link
            to="/tournaments"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">Tournaments</h3>
            <p className="text-gray-600">Join or create tournaments and compete for glory</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

