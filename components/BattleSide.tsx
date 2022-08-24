import { useContext } from 'react'
import { GameConfigContext } from '../context/GameConfigContext'
import type { Player } from '../lib/types'
import { css, theme } from '../stitches.config'
import LetterList from './LetterList'
import LetterCard from './LetterCard'
import { useGameContext } from '../context/GameContext'
import InfoList from '../atoms/InfoList'

const BattleSide = ({ player }: { player: Player }) => {
  const { stageCapacity } = useContext(GameConfigContext)
  const { round, battleWinner, getHealthCost } = useGameContext()

  return (
    <div className={styles()}>
      <InfoList>
        <span>{player.name}</span>
        <span>Letters: {player.stageScore}</span>
        {player.wordBonus > 0 ? (
          <span>Word Bonus: {player.wordBonus}</span>
        ) : (
          <span>Not in word list</span>
        )}
        <strong>Total: {player.roundScore}</strong>
        {battleWinner && battleWinner.id === player.id && (
          <strong>Winner</strong>
        )}
        {battleWinner && battleWinner.id !== player.id && (
          <span>Health: -{getHealthCost(round)}</span>
        )}
      </InfoList>

      <LetterList capacity={stageCapacity}>
        {player.stage.map((letter) => (
          <LetterCard letter={letter} key={letter.id} />
        ))}
      </LetterList>
    </div>
  )
}

const styles = css({
  gap: '0.5rem',
  padding: '0.5rem',
  display: 'grid',
  justifyContent: 'start',
  justifyItems: 'start',
  border: '1px solid black',
  backgroundColor: '$neutral175',
})

export default BattleSide
