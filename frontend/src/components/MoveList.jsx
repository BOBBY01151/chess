const MoveList = ({ moves = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 h-96 overflow-y-auto">
      <h3 className="text-lg font-bold mb-3">Move History</h3>
      <div className="space-y-1">
        {moves.length === 0 ? (
          <p className="text-gray-500 text-sm">No moves yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-1 text-sm">
            {moves.map((move, index) => {
              const moveNumber = Math.floor(index / 2) + 1;
              const isWhiteMove = index % 2 === 0;
              
              return (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    isWhiteMove ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  {isWhiteMove ? (
                    <span className="font-medium text-gray-600">{moveNumber}.</span>
                  ) : null}{' '}
                  <span className={isWhiteMove ? 'text-gray-800' : 'text-gray-600'}>
                    {move.san || `${move.from}-${move.to}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveList;

