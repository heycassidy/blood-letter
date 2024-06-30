import { gameConfig, getPoolTier, getPoolCapacity } from '../lib/gameConfig'
import { css } from '../stitches.config'
import Pool from './Pool'
import Rack from './Rack'
import InfoList from '../atoms/InfoList'
import { useGameContext, useGameDispatchContext } from '../context/GameContext'
import { LetterOriginKind, PlayerClassificationKind } from '../lib/types'
import { GameActionKind } from '../context/GameContextReducer'
import useComputerPlayer from '../hooks/useComputerPlayer'
import { useEffect } from 'react'

const BuildPhase = () => {
  const {
    rackCapacity,
    letterBuyCost,
    letterSellValue,
    poolRefreshCost,
    poolTierMap,
    poolCapacityMap,
  } = gameConfig
  const gameState = useGameContext()
  const { round, activePlayer, rack, pool, gold, selectedLetter } = gameState
  const dispatch = useGameDispatchContext()

  const [runComputerPlayer] = useComputerPlayer()

  useEffect(() => {
    if (activePlayer.classification === PlayerClassificationKind.Computer) {
      runComputerPlayer()
    }
  }, [activePlayer.id])

  const highestPoolTier = getPoolTier(round, poolTierMap)
  const poolAmount = getPoolCapacity(round, poolCapacityMap)

  const { name: playerName, health, battleVictories } = activePlayer

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
        <button
          onClick={() => {
            dispatch({
              type: GameActionKind.RefreshPool,
            })
          }}
        >
          Refresh pool ({poolRefreshCost})
        </button>

        {selectedLetter && (
          <>
            {selectedLetter.origin === LetterOriginKind.Pool &&
              gold >= letterBuyCost && (
                <button
                  onClick={() =>
                    dispatch({
                      type: GameActionKind.BuyLetter,
                      payload: { letter: selectedLetter },
                    })
                  }
                >
                  Buy Letter ({letterBuyCost})
                </button>
              )}

            {selectedLetter.origin === LetterOriginKind.Pool && (
              <button
                onClick={() =>
                  dispatch({
                    type: GameActionKind.ToggleFreeze,
                    payload: { letter: selectedLetter },
                  })
                }
              >
                {selectedLetter.frozen ? 'Unfreeze' : 'Freeze'}
              </button>
            )}

            {selectedLetter.origin === LetterOriginKind.Rack && (
              <button
                onClick={() =>
                  dispatch({
                    type: GameActionKind.SellLetter,
                    payload: { letter: selectedLetter },
                  })
                }
              >
                Sell Letter ({letterSellValue})
              </button>
            )}
          </>
        )}

        <button
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            dispatch({
              type: GameActionKind.EndTurn,
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
