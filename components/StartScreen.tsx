import { css } from '../stitches.config'
import { useGameDispatchContext } from '../context/GameContext'
import { GameModeKind } from '../lib/types'
import { GameActionKind } from '../context/GameContextReducer'

const StartScreen = () => {
  const dispatch = useGameDispatchContext()

  return (
    <div className={styles()}>
      <button
        onClick={() => {
          dispatch({
            type: GameActionKind.StartGame,
            payload: { gameMode: GameModeKind.AgainstComputer },
          })
        }}
      >
        Start Game vs Computer
      </button>
      <button
        onClick={() => {
          dispatch({
            type: GameActionKind.StartGame,
            payload: { gameMode: GameModeKind.PassToPlay },
          })
        }}
      >
        Start Game vs Human (Pass-to-Play)
      </button>
    </div>
  )
}

const styles = css({
  rowGap: '1rem',
  display: 'grid',
  justifyContent: 'start',
  justifyItems: 'start',
  '.button-row': {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    justifySelf: 'stretch',
  },
})

export default StartScreen
