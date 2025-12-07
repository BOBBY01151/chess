import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  predictedWinner: {
    type: String,
    enum: ['white', 'black', 'draw'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'won', 'lost', 'cancelled'],
    default: 'pending'
  },
  payout: {
    type: Number,
    default: 0
  },
  placedAt: {
    type: Date,
    default: Date.now
  },
  settledAt: Date
});

betSchema.index({ matchId: 1, userId: 1 });

export default mongoose.model('Bet', betSchema);

