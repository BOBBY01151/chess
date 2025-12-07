import express from 'express';
import MatchController from '../controllers/MatchController.js';
import { authMiddleware } from '../utils/middleware.js';

const router = express.Router();

router.get('/live', MatchController.getLiveMatches.bind(MatchController));
router.get('/history', authMiddleware, MatchController.getMatchHistory.bind(MatchController));
router.get('/:id', MatchController.getMatch.bind(MatchController));

export default router;

