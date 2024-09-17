'use server'

import { GameState } from '../lib/types'
import { MCTS, MCTSGame } from '../lib/MCTS'

export async function playComputerTurn(initialState: GameState) {
  const computerPlayerIndex = 1

  const game = new MCTSGame(initialState, computerPlayerIndex)
  const computerPlayer = new MCTS(game, computerPlayerIndex, 20000)
  const endTurnState: GameState = computerPlayer.playTurn()

  return {
    computerPlayer: endTurnState.players[computerPlayerIndex],
    computerPlayerIndex,
  }
}
