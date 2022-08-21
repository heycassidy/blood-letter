import type { AppProps } from 'next/app'
import { globalStyles } from '../styles/globals'
import { GameContextProvider } from '../context/GameContext'

function MyApp({ Component, pageProps }: AppProps) {
  globalStyles()

  return (
    <GameContextProvider>
      <Component {...pageProps} />
    </GameContextProvider>
  )
}

export default MyApp
