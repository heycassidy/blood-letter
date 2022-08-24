import { css } from '../stitches.config'
import { useGameContext } from '../context/GameContext'
import BattleSide from './BattleSide'
import InfoList from '../atoms/InfoList'

const BattlePhase = () => {
  const { players, incrementRound, battleWinner } = useGameContext()

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

      <button onClick={incrementRound}>Next Round</button>
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
