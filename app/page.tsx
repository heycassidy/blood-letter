'use client'

import { enableMapSet } from 'immer'

import type { NextPage } from 'next'
import { useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import BuildPhase from '../components/BuildPhase'
import BattlePhase from '../components/BattlePhase'
import { useGameContext, useGameDispatchContext } from '../context/GameContext'
import { PhaseKind } from '../lib/types'
import { css } from '../stitches.config'
import useComputerPlayer from '../hooks/useComputerPlayer'
import { GameActionKind } from '../context/GameContextReducer'
import { globalStyles } from '../styles/globals'

globalStyles()
enableMapSet()

const Home: NextPage = () => {
  const gameState = useGameContext()
  const dispatch = useGameDispatchContext()
  const { phase, gameOver, gameWinnerId, players, activePlayerId } = gameState
  const [computerPlayerTurnState, computerPlayerTakingTurn] =
    useComputerPlayer(gameState)
  const gameWinner = players.get(gameWinnerId ?? '')

  useEffect(() => {
    console.log('COMPUTER PLAYER TAKING TURN: ', computerPlayerTakingTurn)
  }, [computerPlayerTakingTurn])

  useEffect(() => {
    if (computerPlayerTurnState) {
      dispatch({
        type: GameActionKind.Set,
        payload: { state: computerPlayerTurnState },
      })
    }
  }, [computerPlayerTurnState])

  return (
    <div className={styles()}>
      <Head>
        <title>Blood Letter</title>
      </Head>

      <h1 style={{ margin: 0, flexBasis: '100%' }}>Blood Letter</h1>

      <Layout>
        {gameOver && gameWinner && (
          <>
            <h2 style={{ margin: 0, flexBasis: '100%' }}>
              {gameWinner.name} wins!
            </h2>
          </>
        )}

        {!gameOver && phase === PhaseKind.Build && (
          <>
            <h3>Build Phase</h3>
            <BuildPhase />
          </>
        )}

        {!gameOver && phase === PhaseKind.Battle && (
          <>
            <h3>Battle Phase</h3>
            <BattlePhase />
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
