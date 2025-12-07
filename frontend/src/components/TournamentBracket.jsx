const TournamentBracket = ({ tournament }) => {
  if (!tournament?.bracket) {
    return <div className="text-gray-500">Bracket not available</div>;
  }

  const { bracket } = tournament;

  const renderMatch = (match, roundIndex, matchIndex) => {
    return (
      <div
        key={`${roundIndex}-${matchIndex}`}
        className="p-3 bg-white rounded-lg shadow border-2 border-gray-200 min-w-[200px] mb-4"
      >
        <div className="text-xs text-gray-500 mb-2">Round {roundIndex + 1}</div>
        <div className="space-y-2">
          <div className={`p-2 rounded ${
            match.winner === match.player1 ? 'bg-green-100' : 'bg-gray-50'
          }`}>
            <div className="text-sm font-medium">
              {match.player1 === 'BOT' ? 'Bot' : `Player ${match.player1?.slice(-4)}`}
            </div>
          </div>
          <div className={`p-2 rounded ${
            match.winner === match.player2 ? 'bg-green-100' : 'bg-gray-50'
          }`}>
            <div className="text-sm font-medium">
              {match.player2 === 'BOT' ? 'Bot' : `Player ${match.player2?.slice(-4)}`}
            </div>
          </div>
        </div>
        {match.status === 'finished' && match.winner && (
          <div className="mt-2 text-xs text-green-600 font-medium">
            Winner: {match.winner === 'BOT' ? 'Bot' : `Player ${match.winner?.slice(-4)}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 min-w-max p-4">
        {bracket.matches.map((round, roundIndex) => (
          <div key={roundIndex} className="flex flex-col justify-center">
            <h3 className="text-lg font-bold mb-4 text-center">
              Round {roundIndex + 1}
            </h3>
            <div className="space-y-4">
              {round.map((match, matchIndex) => renderMatch(match, roundIndex, matchIndex))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentBracket;

