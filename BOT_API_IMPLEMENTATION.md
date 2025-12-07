# Bot API Implementation

## Overview

Implemented an API endpoint to dynamically load AI chess bots when users click the "Play Chess" button.

## Backend Changes

### 1. Bot Controller (`backend/src/controllers/BotController.js`)
- Created controller with `getBots()` method
- Returns array of available bots with:
  - ID, name, difficulty
  - Description and rating
  - Icon and color for UI

### 2. Bot Routes (`backend/src/routes/bots.js`)
- Created route handler for bot endpoints
- Route: `GET /api/bots`

### 3. App Integration (`backend/src/app.js`)
- Added bot routes: `app.use('/api/bots', botRoutes)`

## Frontend Changes

### 1. Bot API Client (`frontend/src/api/bots.js`)
- Created `getBots()` function to fetch bots from API

### 2. Play Page Updates (`frontend/src/pages/Play.jsx`)
- Added state for bots: `bots`, `loadingBots`
- Added `useEffect` to load bots on component mount
- Updated UI to display bots dynamically from API
- Shows loading spinner while fetching bots
- Fallback bots if API fails

## API Endpoint

### GET `/api/bots`

**Response:**
```json
{
  "bots": [
    {
      "id": "easy",
      "name": "Easy Bot",
      "difficulty": "easy",
      "description": "Perfect for beginners. Makes random legal moves.",
      "rating": 800,
      "icon": "🤖",
      "color": "green"
    },
    {
      "id": "medium",
      "name": "Medium Bot",
      "difficulty": "medium",
      "description": "Good challenge for intermediate players.",
      "rating": 1200,
      "icon": "🤖",
      "color": "blue"
    },
    {
      "id": "hard",
      "name": "Hard Bot",
      "difficulty": "hard",
      "description": "Tough opponent. Uses smart evaluation.",
      "rating": 1600,
      "icon": "🤖",
      "color": "red"
    },
    {
      "id": "master",
      "name": "Master Bot",
      "difficulty": "master",
      "description": "Very challenging. Advanced algorithms.",
      "rating": 2000,
      "icon": "🤖",
      "color": "purple"
    }
  ]
}
```

## User Flow

1. User clicks "Play" button in navigation
2. Play page loads and immediately calls `/api/bots`
3. Shows loading spinner: "Loading bots..."
4. Bots are displayed in a grid with:
   - Bot icon and name
   - Rating
   - Description
   - Color-coded by difficulty
5. User selects a bot and time control
6. Clicks "Play vs Selected Bot" to start match

## Features

✅ Dynamic bot loading from API
✅ Loading state while fetching
✅ Error handling with fallback bots
✅ Visual bot cards with ratings
✅ Color-coded difficulty levels
✅ Responsive grid layout

## Testing

To test the implementation:

1. **Start backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test API endpoint:**
   ```bash
   curl http://localhost:5100/api/bots
   ```

3. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Navigate to Play page:**
   - Go to http://localhost:5173/play
   - Should see loading spinner, then bots appear
   - Select a bot and time control
   - Click "Play vs Selected Bot"

## Future Enhancements

- Add bot statistics (win rate, games played)
- Allow bot customization
- Add more bot difficulty levels
- Store bot configurations in database
- Add bot avatars/images

