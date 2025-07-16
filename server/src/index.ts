import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GameService } from './services/gameService'
import { validateGameResult } from './middleware/validation'
import { GameResultRequest } from './types/game'
import { runMigrations } from './database/migrations'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const gameService = new GameService()

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Эндпоинт для принятия результатов игры
app.post('/api/game-results', validateGameResult, async (req, res) => {
  try {
    const { nickname, rounds }: GameResultRequest = req.body

    // Найти или создать игрока
    const player = await gameService.findOrCreatePlayer(nickname)

    // Сохранить результат игры
    const gameResultId = await gameService.saveGameResult(player.id, rounds)

    res.status(201).json({
      message: 'Game result saved successfully',
      gameResultId,
      player: {
        id: player.id,
        nickname: player.nickname,
      },
      roundsCount: rounds.length,
    })
  } catch (error) {
    console.error('Error saving game result:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Эндпоинт для получения статистики игрока
app.get('/api/player-stats/:nickname', async (req, res) => {
  try {
    const { nickname } = req.params
    const stats = await gameService.getPlayerStats(nickname)

    if (!stats) {
      res.status(404).json({ error: 'Player not found' })
      return
    }

    res.json(stats)
  } catch (error) {
    console.error('Error fetching player stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Эндпоинт для получения таблицы лидеров
app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const leaderboard = await gameService.getLeaderboard(limit)
    res.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Эндпоинт для получения последних игр
app.get('/api/recent-games', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20
    const recentGames = await gameService.getRecentGames(limit)
    res.json(recentGames)
  } catch (error) {
    console.error('Error fetching recent games:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Эндпоинт для получения детальной информации об игре
app.get('/api/game-details/:gameId', async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId)
    if (isNaN(gameId)) {
      res.status(400).json({ error: 'Invalid game ID' })
      return
    }

    const gameDetails = await gameService.getGameDetails(gameId)

    if (!gameDetails) {
      res.status(404).json({ error: 'Game not found' })
      return
    }

    res.json(gameDetails)
  } catch (error) {
    console.error('Error fetching game details:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Эндпоинт для проверки состояния
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Обработка ошибок
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong!' })
  },
)

// Запуск сервера
async function startServer() {
  try {
    // Запуск миграций
    await runMigrations()

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`)
      console.log(`Available endpoints:`)
      console.log(`  POST /api/game-results - Submit game results`)
      console.log(`  GET /api/player-stats/:nickname - Get player statistics`)
      console.log(`  GET /api/leaderboard - Get leaderboard`)
      console.log(`  GET /api/recent-games - Get recent games`)
      console.log(`  GET /api/game-details/:gameId - Get game details`)
      console.log(`  GET /api/health - Health check`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await gameService.close()
  process.exit(0)
})
