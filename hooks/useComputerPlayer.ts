import { useGameDispatchContext } from '../context/GameContext'
import { GameState, PlayerClassificationKind } from '../lib/types'
import { GameActionKind } from '../context/GameContextReducer'
import { useEffect } from 'react'
import { playComputerTurn } from '../app/actions'

const useComputerPlayer = (state: GameState) => {
  const dispatch = useGameDispatchContext()

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
    const completedComputerTurnState = await playComputerTurn(initialState)

    console.log(completedComputerTurnState)

    dispatch({
      type: GameActionKind.Set,
      payload: { state: completedComputerTurnState },
    })
  }
}

export default useComputerPlayer
