import { useContext, useEffect, useState } from 'react'
import { GameConfig } from '../context/GameConfig'
import css from 'styled-jsx/css'
import LetterStore from './LetterStore'
import Stage from './Stage'
import { useGameContext } from '../context/GameContext'
import { useBuildPhaseContext } from '../context/BuildPhaseContext'

const BuildPhase = () => {
  const { stageCapacity } = useContext(GameConfig)
  const { round, activePlayer, updatePlayer, getStoreTier, getStoreCapacity } =
    useGameContext()
  const { stage, store, rollStore } = useBuildPhaseContext()

  const highestTier = getStoreTier(round)
  const storeAmount = getStoreCapacity(round)

  const [showStage, setShowStage] = useState(false)

  const { name: playerName, gold, health, battleVictories } = activePlayer

  useEffect(() => {
    setShowStage(true)
  }, [])

  return (
    <div className="build-phase">
      <div className="info-list">
        <span className="info-box">
          <strong>{playerName}</strong>
        </span>
        <span className="info-box">Gold: {gold}</span>
        <span className="info-box">Health: {health}</span>
        <span className="info-box">Round: {round}</span>
        <span className="info-box">Wins: {battleVictories}</span>
      </div>

      {showStage && <Stage letters={stage} capacity={stageCapacity} />}

      <div className="info-list">
        <span className="info-box">Tier: {highestTier}</span>
      </div>

      <LetterStore letters={store} amount={storeAmount} />

      <div className="info-list" style={{ justifySelf: 'stretch' }}>
        <button onClick={rollStore}>Roll Store</button>
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

      <style jsx>{styles}</style>
    </div>
  )
}

const styles = css`
  .build-phase {
    gap: 1rem;
    display: grid;
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

export default BuildPhase
