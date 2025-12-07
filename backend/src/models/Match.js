import mongoose from 'mongoose';

const moveSchema = new mongoose.Schema({
  from: String,
  to: String,
  promotion: String,
  san: String,
  timestamp: Date
}, { _id: false });

const matchSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  playerWhite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  playerBlack: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  timeControl: {
    type: String,
    required: true,
    enum: ['1min', '3min', '5min', '10min', '30min']
  },
  initialTime: {
    white: Number,
    black: Number
  },
  remainingTime: {
    white: Number,
    black: Number
  },
  moves: [moveSchema],
  fen: {
    type: String,
    default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  },
  status: {
    type: String,
    enum: ['waiting', 'ongoing', 'finished', 'abandoned'],
    default: 'waiting'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  result: {
    type: String,
    enum: ['white_wins', 'black_wins', 'draw', 'ongoing'],
    default: 'ongoing'
  },
  spectators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isBotMatch: {
    type: Boolean,
    default: false
  },
  botPlayer: {
    type: String,
    enum: ['white', 'black', null],
    default: null
  },
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    default: null
  },
  startedAt: Date,
  endedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

matchSchema.methods.getTimeInMs = function(timeControl) {
  const timeMap = {
    '1min': 60 * 1000,
    '3min': 3 * 60 * 1000,
    '5min': 5 * 60 * 1000,
    '10min': 10 * 60 * 1000,
    '30min': 30 * 60 * 1000
  };
  return timeMap[timeControl] || 180000;
};

export default mongoose.model('Match', matchSchema);

