import { gameConfig, getHealthCost } from '../lib/gameConfig'
import { Player } from '../lib/types'
import { css } from '../stitches.config'
import LetterList from './LetterList'
import LetterCard from './LetterCard'
import { useGameContext } from '../context/GameContext'
import InfoList from '../atoms/InfoList'
import { getRackScore, getWordBonus, getTotalScore } from '../lib/Player'

const BattleSide = ({ player }: { player: Player }) => {
  const { rackCapacity, healthCostMap } = gameConfig
  const { round, players, battleWinnerIndex } = useGameContext()
  const battleWinner =
    battleWinnerIndex !== undefined ? players[battleWinnerIndex] : undefined

  return (
    <div className={styles()}>
      <InfoList>
        <span>{player.name}</span>
        <span>Letters: {getRackScore(player)}</span>
        {getWordBonus(player) > 0 ? (
          <span>Word Bonus: {getWordBonus(player)}</span>
        ) : (
          <span>Not in word list</span>
        )}
        <strong>Total: {getTotalScore(player)}</strong>
        {battleWinner && battleWinner.id === player.id && (
          <strong>Winner</strong>
        )}
        {battleWinner && battleWinner.id !== player.id && (
          <span>Health: -{getHealthCost(round, healthCostMap)}</span>
        )}
      </InfoList>

      <LetterList capacity={rackCapacity}>
        {player.rack.map((letter) => (
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
