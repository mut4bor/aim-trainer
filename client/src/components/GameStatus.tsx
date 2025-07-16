import { GameState } from '@/types'
import { BASE_GAME_CONFIG } from '@/constants'

interface GameStatusProps {
  gameState: GameState
  currentRound: number
  onStartGame: () => void
  onResetGame: () => void
}

const GameStatus = ({
  gameState,
  currentRound,
  onStartGame,
  onResetGame,
}: GameStatusProps) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-lg flex-shrink-0">
      <h3 className="font-semibold mb-2">Состояние</h3>
      {gameState === 'waiting' && (
        <div>
          <p className="mb-4">Нажмите "Начать игру" для старта</p>
          <button
            onClick={onStartGame}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          >
            Начать игру
          </button>
        </div>
      )}
      {gameState === 'preparing' && (
        <p className="text-orange-600">Подготовка... Держите курсор в центре</p>
      )}
      {gameState === 'playing' && (
        <p className="text-green-600">
          Раунд {currentRound + 1}/{BASE_GAME_CONFIG.ROUNDS_COUNT} - Ведите
          курсор к цели и кликните!
        </p>
      )}
      {gameState === 'finished' && (
        <div>
          <p className="text-blue-600 mb-4">Игра завершена!</p>
          <button
            onClick={onResetGame}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer"
          >
            Играть снова
          </button>
        </div>
      )}
    </div>
  )
}

export default GameStatus
