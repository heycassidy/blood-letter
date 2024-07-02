import { css } from '../stitches.config'
import { useGameContext, useGameDispatchContext } from '../context/GameContext'
import BattleSide from './BattleSide'
import InfoList from '../atoms/InfoList'
import { GameActionKind } from '../context/GameContextReducer'

const BattlePhase = () => {
  const { players, battleWinnerId } = useGameContext()
  const dispatch = useGameDispatchContext()
  const battleWinner = players.get(battleWinnerId ?? '')

  return (
    <div className={styles()}>
      {!battleWinner && (
        <InfoList>
          <strong>Draw</strong>
        </InfoList>
      )}

      <div className="matchup">
        {Array.from(players.values()).map((player) => (
          <BattleSide player={player} key={player.id} />
        ))}
      </div>

      <button
        onClick={() => {
          dispatch({
            type: GameActionKind.IncrementRound,
          })
        }}
      >
        Next Round
      </button>
    </div>
  )
}

const styles = css({
  gap: '1rem',
  display: 'grid',
  justifyContent: 'start',
  justifyItems: 'start',
  '.matchup': {
    rowGap: '1rem',
    columnGap: '2rem',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'start',
    justifyItems: 'start',
  },
})

export default BattlePhase
