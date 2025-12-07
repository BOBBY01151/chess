// Matchmaking queues for different time controls
export const matchmakingQueues = {
  '1min': [],
  '3min': [],
  '5min': [],
  '10min': [],
  '30min': []
};

// Add player to queue
export const addToQueue = (timeControl, userId, socketId) => {
  if (!matchmakingQueues[timeControl]) return;
  
  // Remove from all queues first
  removeFromAllQueues(userId);
  
  matchmakingQueues[timeControl].push({ userId, socketId, joinedAt: Date.now() });
};

// Remove player from queue
export const removeFromQueue = (timeControl, userId) => {
  if (!matchmakingQueues[timeControl]) return;
  matchmakingQueues[timeControl] = matchmakingQueues[timeControl].filter(
    player => player.userId !== userId
  );
};

// Remove player from all queues
export const removeFromAllQueues = (userId) => {
  Object.keys(matchmakingQueues).forEach(timeControl => {
    removeFromQueue(timeControl, userId);
  });
};

// Get queue for time control
export const getQueue = (timeControl) => {
  return matchmakingQueues[timeControl] || [];
};

