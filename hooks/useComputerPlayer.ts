import { useGameContext } from '../context/GameContext'
import { GameMove } from '../lib/types'
import { randomItem } from '../lib/helpers'
import { useEffect, useState } from 'react'

const useComputerPlayer = () => {
  const { rack, pool, gold, getAvailableMoves } = useGameContext()

  const [lastMove, setLastMove] = useState<GameMove | null>(null)
  const [moves, setMoves] = useState<GameMove[]>(
    getAvailableMoves({ rack, pool, gold })
  )

  function runComputerPlayer() {
    const randomMove = randomItem(moves)

    randomMove.execute()
    setLastMove(randomMove)
    setMoves(getAvailableMoves({ rack, pool, gold }))
  }

  useEffect(() => {
    if (lastMove && moves.length > 0 && lastMove.name !== 'end-turn') {
      setTimeout(() => {
        runComputerPlayer()
      }, 100)
    }
  }, [lastMove?.id])

  return [runComputerPlayer]
}

export default useComputerPlayer
