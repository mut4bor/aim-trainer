import { useGameResults } from './hooks/useGameResults'
import GameCanvas from '@/components/GameCanvas'
import GameStatus from '@/components/GameStatus'
import GameResults from '@/components/GameResults'
import Logo from '@/images/logo.png'
import esportsFederationLogo from '@/images/esportsFederationLogo.png'
import GameNickname from './components/GameNickname'
import { useGameEngine } from './utils/useGameEngine'

const App = () => {
  const { submitResults } = useGameResults()
  const engine = useGameEngine(submitResults)

  return (
    <div className="bg-gray-100 flex flex-col items-center p-4 max-h-screen h-full">
      <div className="rounded-lg w-full max-w-7xl mx-auto flex flex-col gap-4 flex-1 max-h-screen h-full">
        {/* Header */}
        <div className="bg-white p-4 rounded-lg shadow-lg w-full flex-shrink-0 grid grid-cols-[155px_1fr_155px] items-center relative">
          <img className="w-[155px] object-contain" src={Logo} alt="Логотип" />
          <h1 className="text-3xl font-bold text-center">
            Оценка техники наведения курсора на цель
          </h1>
        </div>

        {/* Game area */}
        <div className="flex gap-4 flex-row items-start flex-1 min-h-0 min-w-0">
          <GameCanvas
            canvasSize={engine.canvasSize}
            gameState={engine.gameState}
            targetPosition={engine.targetPosition}
            mousePosition={engine.mousePosition}
            isInCenter={engine.isInCenter}
            holdProgress={engine.holdProgress}
            onMouseMove={engine.handleMouseMove}
            onMouseClick={engine.handleMouseClick}
            containerRef={engine.containerRef}
          />
          <div className="flex flex-col gap-4 flex-1 min-w-0 min-h-0 overflow-y-auto h-full">
            <GameNickname
              value={engine.nickNameValue}
              setValue={engine.setNickNameValue}
            />
            <GameStatus
              gameState={engine.gameState}
              currentRound={engine.currentRound}
            />

            <GameResults
              roundResults={engine.roundResults}
              gameState={engine.gameState}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="w-full flex-shrink-0 h-[100px] flex items-center">
          <img className="h-full" src={esportsFederationLogo} alt="" />
          <p className="flex flex-col">
            <span>Сайт разработан при поддержке</span>
            <span>Федерации компьютерного спорта России</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
