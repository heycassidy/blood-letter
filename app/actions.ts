'use server'

import { GameState } from '../lib/types'
import { MCTS, MCTSGame } from '../lib/MCTS'

export async function playComputerTurn(initialState: GameState) {
  const computerPlayerIndex = 1

  const iterations = 30000 + (initialState.round - 1) * 1000

  // increase to increase exploration
  // decrease to increase exploitation
  const explorationConstant = 5

  const game = new MCTSGame(initialState, computerPlayerIndex)
  const computerPlayer = new MCTS(
    game,
    computerPlayerIndex,
    iterations,
    explorationConstant
  )
  const endTurnState: GameState = computerPlayer.playTurn()

  return {
    computerPlayer: endTurnState.players[computerPlayerIndex],
    computerPlayerIndex,
  }
}
