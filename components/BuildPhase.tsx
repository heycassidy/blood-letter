import { gameConfig } from '../lib/gameConfig'
import { getPoolTier, getPoolCapacity } from '../lib/helpers'
import { css } from '../styled-system/css'
import Pool from './Pool'
import Rack from './Rack'
import InfoList from '../atoms/InfoList'
import { useGameContext, useGameDispatchContext } from '../context/GameContext'
import { LetterOriginKind } from '../lib/types'
import { GameActionKind } from '../context/GameContextReducer'
import Button from '../atoms/Button'

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
  const { round, players, activePlayerIndex, selectedLetter } = gameState
  const { rack, pool, gold } = players[activePlayerIndex]
  const dispatch = useGameDispatchContext()

  const highestPoolTier = getPoolTier(round, poolTierMap)
  const poolAmount = getPoolCapacity(round, poolCapacityMap)

  const activePlayer = players[activePlayerIndex]

  const { name: playerName, health, battleVictories } = activePlayer

  return (
    <div className={styles}>
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

      <div
        className={css({
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1',
          justifySelf: 'stretch',
        })}
      >
        <Button
          onClick={() => {
            dispatch({
              type: GameActionKind.RefreshPool,
            })
          }}
        >
          Refresh pool ({poolRefreshCost})
        </Button>

        {selectedLetter && (
          <>
            {selectedLetter.origin === LetterOriginKind.Pool &&
              gold >= letterBuyCost && (
                <Button
                  onClick={() =>
                    dispatch({
                      type: GameActionKind.BuyLetter,
                      payload: { letter: selectedLetter },
                    })
                  }
                >
                  Buy Letter ({letterBuyCost})
                </Button>
              )}

            {selectedLetter.origin === LetterOriginKind.Pool && (
              <Button
                onClick={() =>
                  dispatch({
                    type: GameActionKind.ToggleFreeze,
                    payload: { letter: selectedLetter },
                  })
                }
              >
                {selectedLetter.frozen ? 'Unfreeze' : 'Freeze'}
              </Button>
            )}

            {selectedLetter.origin === LetterOriginKind.Rack && (
              <Button
                onClick={() =>
                  dispatch({
                    type: GameActionKind.SellLetter,
                    payload: { letter: selectedLetter },
                  })
                }
              >
                Sell Letter ({letterSellValue})
              </Button>
            )}
          </>
        )}

        <Button
          onClick={() => {
            dispatch({
              type: GameActionKind.EndTurn,
            })
          }}
        >
          End Turn
        </Button>
      </div>
    </div>
  )
}

const styles = css({
  rowGap: '4',
  display: 'grid',
  justifyContent: 'start',
  justifyItems: 'start',
})

export default BuildPhase
