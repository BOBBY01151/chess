import TournamentService from '../services/TournamentService.js';

class TournamentController {
  async createTournament(req, res) {
    try {
      const { name, startTime, maxPlayers, timeControl } = req.body;
      
      if (!name || !startTime || !maxPlayers) {
        return res.status(400).json({ error: 'Name, start time, and max players are required' });
      }

      const tournament = await TournamentService.createTournament(
        name,
        req.user._id,
        startTime,
        maxPlayers,
        timeControl
      );
      
      res.status(201).json({ tournament });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async joinTournament(req, res) {
    try {
      const tournament = await TournamentService.joinTournament(
        req.params.id,
        req.user._id
      );
      res.json({ tournament });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async startTournament(req, res) {
    try {
      const tournament = await TournamentService.startTournament(req.params.id);
      res.json({ tournament });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTournament(req, res) {
    try {
      const tournament = await TournamentService.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }
      res.json({ tournament });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUpcomingTournaments(req, res) {
    try {
      const tournaments = await TournamentService.getUpcomingTournaments();
      res.json({ tournaments });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOngoingTournaments(req, res) {
    try {
      const tournaments = await TournamentService.getOngoingTournaments();
      res.json({ tournaments });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTournamentMatches(req, res) {
    try {
      const matches = await TournamentService.getTournamentMatches(req.params.id);
      res.json({ matches });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new TournamentController();

