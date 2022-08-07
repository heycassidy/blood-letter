import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '../components/Layout'
import LetterStore from '../components/LetterStore'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Blood Letter</title>
      </Head>

      <Layout>
        <h1 style={{ margin: 0, flexBasis: '100%' }}>Blood Letter</h1>
        <LetterStore highestTier={1} amount={3} />
        <LetterStore highestTier={2} amount={3} />
        <LetterStore highestTier={3} amount={4} />
        <LetterStore highestTier={4} amount={4} />
        <LetterStore highestTier={5} amount={5} />
        <LetterStore highestTier={6} amount={5} />
      </Layout>
    </div>
  )
}

export default Home
