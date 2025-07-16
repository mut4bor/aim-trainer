import { useRef, useEffect, MouseEvent } from 'react'
import { Point, GameState } from '@/types'
import { BASE_GAME_CONFIG } from '@/constants'

interface GameCanvasProps {
  canvasSize: number
  gameState: GameState
  targetPosition: Point
  mousePosition: Point
  isInCenter: boolean
  onMouseMove: (e: MouseEvent<HTMLCanvasElement>) => void
  onMouseClick: () => void
}

const GameCanvas = ({
  canvasSize,
  gameState,
  targetPosition,
  mousePosition,
  isInCenter,
  onMouseMove,
  onMouseClick,
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const CIRCLE_RADIUS = (canvasSize - BASE_GAME_CONFIG.TARGET_SIZE * 2) / 2 - 20
  const centerX = canvasSize / 2
  const centerY = canvasSize / 2

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Очистка canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize)

    // Отрисовка окружности
    ctx.beginPath()
    ctx.arc(centerX, centerY, CIRCLE_RADIUS, 0, 2 * Math.PI)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.stroke()

    // Отрисовка центра
    ctx.beginPath()
    ctx.arc(centerX, centerY, BASE_GAME_CONFIG.CENTER_TOLERANCE, 0, 2 * Math.PI)
    ctx.strokeStyle = isInCenter ? '#00ff00' : '#ff0000'
    ctx.lineWidth = 1
    ctx.stroke()

    // Отрисовка цели (только во время игры)
    if (gameState === 'playing') {
      ctx.beginPath()
      ctx.arc(
        targetPosition.x,
        targetPosition.y,
        BASE_GAME_CONFIG.TARGET_SIZE,
        0,
        2 * Math.PI,
      )
      ctx.fillStyle = '#ff0000'
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.stroke()

      // Отрисовка линии от центра к цели
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(targetPosition.x, targetPosition.y)
      ctx.strokeStyle = '#cccccc'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Отрисовка курсора
    ctx.beginPath()
    ctx.arc(mousePosition.x, mousePosition.y, 5, 0, 2 * Math.PI)
    ctx.fillStyle = '#0066cc'
    ctx.fill()
  }, [
    gameState,
    targetPosition,
    mousePosition,
    isInCenter,
    canvasSize,
    CIRCLE_RADIUS,
  ])

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg flex-shrink-0">
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="cursor-crosshair"
        style={{ width: `${canvasSize}px`, height: `${canvasSize}px` }}
        onMouseMove={onMouseMove}
        onClick={onMouseClick}
      />
    </div>
  )
}

export default GameCanvas
