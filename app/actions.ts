'use server'

import { GameState } from '../lib/types'
import { MCTS, MCTSGame } from '../lib/MCTS'

export async function playComputerTurn(initialState: GameState) {
  const game = new MCTSGame(initialState)
  const computerPlayer = new MCTS(game, initialState.activePlayerIndex, 20000)
  game.state = computerPlayer.playTurn()

  return game.state
}
