# Chess Platform - Full Stack MERN Application

A comprehensive chess platform built with MERN stack (MongoDB, Express, React, Node.js) featuring real-time gameplay, tournaments, betting, and spectating.

## 🎮 Features

### Core Features
- ✅ User authentication (JWT)
- ✅ 1v1 chess matches with multiple time controls (1min, 3min, 5min, 10min, 30min)
- ✅ Real-time matchmaking with automatic bot assignment
- ✅ Live gameplay using Socket.IO
- ✅ Match spectating
- ✅ Betting system
- ✅ Tournament system with bracket generation
- ✅ Auto-run tournament matches
- ✅ Bot players (random and smart AI)

### Time Controls
- 1 minute
- 3 minutes
- 5 minutes
- 10 minutes
- 30 minutes

### Matchmaking
- Queues for each time control
- If a real user is available → match them
- If not → assign a bot player after 3 seconds

### Real-time Features
- Live move updates
- Real-time clock countdown
- Spectator count updates
- Tournament bracket updates
- Betting updates

## 🏗️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Zustand (state management)
- Socket.IO Client
- Chess.js
- Axios

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- Chess.js (move validation)
- JWT + bcrypt
- Custom bot engine

## 📦 Project Structure

```
chess-platform/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB models
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── sockets/         # Socket.IO handlers
│   │   ├── routes/          # Express routes
│   │   ├── utils/           # Utilities
│   │   ├── chess-engine/    # Bot engine
│   │   └── app.js           # Main app file
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/           # Page components
    │   ├── components/      # Reusable components
    │   ├── hooks/           # Custom hooks
    │   ├── store/           # Zustand stores
    │   ├── api/             # API client
    │   ├── sockets/         # Socket.IO client
    │   └── main.jsx         # Entry point
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5100
MONGODB_URI=mongodb://localhost:27017/chess-platform
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

4. Start MongoDB (if running locally):
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud)
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5100`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create `.env` file:
```env
VITE_SOCKET_URL=http://localhost:5100
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🎯 Usage

1. **Register/Login**: Create an account or login
2. **Play**: Go to Play page and select a time control to find a match
3. **Watch**: Browse live matches and spectate
4. **Bet**: Place bets on ongoing matches while spectating
5. **Tournaments**: Create or join tournaments
6. **Profile**: View your match history and statistics

## 📝 API Documentation

See [backend/README.md](./backend/README.md) for detailed API documentation.

## 🔧 Environment Variables

### Backend
- `PORT` - Server port (default: 5100)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `NODE_ENV` - Environment (development/production)
- `CLIENT_URL` - Frontend URL for CORS

### Frontend
- `VITE_SOCKET_URL` - Socket.IO server URL (default: http://localhost:5100)

## 🤖 Bot Engine

The platform includes two bot difficulty levels:
- **Easy**: Random legal moves
- **Hard**: Simple evaluation with piece values and check/checkmate detection

Bots automatically join matches when no real player is available.

## 🏆 Tournament System

- Automatic bracket generation
- Auto-assign bots if slots are missing
- Auto-run matches round by round
- Real-time bracket updates
- Supports 4, 8, 16, or 32 players

## 📄 License

ISC

## 👨‍💻 Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

### Building for Production

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run build
```

## 🐛 Troubleshooting

1. **MongoDB Connection Error**: Make sure MongoDB is running and the connection string is correct
2. **Socket.IO Connection Failed**: Check that the backend is running and CORS is configured correctly
3. **Port Already in Use**: Change the PORT in `.env` file

## 📚 Additional Resources

- [Chess.js Documentation](https://github.com/jhlywa/chess.js)
- [Socket.IO Documentation](https://socket.io/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

