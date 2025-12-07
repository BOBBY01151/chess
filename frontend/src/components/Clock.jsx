const Clock = ({ time, label, isActive = false, isLow = false }) => {
  const formatTime = (ms) => {
    if (ms <= 0) return '0:00';
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`p-4 rounded-lg text-center min-w-[120px] ${
        isActive
          ? 'bg-blue-500 text-white shadow-lg ring-4 ring-blue-300'
          : 'bg-gray-200 text-gray-800'
      } ${isLow && time > 0 ? 'bg-red-500 text-white animate-pulse' : ''}`}
    >
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold font-mono">{formatTime(time)}</div>
    </div>
  );
};

export default Clock;

