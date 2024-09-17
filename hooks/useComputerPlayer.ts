import { useGameDispatchContext } from '../context/GameContext'
import { GameState, PlayerClassificationKind } from '../lib/types'
import { GameActionKind } from '../context/GameContextReducer'
import { useEffect, useState } from 'react'
import { playComputerTurn } from '../app/actions'

const useComputerPlayer = (state: GameState) => {
  const dispatch = useGameDispatchContext()
  const [thinking, setThinking] = useState(false)

  useEffect(() => {
    const { players, activePlayerIndex } = state
    const activePlayer = players[activePlayerIndex]

    if (
      activePlayer &&
      activePlayer.classification === PlayerClassificationKind.Computer
    ) {
      runComputerPlayer(state)
    }
  }, [state.activePlayerIndex])

  async function runComputerPlayer(initialState: GameState) {
    setThinking(true)
    const completedState = await playComputerTurn(initialState)
    setThinking(false)

    dispatch({
      type: GameActionKind.Set,
      payload: { state: completedState },
    })
  }

  return [thinking]
}

export default useComputerPlayer
