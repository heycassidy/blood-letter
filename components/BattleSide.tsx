import InfoList from '../atoms/InfoList'
import { useGameContext } from '../context/GameContext'
import { gameConfig } from '../lib/gameConfig'
import { getHealthCost, getPlayerByIndex } from '../lib/helpers'
import { getRackScore, getTotalScore, getWordBonus } from '../lib/Player'
import type { Player } from '../lib/types'
import { css } from '../styled-system/css'
import LetterCard from './LetterCard'
import LetterList from './LetterList'

const BattleSide = ({ player }: { player: Player }) => {
  const { rackCapacity, healthCostMap } = gameConfig
  const { round, players, battleWinnerIndex } = useGameContext()
  const battleWinner = getPlayerByIndex(players, battleWinnerIndex)
  const wordBonus = getWordBonus(player)

  return (
    <div className={styles}>
      <InfoList>
        <span>{player.name}</span>
        <span>Letters: {getRackScore(player)}</span>
        {wordBonus > 0 ? (
          <span>Word Bonus: {wordBonus}</span>
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
  gap: '2',
  padding: '2',
  display: 'grid',
  justifyContent: 'start',
  justifyItems: 'start',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'gray.900',
  backgroundColor: 'gray.200',
})

export default BattleSide
