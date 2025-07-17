import { useState, useEffect, useCallback, MouseEvent } from 'react'
import { useGameResults } from './hooks/useGameResults'
import GameCanvas from '@/components/GameCanvas'
import GameStatus from '@/components/GameStatus'
import GameResults from '@/components/GameResults'
import { GameState, Point, RoundResult, MousePath } from './types'
import { BASE_GAME_CONFIG } from './constants'
import {
  calculateCanvasSize,
  generateTargetPosition,
  checkInCenter,
  calculateAccuracyScore,
  calculateDistanceFromCenter,
  calculateTimeScore,
} from './utils'

const AimTrainer = () => {
  const { submitResults, isLoading, error, lastResponse } = useGameResults()
  const [gameState, setGameState] = useState<GameState>('waiting')
  const [currentRound, setCurrentRound] = useState(0)
  const [targetPosition, setTargetPosition] = useState<Point>({ x: 0, y: 0 })
  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 })
  const [mousePath, setMousePath] = useState<MousePath>({
    points: [],
    startTime: 0,
  })
  const [roundResults, setRoundResults] = useState<RoundResult[]>([])
  const [isInCenter, setIsInCenter] = useState(false)
  const [canvasSize, setCanvasSize] = useState(400)

  const CIRCLE_RADIUS = (canvasSize - BASE_GAME_CONFIG.TARGET_SIZE * 2) / 2 - 20
  const centerX = canvasSize / 2
  const centerY = canvasSize / 2

  // Обновление размера canvas при изменении размера окна
  useEffect(() => {
    const updateSize = () => {
      setCanvasSize(calculateCanvasSize())
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Завершение раунда
  const finishRound = useCallback(async () => {
    const endTime = Date.now()
    const duration = endTime - mousePath.startTime

    const accuracyScore = Math.round(
      calculateAccuracyScore(
        mousePath.points,
        targetPosition,
        centerX,
        centerY,
      ),
    )
    const distanceFromCenter = Math.round(
      calculateDistanceFromCenter(mousePosition, targetPosition),
    )
    const timeMs = Math.round(duration)
    const timeScore = Math.round(calculateTimeScore(timeMs))

    const result: RoundResult = {
      accuracyScore,
      distanceFromCenter,
      time: {
        valueMs: timeMs,
        score: timeScore,
      },
    }

    setRoundResults((prev) => [...prev, result])

    if (currentRound + 1 >= BASE_GAME_CONFIG.ROUNDS_COUNT) {
      setGameState('finished')
    } else {
      setCurrentRound((prev) => prev + 1)
      setGameState('preparing')
    }
  }, [mousePath, mousePosition, targetPosition, currentRound, centerX, centerY])

  // Обработка движения мыши
  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setMousePosition({ x, y })
      setIsInCenter(checkInCenter({ x, y }, centerX, centerY))

      if (gameState === 'playing') {
        setMousePath((prev) => ({
          ...prev,
          points: [...prev.points, { x, y }],
        }))
      }
    },
    [gameState, centerX, centerY],
  )

  // Обработка клика мыши
  const handleMouseClick = useCallback(() => {
    if (gameState === 'playing') {
      finishRound()
    }
  }, [gameState, finishRound])

  // Запуск нового раунда
  const startNewRound = useCallback(() => {
    const newTarget = generateTargetPosition(centerX, centerY, CIRCLE_RADIUS)
    setTargetPosition(newTarget)
    setMousePath({ points: [], startTime: Date.now() })
    setGameState('playing')
  }, [centerX, centerY, CIRCLE_RADIUS])

  // Эффект для управления подготовкой
  useEffect(() => {
    if (gameState === 'preparing') {
      const timer = setTimeout(() => {
        startNewRound()
      }, BASE_GAME_CONFIG.PREPARATION_TIME)

      return () => clearTimeout(timer)
    }
  }, [gameState, startNewRound])

  // Отправка результатов
  useEffect(() => {
    if (gameState === 'finished') {
      submitResults({
        nickname: 'test',
        rounds: roundResults.map((result) => ({
          accuracy_score: result.accuracyScore,
          distance_from_center: result.distanceFromCenter,
          time: {
            value_ms: result.time.valueMs,
            score: result.time.score,
          },
        })),
      })
    }
  }, [gameState, roundResults, submitResults])

  // Начать игру
  const startGame = () => {
    setGameState('preparing')
    setCurrentRound(0)
    setRoundResults([])
  }

  // Перезапуск игры
  const resetGame = () => {
    setGameState('waiting')
    setCurrentRound(0)
    setRoundResults([])
    setMousePath({ points: [], startTime: 0 })
  }

  return (
    <div className="h-screen max-h-[100svh] bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="rounded-lg w-full max-w-7xl mx-auto flex gap-4 flex-col h-full">
        <div className="bg-white p-4 rounded-lg shadow-lg w-full flex-shrink-0">
          <h1 className="text-3xl font-bold text-center">
            Оценка техники наведения курсора на цель
          </h1>
        </div>

        <div className="flex gap-4 flex-row items-start flex-1 min-h-0">
          <GameCanvas
            canvasSize={canvasSize}
            gameState={gameState}
            targetPosition={targetPosition}
            mousePosition={mousePosition}
            isInCenter={isInCenter}
            onMouseMove={handleMouseMove}
            onMouseClick={handleMouseClick}
          />

          <div className="flex flex-col gap-4 flex-1 min-w-0 overflow-y-auto h-full">
            <GameStatus
              gameState={gameState}
              currentRound={currentRound}
              onStartGame={startGame}
              onResetGame={resetGame}
            />

            <GameResults roundResults={roundResults} gameState={gameState} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AimTrainer
