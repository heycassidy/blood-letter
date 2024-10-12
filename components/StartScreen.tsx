import { css } from '../styled-system/css'
import { useGameDispatchContext } from '../context/GameContext'
import { GameModeKind } from '../lib/types'
import { GameActionKind } from '../context/GameContextReducer'
import Button from '../atoms/Button'

const StartScreen = () => {
  const dispatch = useGameDispatchContext()

  return (
    <div className={styles}>
      <Button
        onClick={() => {
          dispatch({
            type: GameActionKind.StartGame,
            payload: { gameMode: GameModeKind.AgainstComputer },
          })
        }}
      >
        Start Game vs Computer
      </Button>
      <Button
        onClick={() => {
          dispatch({
            type: GameActionKind.StartGame,
            payload: { gameMode: GameModeKind.PassToPlay },
          })
        }}
      >
        Start Game vs Human (Pass-to-Play)
      </Button>
    </div>
  )
}

const styles = css({
  rowGap: '4',
  display: 'grid',
  justifyContent: 'start',
  justifyItems: 'start',
})

export default StartScreen
