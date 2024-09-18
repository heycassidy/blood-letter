import { useGameDispatchContext } from '../context/GameContext'
import { GameModeKind, GameState } from '../lib/types'
import { GameActionKind } from '../context/GameContextReducer'
import { useEffect, useState } from 'react'
import { playComputerTurn } from '../app/actions'

const useComputerPlayer = (state: GameState) => {
  const dispatch = useGameDispatchContext()
  const [thinking, setThinking] = useState(false)

  useEffect(() => {
    const { gameInProgress, gameMode } = state

    if (gameInProgress && gameMode === GameModeKind.AgainstComputer) {
      runComputerPlayer(state)
    }
  }, [state.gameInProgress, state.round])

  async function runComputerPlayer(initialState: GameState) {
    setThinking(true)
    const { computerPlayer, computerPlayerIndex } = await playComputerTurn(
      initialState
    )
    setThinking(false)

    dispatch({
      type: GameActionKind.EndTurn,
      payload: { computerPlayer, computerPlayerIndex },
    })
  }

  return thinking
}

export default useComputerPlayer
