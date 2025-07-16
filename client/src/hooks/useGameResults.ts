import { useState, useCallback } from 'react'
import { GameApiService } from '@/services/gameApiService'
import { GameResultRequest, GameResultResponse } from '@/types'

interface UseGameResultsReturn {
  submitResults: (data: GameResultRequest) => Promise<GameResultResponse>
  isLoading: boolean
  error: string | null
  lastResponse: GameResultResponse | null
}

export const useGameResults = (): UseGameResultsReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<GameResultResponse | null>(
    null,
  )

  const submitResults = useCallback(
    async (data: GameResultRequest): Promise<GameResultResponse> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await GameApiService.submitGameResults(data)
        setLastResponse(response)
        return response
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  return {
    submitResults,
    isLoading,
    error,
    lastResponse,
  }
}
