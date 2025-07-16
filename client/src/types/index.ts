export type GameState = 'waiting' | 'preparing' | 'playing' | 'finished'

export interface Point {
  x: number
  y: number
}

export interface RoundResult {
  accuracyScore: number
  distanceFromCenter: number
  time: {
    valueMs: number
    score: number
  }
}

export interface MousePath {
  points: Point[]
  startTime: number
}

export interface Round {
  accuracy_score: number // 0-100
  distance_from_center: number // 0-100 (100 = точное попадание в центр, 0 = максимальное отклонение)
  time: {
    value_ms: number // время в милисекундах
    score: number // 0-100
  } // время
}

export interface GameResultRequest {
  nickname: string
  rounds: Round[] // ровно 3 раунда
}

export interface GameResultResponse {
  message: string
  player: {
    id: number
    nickname: string
  }
  resultsCount: number
}

export interface ApiError {
  error: string
  message?: string
}
