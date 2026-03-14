import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameDispatchContext } from '@/context/GameContext'
import { GameActionKind } from '@/context/GameContextReducer'
import { GameModeKind, type GameState } from '@/lib/types'

const useComputerPlayer = (state: GameState) => {
  const dispatch = useGameDispatchContext()
  const [thinking, setThinking] = useState(false)
  const stateRef = useRef(state)
  stateRef.current = state

  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/mcts.worker.ts', import.meta.url),
    )
    workerRef.current = worker
    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const prevRoundRef = useRef(state.round)
  const prevGameInProgressRef = useRef(state.gameInProgress)

  const runComputerPlayer = useCallback(() => {
    const worker = workerRef.current
    if (!worker) return

    setThinking(true)

    worker.onmessage = (event: MessageEvent) => {
      if (event.data.type === 'result') {
        setThinking(false)
        dispatch({
          type: GameActionKind.EndTurn,
          payload: {
            computerPlayer: event.data.computerPlayer,
            computerPlayerIndex: event.data.computerPlayerIndex,
          },
        })
      }
    }

    worker.postMessage({ type: 'start', gameState: stateRef.current })
  }, [dispatch])

  useEffect(() => {
    const roundChanged = state.round !== prevRoundRef.current
    const gameStarted = state.gameInProgress && !prevGameInProgressRef.current

    prevRoundRef.current = state.round
    prevGameInProgressRef.current = state.gameInProgress

    if (
      (roundChanged || gameStarted) &&
      state.gameInProgress &&
      state.gameMode === GameModeKind.AgainstComputer
    ) {
      runComputerPlayer()
    }
  }, [state.gameInProgress, state.round, state.gameMode, runComputerPlayer])

  return thinking
}

export default useComputerPlayer
