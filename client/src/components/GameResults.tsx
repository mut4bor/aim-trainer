import { RoundResult, GameState } from '@/types'
import { BASE_GAME_CONFIG } from '@/constants'
import { getTotalScore } from '@/utils'

const getPointsWord = (n: number): string => {
  const absN = Math.abs(n)

  if (absN % 10 === 1 && absN % 100 !== 11) return 'очко'
  if ([2, 3, 4].includes(absN % 10) && ![12, 13, 14].includes(absN % 100))
    return 'очка'

  return 'очков'
}

const formatResults = (results: number, outOf?: number): string => {
  const word = getPointsWord(results)

  return BASE_GAME_CONFIG.IS_RESULT_OUT_OF_SHOWN
    ? `${results}/${outOf ?? 100} ${word}`
    : `${results} ${word}`
}

interface Props {
  roundResults: RoundResult[]
  gameState: GameState
}

const GameResults = ({ roundResults, gameState }: Props) => {
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
                  <div>
                    Точность движения: {formatResults(result.accuracyScore)}
                  </div>
                  <div>
                    Попадание в цель: {formatResults(result.distanceFromCenter)}
                  </div>
                  <div>
                    Очки времени: {formatResults(result.time.score)}
                    {` (${result.time.valueMs / 1000} сек)`}
                  </div>
                  <div className="font-medium">
                    Итого: {formatResults(getTotalScore(result))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {gameState === 'finished' && (
            <div className="p-3 bg-blue-50 rounded border-2 border-blue-200">
              <div className="font-bold text-lg">
                Общий результат:{' '}
                {formatResults(finalScore, BASE_GAME_CONFIG.ROUNDS_COUNT * 300)}
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
