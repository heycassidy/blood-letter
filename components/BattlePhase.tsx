import { css } from '../styled-system/css'
import { useGameContext, useGameDispatchContext } from '../context/GameContext'
import BattleSide from './BattleSide'
import InfoList from '../atoms/InfoList'
import Button from '../atoms/Button'
import { GameActionKind } from '../context/GameContextReducer'

const BattlePhase = () => {
  const { players, battleWinnerIndex, gameOver } = useGameContext()
  const dispatch = useGameDispatchContext()
  const battleWinner =
    battleWinnerIndex !== undefined ? players[battleWinnerIndex] : undefined

  return (
    <div className={styles}>
      {!battleWinner && (
        <InfoList>
          <strong>Draw</strong>
        </InfoList>
      )}

      <div className={matchupStyles}>
        {Array.from(players.values()).map((player) => (
          <BattleSide player={player} key={player.id} />
        ))}
      </div>

      {!gameOver && (
        <Button
          onClick={() => {
            dispatch({
              type: GameActionKind.IncrementRound,
            })
          }}
        >
          Next Round
        </Button>
      )}
    </div>
  )
}

const styles = css({
  gap: '4',
  display: 'grid',
  justifyContent: 'start',
  justifyItems: 'start',
})

const matchupStyles = css({
  rowGap: '4',
  columnGap: '6',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'start',
  justifyItems: 'start',
})

export default BattlePhase
