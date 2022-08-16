import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '../components/Layout'
import BuildPhase from '../components/BuildPhase'
import { useGameContext } from '../context/GameContext'
import { BuildPhaseContextProvider } from '../context/BuildPhaseContext'

const Home: NextPage = () => {
  const gameContext = useGameContext()
  const { togglePlayer } = gameContext

  return (
    <div className="layout">
      <Head>
        <title>Blood Letter</title>
      </Head>

      <h1 style={{ margin: 0, flexBasis: '100%' }}>Blood Letter</h1>

      <button onClick={togglePlayer}>Toggle Player</button>

      <Layout>
        <BuildPhaseContextProvider>
          <BuildPhase />
        </BuildPhaseContextProvider>
      </Layout>

      <style jsx>{`
        .layout {
          padding: 1rem;
          gap: 1rem;
          display: grid;
          justify-content: start;
          justify-items: start;
        }
      `}</style>
    </div>
  )
}

export default Home
