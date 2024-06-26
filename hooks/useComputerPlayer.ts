import { useGameContext } from '../context/GameContext'

const useComputerPlayer = () => {
  const { pool } = useGameContext()

  function runComputerPlayer() {
    console.log(pool)
  }

  return [runComputerPlayer]
}

export default useComputerPlayer
