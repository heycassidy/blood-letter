import { MCTS, MCTSGame } from '../lib/MCTS'
import type { GameState } from '../lib/types'

self.onmessage = (event: MessageEvent) => {
  if (event.data.type === 'start') {
    const initialState: GameState = event.data.gameState
    const computerPlayerIndex = 1

    const iterations = 30000 + (initialState.round - 1) * 1000
    const explorationConstant = 1.41

    const game = new MCTSGame(initialState, computerPlayerIndex)
    const computerPlayer = new MCTS(
      game,
      computerPlayerIndex,
      iterations,
      explorationConstant,
    )
    const endTurnState: GameState = computerPlayer.playTurn()

    self.postMessage({
      type: 'result',
      computerPlayer: endTurnState.players[computerPlayerIndex],
      computerPlayerIndex,
    })
  }
}
