import type { AppProps } from 'next/app'
import { globalStyles } from '../styles/globals'
import { GameContextProvider } from '../context/GameContext'

globalStyles()

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GameContextProvider>
      <Component {...pageProps} />
    </GameContextProvider>
  )
}

export default MyApp
