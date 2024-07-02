import { useGameDispatchContext } from '../context/GameContext'
import { GameState } from '../lib/types'
import { randomItem } from '../lib/helpers'
import { GameActionKind } from '../context/GameContextReducer'

const useComputerPlayer = () => {
  const dispatch = useGameDispatchContext()

  function runComputerPlayer(state: GameState) {
    const { getAvailableMoves } = state

    const randomMove = randomItem(getAvailableMoves(state))
    console.log(randomMove.name)
    const nextState = randomMove.execute()

    const nextAvailableMoves = getAvailableMoves(nextState)

    if (randomMove.name !== 'end-turn' && nextAvailableMoves.length > 0) {
      runComputerPlayer(nextState)
    } else {
      console.log(nextState)
      dispatch({
        type: GameActionKind.Set,
        payload: { state: nextState },
      })
    }
  }

  return [runComputerPlayer]
}

export default useComputerPlayer
