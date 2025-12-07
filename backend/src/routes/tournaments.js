import express from 'express';
import TournamentController from '../controllers/TournamentController.js';
import { authMiddleware } from '../utils/middleware.js';

const router = express.Router();

router.get('/upcoming', TournamentController.getUpcomingTournaments.bind(TournamentController));
router.get('/ongoing', TournamentController.getOngoingTournaments.bind(TournamentController));
router.post('/', authMiddleware, TournamentController.createTournament.bind(TournamentController));
router.get('/:id', TournamentController.getTournament.bind(TournamentController));
router.post('/:id/join', authMiddleware, TournamentController.joinTournament.bind(TournamentController));
router.post('/:id/start', authMiddleware, TournamentController.startTournament.bind(TournamentController));
router.get('/:id/matches', TournamentController.getTournamentMatches.bind(TournamentController));

export default router;

