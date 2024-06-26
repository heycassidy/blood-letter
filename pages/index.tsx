import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '../components/Layout'
import BuildPhase from '../components/BuildPhase'
import BattlePhase from '../components/BattlePhase'
import { useGameContext } from '../context/GameContext'
import { PhaseKind } from '../lib/types'
import { css } from '../stitches.config'

const Home: NextPage = () => {
  const { phase, gameOver, gameWinner, restartGame } = useGameContext()

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

        <div className="global-controls">
          <button onClick={restartGame}>Restart Game</button>
        </div>
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
