import '../styles/globals.css'
import { useContext, useState } from 'react'
import type { AppProps } from 'next/app'
import { PlayerContext } from '../context/PlayerState'
import { GameConfig } from '../context/GameConfig'

function MyApp({ Component, pageProps }: AppProps) {
  const { initialGold } = useContext(GameConfig)
  const [gold, setGold] = useState(initialGold)

  return (
    <PlayerContext.Provider value={{ gold, setGold }}>
      <Component {...pageProps} />
    </PlayerContext.Provider>
  )
}

export default MyApp
