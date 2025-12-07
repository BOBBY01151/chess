# Fix: White First Move Not Working

## Problem

When user selects white color, they should be able to make the first move immediately, but the board is disabled or pieces can't be selected.

## Root Cause

The board was being disabled based on both `isMyTurn` AND match status:
```javascript
disabled={!isMyTurn || currentMatch.status !== 'ongoing'}
```

This created a double-check situation where:
1. The board could be disabled even when it's the user's turn
2. The Chessboard component also checks `isMyTurn` internally, causing conflicts
3. Timing issues where match status might not be 'ongoing' immediately

## Solution

Simplified the `disabled` prop to only check match status:
```javascript
disabled={currentMatch.status !== 'ongoing'}
```

The Chessboard component handles turn checking internally, so we don't need to disable it based on turn in the parent.

## Changes Made

### Play.jsx
- Removed `!isMyTurn` from disabled check
- Now only disables based on match status
- Added better debug logging to track the issue

## How It Works Now

### When User Selects White:

1. **Match Creation:**
   - `botPlayer = 'black'` (bot plays black)
   - `playerWhite = userId` (user is white)
   - Match status: 'waiting' → 'ongoing'

2. **Frontend Detection:**
   - `isWhite = true` (user is white)
   - `fenTurn = 'w'` (white's turn)
   - `isMyTurn = true` (it's user's turn)
   - `disabled = false` (match is ongoing)

3. **Chessboard:**
   - `userColor = 'white'`
   - `disabled = false` (only disabled if status not 'ongoing')
   - User can select white pieces
   - User can make moves immediately ✅

## Testing

1. Select white color
2. Start bot match
3. You should be able to:
   - ✅ Click white pieces immediately
   - ✅ See possible moves highlighted
   - ✅ Make the first move
   - ✅ Bot responds after your move

## Debug Information

Check browser console for:
- `🔍 MATCH STATE DEBUG` - Shows all match state info
- `canMove: true` - Should be true when it's your turn and match is ongoing
- `disabled: false` - Should be false when match is ongoing

If `canMove` is false, check:
- `status` - Should be 'ongoing'
- `isMyTurn` - Should be true
- `isWhite` - Should be true when white is selected

