import { useGameDispatchContext } from '../context/GameContext'
import { GameState } from '../lib/types'
import { GameActionKind } from '../context/GameContextReducer'
import { MCTSGame } from '../lib/MCTS'

const useComputerPlayer = () => {
  const dispatch = useGameDispatchContext()

  function runComputerPlayer(initialState: GameState) {
    const game = new MCTSGame(initialState)

    while (!game.isTurnOver) {
      const move = game.selectMove()
      console.log(move.name)
      game.state = move.execute()
    }

    dispatch({
      type: GameActionKind.Set,
      payload: { state: game.state },
    })
  }

  return [runComputerPlayer]
}

export default useComputerPlayer
