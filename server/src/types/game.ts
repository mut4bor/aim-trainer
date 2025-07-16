export interface Round {
  accuracy_score: number // 0-100
  distance_from_center: number // 0-100 (100 = точное попадание в центр, 0 = максимальное отклонение)
  time: {
    value_ms: number // время в миллисекундах
    score: number // 0-100
  }
}

export interface GameResultRequest {
  nickname: string
  rounds: Round[] // ровно 3 раунда
}

export interface Player {
  id: number
  nickname: string
  created_at: Date
}
