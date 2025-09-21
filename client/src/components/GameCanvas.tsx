import { useRef, useEffect, MouseEvent } from 'react'
import { Point, GameState } from '@/types'
import { BASE_GAME_CONFIG } from '@/constants'

interface Props {
  canvasSize: number
  gameState: GameState
  targetPosition: Point
  mousePosition: Point
  isInCenter: boolean
  holdProgress?: number // ⬅️ прогресс удержания (0–1)
  onMouseMove: (e: MouseEvent<HTMLCanvasElement>) => void
  onMouseClick: () => void
}

const GameCanvas = ({
  canvasSize,
  gameState,
  targetPosition,
  mousePosition,
  isInCenter,
  holdProgress = 0,
  onMouseMove,
  onMouseClick,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const CIRCLE_RADIUS = (canvasSize - BASE_GAME_CONFIG.TARGET_SIZE * 2) / 2 - 20
  const centerX = canvasSize / 2
  const centerY = canvasSize / 2

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasSize, canvasSize)

    // окружность
    ctx.beginPath()
    ctx.arc(centerX, centerY, CIRCLE_RADIUS, 0, 2 * Math.PI)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.stroke()

    // центр
    ctx.beginPath()
    ctx.arc(centerX, centerY, BASE_GAME_CONFIG.CENTER_TOLERANCE, 0, 2 * Math.PI)
    ctx.strokeStyle = isInCenter ? '#00ff00' : '#ff0000'
    ctx.lineWidth = 1
    ctx.stroke()

    // прогресс удержания (дуга)
    if (
      (gameState === 'waiting' || gameState === 'finished') &&
      holdProgress > 0
    ) {
      ctx.beginPath()
      ctx.arc(
        centerX,
        centerY,
        BASE_GAME_CONFIG.CENTER_TOLERANCE - 2,
        -Math.PI / 2,
        -Math.PI / 2 + 2 * Math.PI * holdProgress,
      )
      ctx.strokeStyle = 'rgba(0,150,255,0.7)'
      ctx.lineWidth = 4
      ctx.stroke()
    }

    // цель
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

      // линия от центра
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(targetPosition.x, targetPosition.y)
      ctx.strokeStyle = '#cccccc'
      ctx.setLineDash([5, 5])
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.setLineDash([])
    }

    // курсор
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
    holdProgress,
  ])

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg flex-shrink-0 aspect-square">
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
