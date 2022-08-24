import { useContext, useEffect, useState } from 'react'
import { GameConfigContext } from '../context/GameConfigContext'
import { css } from '../stitches.config'
import LetterStore from './LetterStore'
import Stage from './Stage'
import InfoList from '../atoms/InfoList'
import { useGameContext } from '../context/GameContext'
import { useBuildPhaseContext } from '../context/BuildPhaseContext'
import { LetterLocation } from '../lib/types'

const BuildPhase = () => {
  const { stageCapacity, letterBuyCost } = useContext(GameConfigContext)
  const { round, activePlayer, updatePlayer, getStoreTier, getStoreCapacity } =
    useGameContext()
  const { stage, store, selectedLetter, rollStore, buyLetter, sellLetter } =
    useBuildPhaseContext()

  const highestTier = getStoreTier(round)
  const storeAmount = getStoreCapacity(round)

  const [showStage, setShowStage] = useState(false)

  const { name: playerName, gold, health, battleVictories } = activePlayer

  useEffect(() => {
    setShowStage(true)
  }, [])

  return (
    <div className={styles()}>
      <InfoList>
        <strong>{playerName}</strong>
        <span>Gold: {gold}</span>
        <span>Health: {health}</span>
        <span>Round: {round}</span>
        <span>Wins: {battleVictories}</span>
      </InfoList>

      {showStage && <Stage letters={stage} capacity={stageCapacity} />}

      <InfoList>
        <span>Tier: {highestTier}</span>
      </InfoList>

      <LetterStore letters={store} amount={storeAmount} />

      <div className="button-row">
        <button onClick={rollStore}>Roll Store</button>

        {selectedLetter && (
          <>
            {selectedLetter.location === LetterLocation.Store &&
              gold >= letterBuyCost && (
                <button onClick={() => buyLetter(selectedLetter)}>
                  Buy Letter
                </button>
              )}

            {selectedLetter.location === LetterLocation.Stage && (
              <button onClick={() => sellLetter(selectedLetter)}>
                Sell Letter
              </button>
            )}
          </>
        )}

        <button
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            updatePlayer(activePlayer.id, {
              completedTurn: true,
            })
          }}
        >
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
