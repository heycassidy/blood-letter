import { useContext, useEffect, useState } from 'react'
import { GameConfig } from '../context/GameConfig'
import css from 'styled-jsx/css'
import LetterStore from './LetterStore'
import Stage from './Stage'
import { useGameContext } from '../context/GameContext'
import { useBuildPhaseContext } from '../context/BuildPhaseContext'

const BuildPhase = () => {
  const { stageCapacity, storeTierFromRound, storeCapacityFromRound } =
    useContext(GameConfig)
  const { round, activePlayer } = useGameContext()
  const { stage, store, rollStore } = useBuildPhaseContext()

  const highestTier = storeTierFromRound(round)
  const storeAmount = storeCapacityFromRound(round)

  const [showStage, setShowStage] = useState(false)

  const { name: playerName, gold, health } = activePlayer

  useEffect(() => {
    setShowStage(true)
  }, [])

  return (
    <div className="staging-view">
      <div className="info-list">
        <span className="info-box">{playerName}</span>
        <span className="info-box">Turn: {round}</span>
        <span className="info-box">Gold: {gold}</span>
        <span className="info-box">Health: {health}</span>
      </div>

      {showStage && <Stage letters={stage} capacity={stageCapacity} />}

      <div className="info-list">
        <span className="info-box">Tier: {highestTier}</span>
      </div>

      <LetterStore letters={store} amount={storeAmount} />

      <div className="info-list">
        <button onClick={rollStore}>Roll Store</button>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}

const styles = css`
  .staging-view {
    gap: 1rem;
    display: grid;
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

export default BuildPhase
