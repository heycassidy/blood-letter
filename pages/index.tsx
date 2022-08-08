import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '../components/Layout'
import StagingView from '../components/StagingView'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Blood Letter</title>
      </Head>

      <Layout>
        <h1 style={{ margin: 0, flexBasis: '100%' }}>Blood Letter</h1>

        <StagingView highestTier={3} storeAmount={4} stageAmount={6} />
      </Layout>
    </div>
  )
}

export default Home
