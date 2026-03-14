import { useCallback, useEffect, useRef, useState } from 'react'
import { playComputerTurn } from '../app/actions'
import { useGameDispatchContext } from '../context/GameContext'
import { GameActionKind } from '../context/GameContextReducer'
import { GameModeKind, type GameState } from '../lib/types'

const useComputerPlayer = (state: GameState) => {
  const dispatch = useGameDispatchContext()
  const [thinking, setThinking] = useState(false)
  const stateRef = useRef(state)
  stateRef.current = state

  const prevRoundRef = useRef(state.round)
  const prevGameInProgressRef = useRef(state.gameInProgress)

  const runComputerPlayer = useCallback(async () => {
    setThinking(true)
    const { computerPlayer, computerPlayerIndex } = await playComputerTurn(
      stateRef.current
    )
    setThinking(false)

    dispatch({
      type: GameActionKind.EndTurn,
      payload: { computerPlayer, computerPlayerIndex },
    })
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
