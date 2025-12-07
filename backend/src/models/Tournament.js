import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  maxPlayers: {
    type: Number,
    required: true,
    default: 8
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'finished', 'cancelled'],
    default: 'upcoming'
  },
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  bracket: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  currentRound: {
    type: Number,
    default: 0
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  timeControl: {
    type: String,
    enum: ['1min', '3min', '5min', '10min', '30min'],
    default: '5min'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Tournament', tournamentSchema);

