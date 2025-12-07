# Color Selection Feature

## Overview

Users can now select their playing color (White or Black) before starting a bot match.

## Implementation

### Frontend Changes

1. **Play Page (`frontend/src/pages/Play.jsx`)**
   - Added `selectedColor` state (default: 'white')
   - Added color selection UI with two buttons:
     - White button (plays first)
     - Black button (plays second)
   - Color selection appears between bot selection and play button
   - Updated `handlePlayVsBot()` to send `userColor` to backend

### Backend Changes

1. **Socket Handlers (`backend/src/sockets/handlers.js`)**
   - Updated `match:bot` handler to accept `userColor` parameter
   - Determines bot player based on user's choice:
     - If user chooses white → bot plays black
     - If user chooses black → bot plays white
   - If user chooses black, bot makes first move automatically

## User Flow

1. User selects a bot
2. User selects time control
3. **User selects color (NEW):**
   - White: Play first (moves first)
   - Black: Play second (responds to bot's moves)
4. User clicks "Play vs Selected Bot"
5. Match starts with selected color

## Features

✅ Visual color selection buttons
✅ Clear indication of which color moves first
✅ Backend handles color assignment correctly
✅ Bot makes first move automatically if user chooses black
✅ Match creation respects user's color choice

## UI Design

Color selection buttons show:
- Visual square representation (white/black)
- Label (White/Black)
- Description ("Play first" / "Play second")
- Highlighted when selected
- Smooth transitions

## Technical Details

- Default color: White
- Color is sent as `userColor: 'white'` or `userColor: 'black'`
- Backend creates match with:
  - User in selected color position
  - Bot in opposite color position
- First move logic:
  - White always moves first in chess
  - If user is white: user moves first
  - If user is black: bot moves first (automatically)


