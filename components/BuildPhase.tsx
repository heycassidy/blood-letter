import { useContext } from 'react'
import { GameConfigContext } from '../context/GameConfigContext'
import { css } from '../stitches.config'
import Pool from './Pool'
import Rack from './Rack'
import InfoList from '../atoms/InfoList'
import { useGameContext } from '../context/GameContext'
import { useBuildPhaseContext } from '../context/BuildPhaseContext'
import { LetterOriginKind } from '../lib/types'

const BuildPhase = () => {
  const { rackCapacity, letterBuyCost, letterSellValue, poolRefreshCost } =
    useContext(GameConfigContext)
  const { round, activePlayer, endTurn, getPoolTier, getPoolCapacity } =
    useGameContext()
  const {
    rack,
    pool,
    selectedLetter,
    refreshPool,
    buyLetter,
    sellLetter,
    toggleLetterFreeze,
  } = useBuildPhaseContext()

  const highestPoolTier = getPoolTier(round)
  const poolAmount = getPoolCapacity(round)

  const { name: playerName, gold, health, battleVictories } = activePlayer

  return (
    <div className={styles()}>
      <InfoList>
        <strong>{playerName}</strong>
        <span>Gold: {gold}</span>
        <span>Health: {health}</span>
        <span>Round: {round}</span>
        <span>Wins: {battleVictories}</span>
      </InfoList>

      <Rack letters={rack} capacity={rackCapacity} />

      <InfoList>
        <span>Tier: {highestPoolTier}</span>
      </InfoList>

      <Pool letters={pool} amount={poolAmount} />

      <div className="button-row">
        <button onClick={refreshPool}>Refresh pool ({poolRefreshCost})</button>

        {selectedLetter && (
          <>
            {selectedLetter.origin === LetterOriginKind.Pool &&
              gold >= letterBuyCost && (
                <button onClick={() => buyLetter(selectedLetter)}>
                  Buy Letter ({letterBuyCost})
                </button>
              )}

            {selectedLetter.origin === LetterOriginKind.Pool && (
              <button onClick={() => toggleLetterFreeze(selectedLetter)}>
                {selectedLetter.frozen ? 'Unfreeze' : 'Freeze'}
              </button>
            )}

            {selectedLetter.origin === LetterOriginKind.Rack && (
              <button onClick={() => sellLetter(selectedLetter)}>
                Sell Letter ({letterSellValue})
              </button>
            )}
          </>
        )}

        <button style={{ marginLeft: 'auto' }} onClick={endTurn}>
          End Turn
        </button>
      </div>
    </div>
  )
}

const styles = css({
  rowGap: '1rem',
  display: 'grid',
  justifyContent: 'start',
  justifyItems: 'start',
  '.button-row': {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    justifySelf: 'stretch',
  },
})

export default BuildPhase
