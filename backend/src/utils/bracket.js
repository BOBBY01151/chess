// Generate tournament bracket structure
export const generateBracket = (participants) => {
  const numPlayers = participants.length;
  if (numPlayers < 2) return null;

  // Find next power of 2
  const rounds = Math.ceil(Math.log2(numPlayers));
  const bracketSize = Math.pow(2, rounds);
  
  const bracket = {
    rounds: rounds,
    matches: []
  };

  // Generate matches for each round
  for (let round = 0; round < rounds; round++) {
    const roundMatches = [];
    const matchesInRound = Math.pow(2, rounds - round - 1);

    for (let match = 0; match < matchesInRound; match++) {
      roundMatches.push({
        matchId: `${round}-${match}`,
        player1: null,
        player2: null,
        winner: null,
        status: 'pending'
      });
    }

    bracket.matches.push(roundMatches);
  }

  // Assign players to first round
  const firstRoundMatches = bracket.matches[0];
  participants.forEach((playerId, index) => {
    const matchIndex = Math.floor(index / 2);
    if (matchIndex < firstRoundMatches.length) {
      if (index % 2 === 0) {
        firstRoundMatches[matchIndex].player1 = playerId.toString();
      } else {
        firstRoundMatches[matchIndex].player2 = playerId.toString();
      }
    }
  });

  // Fill empty slots with bots
  firstRoundMatches.forEach(match => {
    if (!match.player1) match.player1 = 'BOT';
    if (!match.player2) match.player2 = 'BOT';
  });

  return bracket;
};

// Get next match in bracket
export const getNextMatch = (bracket, currentRound, currentMatch) => {
  if (currentRound + 1 >= bracket.rounds) return null;
  
  const nextRound = bracket.matches[currentRound + 1];
  const nextMatchIndex = Math.floor(currentMatch / 2);
  
  if (nextMatchIndex < nextRound.length) {
    return {
      round: currentRound + 1,
      match: nextMatchIndex
    };
  }
  
  return null;
};

