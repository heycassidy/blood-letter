import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { GameContextProvider } from '../context/GameContext'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GameContextProvider>
      <Component {...pageProps} />
    </GameContextProvider>
  )
}

export default MyApp
