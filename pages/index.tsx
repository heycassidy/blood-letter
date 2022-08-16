import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '../components/Layout'
import BuildPhase from '../components/BuildPhase'
import BattlePhase from '../components/BattlePhase'
import { useGameContext } from '../context/GameContext'
import { BuildPhaseContextProvider } from '../context/BuildPhaseContext'
import { PhaseKind } from '../lib/types'

const Home: NextPage = () => {
  const { phase, togglePhase } = useGameContext()

  return (
    <div className="layout">
      <Head>
        <title>Blood Letter</title>
      </Head>

      <h1 style={{ margin: 0, flexBasis: '100%' }}>Blood Letter</h1>

      <Layout>
        <button onClick={togglePhase}>Toggle Phase</button>

        {phase === PhaseKind.Build && (
          <>
            <h3>Build Phase</h3>
            <BuildPhaseContextProvider>
              <BuildPhase />
            </BuildPhaseContextProvider>
          </>
        )}

        {phase === PhaseKind.Battle && (
          <>
            <h3>Battle Phase</h3>
            <BattlePhase />
          </>
        )}
      </Layout>

      <style jsx>{`
        .layout {
          padding: 1rem;
          gap: 1rem;
          display: grid;
          justify-content: start;
          justify-items: start;
        }
        .layout h3 {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  )
}

export default Home
