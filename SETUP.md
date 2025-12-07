# Quick Setup Guide

## Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

## Step-by-Step Setup

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5100
MONGODB_URI=mongodb://localhost:27017/chess-platform
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
EOF

# Start MongoDB (if local)
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Start backend
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Optional: Create .env file
cat > .env << EOF
VITE_SOCKET_URL=http://localhost:5100
EOF

# Start frontend
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5100
- Socket.IO: http://localhost:5100

## First Steps

1. Register a new account at http://localhost:5173/register
2. Login with your credentials
3. Go to "Play" to start matchmaking
4. Select a time control and find a match
5. Play chess!

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check MONGODB_URI in backend/.env
- Try: `mongosh` to test connection

### Port Already in Use
- Change PORT in backend/.env
- Or kill the process using the port

### Socket.IO Connection Failed
- Verify backend is running
- Check CLIENT_URL in backend/.env matches frontend URL
- Check browser console for errors

### Module Not Found Errors
- Delete node_modules and package-lock.json
- Run `npm install` again
- Make sure you're in the correct directory

## Development Tips

- Backend auto-reloads with nodemon
- Frontend hot-reloads with Vite
- Check browser console for frontend errors
- Check terminal for backend errors
- MongoDB data persists in `/data/db` (local)

## Production Build

### Backend
```bash
cd backend
npm start  # Uses node instead of nodemon
```

### Frontend
```bash
cd frontend
npm run build
# Serve the dist/ directory with nginx or similar
```

