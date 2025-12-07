class BotController {
  async getBots(req, res) {
    try {
      // Return available AI chess bots with their configurations
      const bots = [
        {
          id: 'easy',
          name: 'Easy Bot',
          difficulty: 'easy',
          description: 'Perfect for beginners. Makes random legal moves.',
          rating: 800,
          icon: '🤖',
          color: 'green'
        },
        {
          id: 'medium',
          name: 'Medium Bot',
          difficulty: 'medium',
          description: 'Good challenge for intermediate players. Uses basic evaluation.',
          rating: 1200,
          icon: '🤖',
          color: 'blue'
        },
        {
          id: 'hard',
          name: 'Hard Bot',
          difficulty: 'hard',
          description: 'Tough opponent. Uses smart evaluation and looks ahead.',
          rating: 1600,
          icon: '🤖',
          color: 'red'
        },
        {
          id: 'master',
          name: 'Master Bot',
          difficulty: 'master',
          description: 'Very challenging. Advanced algorithms and deep thinking.',
          rating: 2000,
          icon: '🤖',
          color: 'purple'
        }
      ];

      res.json({ bots });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new BotController();

