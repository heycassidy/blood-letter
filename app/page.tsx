'use client'

import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '../components/Layout'
import BuildPhase from '../components/BuildPhase'
import BattlePhase from '../components/BattlePhase'
import StartScreen from '../components/StartScreen'
import { useGameContext } from '../context/GameContext'
import { PhaseKind, PlayerClassificationKind } from '../lib/types'
import { css } from '../stitches.config'
import useComputerPlayer from '../hooks/useComputerPlayer'
import { globalStyles } from '../styles/globals'

globalStyles()

const Home: NextPage = () => {
  const gameState = useGameContext()
  const {
    phase,
    gameInProgress,
    gameOver,
    gameWinnerIndex,
    players,
    activePlayerIndex,
  } = gameState
  const gameWinner =
    gameWinnerIndex !== undefined ? players[gameWinnerIndex] : undefined

  const activePlayerClassification = players[activePlayerIndex].classification
  const computerPlayerIsThinking = useComputerPlayer(gameState)

  return (
    <div className={styles()}>
      <Head>
        <title>Blood Letter</title>
      </Head>

      <h1 style={{ margin: 0, flexBasis: '100%' }}>Blood Letter</h1>

      <Layout>
        {!gameInProgress && <StartScreen />}

        {gameOver && gameInProgress && gameWinner && (
          <>
            <h2 style={{ margin: 0, flexBasis: '100%' }}>
              {gameWinner.name} wins!
            </h2>
            <BattlePhase />
          </>
        )}

        {gameInProgress &&
          !gameOver &&
          phase === PhaseKind.Build &&
          activePlayerClassification === PlayerClassificationKind.Human && (
            <>
              <h3>Build Phase</h3>
              <BuildPhase />
            </>
          )}

        {gameInProgress && !gameOver && phase === PhaseKind.Battle && (
          <>
            <h3>Battle Phase</h3>
            <BattlePhase />
          </>
        )}

        {computerPlayerIsThinking &&
          activePlayerClassification === PlayerClassificationKind.Computer && (
            <>
              <p>Computer is thinking...</p>
            </>
          )}
      </Layout>
    </div>
  )
}

const styles = css({
  padding: '1rem',
  gap: '1rem',
  display: 'grid',
  justifyContent: 'start',
  justifyItems: 'start',
  '.layout h3': {
    marginBottom: '0',
  },
  '.global-controls': {
    borderTop: '2px solid $neutral275',
    justifySelf: 'stretch',
    paddingTop: '1rem',
  },
})

export default Home
