'use client'

import { useGameDispatchContext } from '../context/GameContext'
import { GameState, PlayerClassificationKind } from '../lib/types'
import { GameActionKind } from '../context/GameContextReducer'
import { MCTSGame, MCTS } from '../lib/MCTS'
import { useEffect } from 'react'

const useComputerPlayer = (state: GameState) => {
  const dispatch = useGameDispatchContext()

  useEffect(() => {
    const { players, activePlayerId } = state
    const activePlayer = players.get(activePlayerId)

    if (
      activePlayer &&
      activePlayer.classification === PlayerClassificationKind.Computer
    ) {
      runComputerPlayer(state)
    }
  }, [state.activePlayerId])

  async function runComputerPlayer(initialState: GameState) {
    // workerRef.current?.postMessage(initialState)
    const game = new MCTSGame(initialState)
    const computerPlayer = new MCTS(game, initialState.activePlayerId, 20000)
    game.state = computerPlayer.playTurn()

    dispatch({
      type: GameActionKind.Set,
      payload: { state: game.state },
    })
  }
}

export default useComputerPlayer
