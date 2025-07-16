import { RoundResult, GameState } from '@/types'
import { BASE_GAME_CONFIG } from '@/constants'
import { getTotalScore } from '@/utils'

interface GameResultsProps {
  roundResults: RoundResult[]
  gameState: GameState
}

const GameResults = ({ roundResults, gameState }: GameResultsProps) => {
  const finalScore = roundResults.reduce(
    (sum, result) => sum + getTotalScore(result),
    0,
  )

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg flex-shrink-0">
      {roundResults.length > 0 ? (
        <div className="rounded-lg flex flex-col gap-2">
          <h3 className="font-semibold">Результаты</h3>
          <div className="flex flex-col gap-2">
            {roundResults.map((result, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded border">
                <div className="font-medium">Раунд {index + 1}</div>
                <div className="text-sm text-gray-600">
                  <div>Точность движения: {result.accuracyScore}/100</div>
                  <div>Попадание в цель: {result.distanceFromCenter}/100</div>
                  <div>
                    Очки времени: {result.time.score}/100 (
                    {result.time.valueMs / 1000} сек)
                  </div>
                  <div className="font-medium">
                    Итого: {getTotalScore(result)}/300
                  </div>
                </div>
              </div>
            ))}
          </div>

          {gameState === 'finished' && (
            <div className="p-3 bg-blue-50 rounded border-2 border-blue-200">
              <div className="font-bold text-lg">
                Общий результат: {finalScore}/
                {BASE_GAME_CONFIG.ROUNDS_COUNT * 300}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Здесь появятся результаты!</p>
      )}
    </div>
  )
}

export default GameResults
