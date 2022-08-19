import css from 'styled-jsx/css'
import { useGameContext } from '../context/GameContext'
import BattleSide from './BattleSide'

const BattlePhase = () => {
  const { players, incrementRound, battleWinner } = useGameContext()

  return (
    <div className="battle-view">
      {!battleWinner && (
        <div className="info-list">
          <div className="info-box">
            <strong>Draw</strong>
          </div>
        </div>
      )}

      <div className="matchup">
        {Array.from(players.values()).map((player) => (
          <BattleSide player={player} key={player.id} />
        ))}
      </div>

      <button onClick={incrementRound}>Next Round</button>
      <style jsx>{styles}</style>
    </div>
  )
}

const styles = css`
  .battle-view {
    gap: 1rem;
    display: grid;
    justify-content: start;
    justify-items: start;
  }
  .matchup {
    row-gap: 1rem;
    column-gap: 2rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: start;
    justify-items: start;
  }
  .info-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .info-box {
    line-height: 1;
    padding: 0.125rem 0.5rem;
    background: #e3e3e3;
  }
`

export default BattlePhase
