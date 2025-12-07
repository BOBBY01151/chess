import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore.js';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Play from './pages/Play.jsx';
import Watch from './pages/Watch.jsx';
import WatchMatch from './pages/WatchMatch.jsx';
import Tournaments from './pages/Tournaments.jsx';
import TournamentDetail from './pages/TournamentDetail.jsx';
import CreateTournament from './pages/CreateTournament.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/play" element={<Play />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/watch/:matchId" element={<WatchMatch />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/create" element={<CreateTournament />} />
        <Route path="/tournaments/:tournamentId" element={<TournamentDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;

