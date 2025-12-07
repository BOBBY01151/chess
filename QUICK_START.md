# Quick Start Commands

## First Time Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Setup Environment Variables

**Backend - Create `backend/.env`:**
```env
PORT=5100
MONGODB_URI=mongodb://localhost:27017/chess-platform
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Frontend - Create `frontend/.env` (optional):**
```env
VITE_SOCKET_URL=http://localhost:5100
```

### 3. Make sure MongoDB is running

**Local MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud) - just update MONGODB_URI in .env
```

## Running the Application

### Option 1: Run in Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5100

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:5173

### Option 2: Run Both from Root Directory

You can create a root package.json to run both, or use tools like `concurrently`.

## All Available Commands

### Backend Commands (`cd backend`)

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server |

### Frontend Commands (`cd frontend`)

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production (creates `dist/` folder) |
| `npm run preview` | Preview production build locally |

## Common Workflow

1. **Start MongoDB** (if using local)
2. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```
3. **Start Frontend** (in new terminal):
   ```bash
   cd frontend
   npm run dev
   ```
4. **Open Browser:** http://localhost:5173

## Troubleshooting

### Port Already in Use
- Backend port 5100: Change `PORT` in `backend/.env`
- Frontend port 5173: Vite will auto-suggest another port

### MongoDB Connection Error
- Check if MongoDB is running
- Verify `MONGODB_URI` in `backend/.env`
- Test connection: `mongosh`

### Module Not Found Errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Backend:
```bash
cd backend
npm start  # Uses node (no auto-reload)
```

### Frontend:
```bash
cd frontend
npm run build
# Serve the dist/ folder with nginx, Netlify, Vercel, etc.
```

