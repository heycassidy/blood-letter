import { useContext } from 'react'
import { GameConfig } from '../context/GameConfig'
import type { Player } from '../lib/types'
import css from 'styled-jsx/css'
import LetterList from './LetterList'
import LetterCard from './LetterCard'
import { useGameContext } from '../context/GameContext'

const BattleSide = ({ player }: { player: Player }) => {
  const { stageCapacity, healthLossFromRound } = useContext(GameConfig)
  const { round, battleWinner } = useGameContext()

  return (
    <div className="battle-side">
      <div className="info-list">
        <div className="info-box">{player.name}</div>
        <div className="info-box">Letters: {player.stageScore}</div>
        <div className="info-box">Word Bonus: {player.wordBonus}</div>
        <div className="info-box">
          <strong>Total: {player.roundScore}</strong>
        </div>
        {battleWinner && battleWinner.id === player.id && (
          <div className="info-box">
            <strong>Winner</strong>
          </div>
        )}
        {battleWinner && battleWinner.id !== player.id && (
          <div className="info-box">Health: -{healthLossFromRound(round)}</div>
        )}
      </div>

      <LetterList capacity={stageCapacity}>
        {player.stage.map((letter) => (
          <LetterCard
            letter={{ name: letter.name, tier: letter.tier, id: letter.id }}
            key={letter.id}
          />
        ))}
      </LetterList>

      <style jsx>{styles}</style>
    </div>
  )
}

const styles = css`
  .battle-side {
    gap: 0.5rem;
    padding: 0.5rem;
    display: grid;
    justify-content: start;
    justify-items: start;

    border: 1px solid black;
    background-color: #e7e7e7;
  }
  .info-list {
    display: flex;
    gap: 0.25rem;
  }
  .info-box {
    line-height: 1;
    padding: 0.125rem 0.5rem;
    background: #d3d3d3;
  }
`

export default BattleSide
