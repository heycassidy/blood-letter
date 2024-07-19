import { useGameDispatchContext } from '../context/GameContext'
import { GameState } from '../lib/types'
import { GameActionKind } from '../context/GameContextReducer'
import { MCTSGame, MCTS } from '../lib/MCTS'

const useComputerPlayer = () => {
  const dispatch = useGameDispatchContext()

  function runComputerPlayer(initialState: GameState) {
    const game = new MCTSGame(initialState)
    const computerPlayer = new MCTS(game, initialState.activePlayerId, 8000)

    console.log('Computer player: ', initialState.activePlayerId)
    game.state = computerPlayer.playTurn()

    console.log('BATTLE OVER: ', game.state)

    dispatch({
      type: GameActionKind.Set,
      payload: { state: game.state },
    })
  }

  return [runComputerPlayer]
}

export default useComputerPlayer
