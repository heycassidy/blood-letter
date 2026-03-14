import { Button } from './ui/button'
import { useGameDispatchContext } from '@/context/GameContext'
import { GameActionKind } from '@/context/GameContextReducer'
import { GameModeKind } from '@/lib/types'
import { css } from '@/styled-system/css'

const StartScreen = () => {
  const dispatch = useGameDispatchContext()

  return (
    <div className={styles}>
      <Button
          variant="subtle"
          size="xs"
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
          variant="subtle"
          size="xs"
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
