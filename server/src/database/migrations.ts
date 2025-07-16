import { Pool } from 'pg'
import { dbConfig } from '../config/database'

const pool = new Pool(dbConfig)

export async function runMigrations() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Создаем таблицу для игроков
    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        nickname VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Создаем таблицу для результатов игр
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_results (
        id SERIAL PRIMARY KEY,
        player_id INTEGER REFERENCES players(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Создаем таблицу для раундов
    await client.query(`
      CREATE TABLE IF NOT EXISTS rounds (
        id SERIAL PRIMARY KEY,
        game_result_id INTEGER REFERENCES game_results(id),
        round_number INTEGER NOT NULL,
        accuracy_score INTEGER NOT NULL CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
        distance_from_center INTEGER NOT NULL CHECK (distance_from_center >= 0 AND distance_from_center <= 100),
        time_value_ms INTEGER NOT NULL CHECK (time_value_ms > 0),
        time_score INTEGER NOT NULL CHECK (time_score >= 0 AND time_score <= 100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query('COMMIT')
    console.log('Migrations completed successfully')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Migration failed:', error)
    throw error
  } finally {
    client.release()
  }
}

// Запуск миграций если файл выполняется напрямую
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
