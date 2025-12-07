import express from 'express';
import BotController from '../controllers/BotController.js';

const router = express.Router();

router.get('/', BotController.getBots.bind(BotController));

export default router;

