import css from 'styled-jsx/css'
import { useGameContext } from '../context/GameContext'
import BattleSide from './BattleSide'

const BattlePhase = () => {
  const { players } = useGameContext()

  console.log(Array.from(players.values()))

  return (
    <div className="battle-view">
      {Array.from(players.values()).map((player) => (
        <BattleSide player={player} key={player.id} />
      ))}
      <style jsx>{styles}</style>
    </div>
  )
}

const styles = css`
  .battle-view {
    row-gap: 1rem;
    column-gap: 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: start;
    justify-items: start;
  }
  .info-list {
    display: flex;
    gap: 0.25rem;
  }
  .info-box {
    line-height: 1;
    padding: 0.125rem 0.5rem;
    background: #e3e3e3;
  }
`

export default BattlePhase
