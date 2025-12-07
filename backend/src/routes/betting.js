import express from 'express';
import BettingController from '../controllers/BettingController.js';
import { authMiddleware } from '../utils/middleware.js';

const router = express.Router();

router.post('/', authMiddleware, BettingController.placeBet.bind(BettingController));
router.get('/match/:matchId', BettingController.getMatchBets.bind(BettingController));
router.get('/user', authMiddleware, BettingController.getUserBets.bind(BettingController));

export default router;

