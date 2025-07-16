import { Request, Response, NextFunction } from 'express'
import { GameResultRequest } from '../types/game'

export function validateGameResult(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { nickname, rounds }: GameResultRequest = req.body

  // Проверка наличия обязательных полей
  if (!nickname || !rounds) {
    res.status(400).json({
      error: 'Missing required fields: nickname and rounds',
    })
    return
  }

  // Проверка типов
  if (typeof nickname !== 'string' || !Array.isArray(rounds)) {
    res.status(400).json({
      error:
        'Invalid data types: nickname must be string, rounds must be array',
    })
    return
  }

  // Проверка никнейма
  if (nickname.length < 1 || nickname.length > 50) {
    res.status(400).json({
      error: 'Nickname must be between 1 and 50 characters',
    })
    return
  }

  // Проверка количества раундов
  if (rounds.length !== 3) {
    res.status(400).json({
      error: 'Must contain exactly 3 rounds',
    })
    return
  }

  // Проверка каждого раунда
  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i]

    // Проверка основных полей
    if (
      typeof round.accuracy_score !== 'number' ||
      typeof round.distance_from_center !== 'number' ||
      typeof round.time !== 'object' ||
      round.time === null
    ) {
      res.status(400).json({
        error: `Round ${
          i + 1
        }: accuracy_score and distance_from_center must be numbers, time must be object`,
      })
      return
    }

    // Проверка объекта time
    if (
      typeof round.time.value_ms !== 'number' ||
      typeof round.time.score !== 'number'
    ) {
      res.status(400).json({
        error: `Round ${i + 1}: time.value_ms and time.score must be numbers`,
      })
      return
    }

    // Проверка диапазонов
    if (round.accuracy_score < 0 || round.accuracy_score > 100) {
      res.status(400).json({
        error: `Round ${i + 1}: accuracy_score must be between 0 and 100`,
      })
      return
    }

    if (round.distance_from_center < 0 || round.distance_from_center > 100) {
      res.status(400).json({
        error: `Round ${i + 1}: distance_from_center must be between 0 and 100`,
      })
      return
    }

    if (round.time.value_ms <= 0) {
      res.status(400).json({
        error: `Round ${i + 1}: time.value_ms must be positive`,
      })
      return
    }

    if (round.time.score < 0 || round.time.score > 100) {
      res.status(400).json({
        error: `Round ${i + 1}: time.score must be between 0 and 100`,
      })
      return
    }

    // Проверка на целые числа для оценок
    if (
      !Number.isInteger(round.accuracy_score) ||
      !Number.isInteger(round.distance_from_center) ||
      !Number.isInteger(round.time.score)
    ) {
      res.status(400).json({
        error: `Round ${
          i + 1
        }: accuracy_score, distance_from_center, and time.score must be integers`,
      })
      return
    }
  }

  next()
}
