import Button from '../atoms/Button'
import InfoList from '../atoms/InfoList'
import { useGameContext, useGameDispatchContext } from '../context/GameContext'
import { GameActionKind } from '../context/GameContextReducer'
import { getPlayerByIndex } from '../lib/helpers'
import { css } from '../styled-system/css'
import BattleSide from './BattleSide'

const BattlePhase = () => {
  const { players, battleWinnerIndex, gameOver } = useGameContext()
  const dispatch = useGameDispatchContext()
  const battleWinner = getPlayerByIndex(players, battleWinnerIndex)

  return (
    <div className={styles}>
      {!battleWinner && (
        <InfoList>
          <strong>Draw</strong>
        </InfoList>
      )}

      <div className={matchupStyles}>
        {players.map((player) => (
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
