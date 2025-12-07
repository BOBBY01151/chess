# Chess Platform Frontend

React + Vite frontend for the chess platform with Tailwind CSS.

## Features

- ✅ User authentication (Login/Register)
- ✅ Real-time chess gameplay
- ✅ Matchmaking with time controls
- ✅ Live match spectating
- ✅ Tournament viewing and creation
- ✅ Betting system
- ✅ Tournament bracket visualization
- ✅ Profile with match history

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory (optional):
```
VITE_SOCKET_URL=http://localhost:5100
```

3. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── api/            # API client functions
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── store/          # Zustand state management
│   ├── sockets/        # Socket.IO client
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── index.html
└── package.json
```

## Pages

- `/` - Dashboard
- `/login` - Login page
- `/register` - Registration page
- `/play` - Play chess (matchmaking)
- `/watch` - Watch live matches
- `/watch/:matchId` - Watch specific match
- `/tournaments` - Tournament list
- `/tournaments/create` - Create tournament
- `/tournaments/:id` - Tournament details
- `/profile` - User profile

## Technologies

- React 18
- Vite
- React Router
- Zustand (state management)
- Socket.IO Client
- Tailwind CSS
- Chess.js
- Axios

