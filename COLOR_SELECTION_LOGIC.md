# Complete Color Selection Logic

## Overview

Users can select either **White** or **Black** color before starting a bot match. The system automatically assigns the opposite color to the bot.

## How It Works

### Case 1: User Selects WHITE

**Frontend:**
- User clicks "White" button
- `selectedColor = 'white'`
- Sends to backend: `userColor: 'white'`

**Backend:**
- Receives: `userColor = 'white'`
- Determines: `botPlayer = 'black'` (opposite of user)
- Creates match:
  ```javascript
  createMatch(
    userId,    // playerWhite = user (white)
    null,      // playerBlack = bot (null means bot)
    timeControl,
    true,      // isBotMatch
    'black'    // botPlayer = 'black' (bot plays black)
  )
  ```
- Match structure:
  - `playerWhite = userId` (user is white)
  - `playerBlack = null` (bot is black)
  - `botPlayer = 'black'`
  - `isBotMatch = true`

**Game Flow:**
- White moves first in chess
- User (white) makes the first move
- Bot (black) responds after user's move

### Case 2: User Selects BLACK

**Frontend:**
- User clicks "Black" button
- `selectedColor = 'black'`
- Sends to backend: `userColor: 'black'`

**Backend:**
- Receives: `userColor = 'black'`
- Determines: `botPlayer = 'white'` (opposite of user)
- Creates match:
  ```javascript
  createMatch(
    null,      // playerWhite = bot (null means bot)
    userId,    // playerBlack = user (black)
    timeControl,
    true,      // isBotMatch
    'white'    // botPlayer = 'white' (bot plays white)
  )
  ```
- Match structure:
  - `playerWhite = null` (bot is white)
  - `playerBlack = userId` (user is black)
  - `botPlayer = 'white'`
  - `isBotMatch = true`

**Game Flow:**
- White moves first in chess
- Bot (white) makes the first move automatically (after 500ms delay)
- User (black) responds after bot's move

## Frontend Color Detection

When the match starts, frontend determines user's color:

```javascript
if (currentMatch.isBotMatch) {
  // Use botPlayer to determine user color
  if (currentMatch.botPlayer === 'black') {
    isWhite = true;  // Bot is black, so user is white
  } else if (currentMatch.botPlayer === 'white') {
    isWhite = false; // Bot is white, so user is black
  }
}
```

## Turn Detection

The system determines whose turn it is by parsing the FEN string:

```javascript
const fenTurn = currentMatch.fen?.split(' ')[1]; // 'w' or 'b'
const isWhiteTurn = fenTurn === 'w';
const isMyTurn = isWhite ? isWhiteTurn : !isWhiteTurn;
```

- Initial FEN: `"... w ..."` means it's white's turn
- After white moves: FEN changes to `"... b ..."` means it's black's turn

## Piece Selection

The Chessboard component only allows selecting pieces of the user's color:

```javascript
const userPieceColor = userColor === 'white' ? 'w' : 'b';
// Only select pieces matching userPieceColor
if (piece && piece.color === userPieceColor && isMyTurn && !disabled) {
  setSelectedSquare(square);
}
```

## Summary

| User Selects | Bot Plays | User Side | Bot Side | First Move |
|--------------|-----------|-----------|----------|------------|
| **White**    | Black     | White     | Black    | User       |
| **Black**    | White     | Black     | White    | Bot        |

## Testing Checklist

✅ User selects white → Can move white pieces
✅ User selects black → Bot moves first, then user can move black pieces
✅ Turn detection works correctly for both colors
✅ Piece selection works for both colors
✅ Board orientation is correct for both colors

