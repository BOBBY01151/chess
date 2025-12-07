# Fix: White Color Selection Not Working

## Problem
When user selects white color for a bot match, they cannot move pieces on the chessboard.

## Root Cause
The user color detection logic was too complex and unreliable. It was trying to compare user IDs between the match object and the current user, but this comparison was failing due to:
1. Different data formats (ObjectId vs string)
2. Populated vs non-populated references
3. Null checks not working correctly

## Solution
Simplified the user color detection to use the `botPlayer` field directly:

### For Bot Matches:
- If `botPlayer === 'black'` → User is **white**
- If `botPlayer === 'white'` → User is **black**

This is much more reliable than comparing IDs.

## Changes Made

### 1. Play Page (`frontend/src/pages/Play.jsx`)

**Before:**
```javascript
// Complex ID comparison logic
isWhite = currentMatch.playerWhite !== null && 
  (currentMatch.playerWhite?._id === user._id || currentMatch.playerWhite === user._id);
```

**After:**
```javascript
// Simple botPlayer-based logic
if (currentMatch.isBotMatch) {
  isWhite = currentMatch.botPlayer === 'black';
}
```

### 2. Chessboard Component (`frontend/src/components/Chessboard.jsx`)

Added debug logging to help identify issues:
- Logs when squares are clicked
- Logs piece selection attempts
- Logs move attempts

## Testing

1. Select white color
2. Start bot match
3. You should be able to:
   - Select white pieces
   - Make moves with white pieces
   - See your turn indicator active

## Debug Information

The console will now show:
- Match state when game starts
- Square click details
- Piece selection status
- Move attempts

If white pieces still can't be moved, check console for:
- `isMyTurn` value (should be `true` when it's white's turn)
- `disabled` value (should be `false` when it's your turn)
- `userColor` value (should be `'white'` when white is selected)

