import { Pool } from 'pg'
import { dbConfig } from '../config/database'
import { Player, Round } from '../types/game'

export class GameService {
  private pool: Pool

  constructor() {
    this.pool = new Pool(dbConfig)
  }

  async findOrCreatePlayer(nickname: string): Promise<Player> {
    const client = await this.pool.connect()
    try {
      // Попытка найти игрока
      let result = await client.query(
        'SELECT id, nickname, created_at FROM players WHERE nickname = $1',
        [nickname],
      )

      if (result.rows.length > 0) {
        return result.rows[0]
      }

      // Создание нового игрока
      result = await client.query(
        'INSERT INTO players (nickname) VALUES ($1) RETURNING id, nickname, created_at',
        [nickname],
      )

      return result.rows[0]
    } finally {
      client.release()
    }
  }

  async saveGameResult(playerId: number, rounds: Round[]): Promise<number> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      // Создаем запись результата игры
      const gameResultQuery = await client.query(
        'INSERT INTO game_results (player_id) VALUES ($1) RETURNING id',
        [playerId],
      )

      const gameResultId = gameResultQuery.rows[0].id

      // Сохраняем раунды
      for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i]
        await client.query(
          `INSERT INTO rounds 
           (game_result_id, round_number, accuracy_score, distance_from_center, time_value_ms, time_score) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            gameResultId,
            i + 1,
            round.accuracy_score,
            round.distance_from_center,
            round.time.value_ms,
            round.time.score,
          ],
        )
      }

      await client.query('COMMIT')
      return gameResultId
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async getPlayerStats(nickname: string): Promise<any> {
    const client = await this.pool.connect()
    try {
      const result = await client.query(
        `SELECT 
          p.nickname,
          COUNT(DISTINCT gr.id) as total_games,
          ROUND(AVG(r.accuracy_score), 2) as avg_accuracy,
          ROUND(AVG(r.distance_from_center), 2) as avg_distance_from_center,
          ROUND(AVG(r.time_value_ms), 2) as avg_time_value_ms,
          ROUND(AVG(r.time_score), 2) as avg_time_score,
          MAX(r.accuracy_score) as best_accuracy,
          MAX(r.distance_from_center) as best_distance_from_center,
          MIN(r.time_value_ms) as fastest_time_ms,
          MAX(r.time_score) as best_time_score
        FROM players p
        LEFT JOIN game_results gr ON p.id = gr.player_id
        LEFT JOIN rounds r ON gr.id = r.game_result_id
        WHERE p.nickname = $1
        GROUP BY p.id, p.nickname`,
        [nickname],
      )

      return result.rows[0] || null
    } finally {
      client.release()
    }
  }

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    const client = await this.pool.connect()
    try {
      const result = await client.query(
        `SELECT 
          p.nickname,
          COUNT(DISTINCT gr.id) as total_games,
          ROUND(AVG(r.accuracy_score), 2) as avg_accuracy,
          ROUND(AVG(r.distance_from_center), 2) as avg_distance_from_center,
          ROUND(AVG(r.time_value_ms), 2) as avg_time_value_ms,
          ROUND(AVG(r.time_score), 2) as avg_time_score,
          ROUND(AVG(r.accuracy_score + r.distance_from_center + r.time_score), 2) as combined_score
        FROM players p
        JOIN game_results gr ON p.id = gr.player_id
        JOIN rounds r ON gr.id = r.game_result_id
        GROUP BY p.id, p.nickname
        HAVING COUNT(DISTINCT gr.id) >= 1
        ORDER BY combined_score DESC, avg_time_value_ms ASC
        LIMIT $1`,
        [limit],
      )

      return result.rows
    } finally {
      client.release()
    }
  }

  async getRecentGames(limit: number = 20): Promise<any[]> {
    const client = await this.pool.connect()
    try {
      const result = await client.query(
        `SELECT 
          p.nickname,
          gr.id as game_id,
          gr.created_at,
          ROUND(AVG(r.accuracy_score), 2) as avg_accuracy,
          ROUND(AVG(r.distance_from_center), 2) as avg_distance_from_center,
          ROUND(AVG(r.time_value_ms), 2) as avg_time_value_ms,
          ROUND(AVG(r.time_score), 2) as avg_time_score,
          ROUND(AVG(r.accuracy_score + r.distance_from_center + r.time_score), 2) as combined_score
        FROM players p
        JOIN game_results gr ON p.id = gr.player_id
        JOIN rounds r ON gr.id = r.game_result_id
        GROUP BY p.id, p.nickname, gr.id, gr.created_at
        ORDER BY gr.created_at DESC
        LIMIT $1`,
        [limit],
      )

      return result.rows
    } finally {
      client.release()
    }
  }

  async getGameDetails(gameId: number): Promise<any> {
    const client = await this.pool.connect()
    try {
      const result = await client.query(
        `SELECT 
          p.nickname,
          gr.id as game_id,
          gr.created_at,
          r.round_number,
          r.accuracy_score,
          r.distance_from_center,
          r.time_value_ms,
          r.time_score
        FROM players p
        JOIN game_results gr ON p.id = gr.player_id
        JOIN rounds r ON gr.id = r.game_result_id
        WHERE gr.id = $1
        ORDER BY r.round_number`,
        [gameId],
      )

      if (result.rows.length === 0) {
        return null
      }

      const gameInfo = result.rows[0]
      return {
        nickname: gameInfo.nickname,
        game_id: gameInfo.game_id,
        created_at: gameInfo.created_at,
        rounds: result.rows.map((row) => ({
          round_number: row.round_number,
          accuracy_score: row.accuracy_score,
          distance_from_center: row.distance_from_center,
          time: {
            value_ms: row.time_value_ms,
            score: row.time_score,
          },
        })),
      }
    } finally {
      client.release()
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}
