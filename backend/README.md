# Chess Platform Backend

Full-stack MERN chess platform backend with Socket.IO for real-time gameplay.

## Features

- ✅ JWT Authentication
- ✅ Real-time matchmaking with queues
- ✅ 1v1 chess matches with time controls (1min, 3min, 5min, 10min, 30min)
- ✅ Bot players (random and smart moves)
- ✅ Tournament system with bracket generation
- ✅ Live spectating
- ✅ Betting system
- ✅ Socket.IO for real-time updates

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```
PORT=5100
MONGODB_URI=mongodb://localhost:27017/chess-platform
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

3. Make sure MongoDB is running on your system.

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5100`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Matches
- `GET /api/matches/live` - Get live matches
- `GET /api/matches/history` - Get match history (protected)
- `GET /api/matches/:id` - Get match details

### Tournaments
- `GET /api/tournaments/upcoming` - Get upcoming tournaments
- `GET /api/tournaments/ongoing` - Get ongoing tournaments
- `POST /api/tournaments` - Create tournament (protected)
- `GET /api/tournaments/:id` - Get tournament details
- `POST /api/tournaments/:id/join` - Join tournament (protected)
- `POST /api/tournaments/:id/start` - Start tournament (protected)
- `GET /api/tournaments/:id/matches` - Get tournament matches

### Betting
- `POST /api/betting` - Place bet (protected)
- `GET /api/betting/match/:matchId` - Get match bets
- `GET /api/betting/user` - Get user bets (protected)

## Socket.IO Events

### Client → Server
- `match:request` - Request a match
- `match:cancel` - Cancel matchmaking
- `match:move` - Make a move
- `spectator:join` - Join as spectator
- `spectator:leave` - Leave spectator mode
- `bet:place` - Place a bet
- `tournament:create` - Create tournament
- `tournament:join` - Join tournament

### Server → Client
- `match:queued` - Matchmaking started
- `match:start` - Match started
- `match:move` - Move made
- `match:clock:update` - Clock update
- `match:end` - Match ended
- `match:live` - New live match
- `spectator:joined` - Joined as spectator
- `spectator:update` - Spectator count update
- `bet:placed` - Bet placed
- `bet:update` - Betting update
- `tournament:created` - Tournament created
- `tournament:joined` - Joined tournament
- `tournament:updated` - Tournament updated

## Project Structure

```
backend/
├── src/
│   ├── models/          # MongoDB models
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── sockets/         # Socket.IO handlers
│   ├── routes/          # Express routes
│   ├── utils/           # Utilities (JWT, middleware, etc.)
│   ├── chess-engine/    # Bot engine
│   └── app.js           # Main application file
└── package.json
```

