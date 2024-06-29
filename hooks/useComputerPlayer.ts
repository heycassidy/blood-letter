import { nanoid } from 'nanoid'
import Letter from '../lib/Letter'
import { useGameContext, useGameDispatchContext } from '../context/GameContext'
import { GameActionKind } from '../context/GameContextReducer'
import { computerPlayerMove } from '../lib/types'
import { gameConfig } from '../lib/gameConfig'
import { randomItem } from '../lib/helpers'
import { useEffect, useState } from 'react'

const useComputerPlayer = () => {
  const { letterBuyCost, poolRefreshCost, rackCapacity } = gameConfig
  const state = useGameContext()
  const dispatch = useGameDispatchContext()

  const [lastMove, setLastMove] = useState<computerPlayerMove | null>(null)
  const [possibleMoves, setPossibleMoves] = useState(computePossibleMoves())

  function runComputerPlayer() {
    const randomMove = randomItem(possibleMoves)
    randomMove.playMove()
    setLastMove(randomMove)
    setPossibleMoves(computePossibleMoves())
  }

  useEffect(() => {
    if (lastMove && possibleMoves.length > 0 && lastMove.name !== 'end-turn') {
      setTimeout(() => {
        runComputerPlayer()
      }, 100)
    }
  }, [lastMove?.id])

  // useEffect(() => {
  //   console.log(lastMove?.name)
  // }, [lastMove?.id])

  return [runComputerPlayer]

  function computePossibleMoves() {
    const { rack, pool, gold } = state

    const possibleMoves: computerPlayerMove[] = []

    // Buy Moves
    if (gold >= letterBuyCost && rack.length < rackCapacity) {
      Array.from(pool.values()).forEach((letter) => {
        possibleMoves.push({
          name: `buy-letter-${letter.name}`,
          id: nanoid(10),
          playMove: () => buyLetter(letter),
        })
      })
    }

    // Sell Moves
    rack.forEach((letter) => {
      possibleMoves.push({
        name: `sell-letter-${letter.name}-at-${rack.indexOf(letter)}`,
        id: nanoid(10),
        playMove: () => sellLetter(letter),
      })
    })

    // Freeze Moves
    pool
      .filter((letter) => !letter.frozen)
      .forEach((letter) => {
        possibleMoves.push({
          name: `freeze-letter-${letter.name}`,
          id: nanoid(10),
          playMove: () => freezeLetter(letter),
        })
      })

    // Thaw Moves
    pool
      .filter((letter) => letter.frozen)
      .forEach((letter) => {
        possibleMoves.push({
          name: `thaw-letter-${letter.name}`,
          id: nanoid(10),
          playMove: () => thawLetter(letter),
        })
      })

    // Re-arrange Moves
    rack.forEach((fromLetter) => {
      rack
        .filter((letter) => letter.id !== fromLetter.id)
        .forEach((toLetter) => {
          possibleMoves.push({
            name: `move-letter-${fromLetter.name}-at-${rack.indexOf(
              fromLetter
            )}-to-${toLetter.name}-at-${rack.indexOf(toLetter)}`,
            id: nanoid(10),
            playMove: () => moveLetterInRack(fromLetter, toLetter),
          })
        })
    })

    // Refresh Pool
    if (gold >= poolRefreshCost) {
      possibleMoves.push({
        name: 'refresh-pool',
        id: nanoid(10),
        playMove: () => refreshPool(),
      })
    }

    // End Turn
    possibleMoves.push({
      name: 'end-turn',
      id: nanoid(10),
      playMove: () => endTurn(),
    })

    return possibleMoves
  }

  function buyLetter(letter: Letter) {
    return dispatch({
      type: GameActionKind.BuyLetter,
      payload: { letter },
    })
  }

  function sellLetter(letter: Letter) {
    return dispatch({
      type: GameActionKind.SellLetter,
      payload: { letter },
    })
  }

  function freezeLetter(letter: Letter) {
    return dispatch({
      type: GameActionKind.ToggleFreeze,
      payload: { letter },
    })
  }

  function thawLetter(letter: Letter) {
    return dispatch({
      type: GameActionKind.ToggleFreeze,
      payload: { letter },
    })
  }

  function moveLetterInRack(letter: Letter, overLetter: Letter) {
    return dispatch({
      type: GameActionKind.MoveLetterInRack,
      payload: { letterId: letter.id, overId: overLetter.id },
    })
  }

  function refreshPool() {
    return dispatch({
      type: GameActionKind.RefreshPool,
    })
  }

  function endTurn() {
    return dispatch({
      type: GameActionKind.EndTurn,
    })
  }
}

export default useComputerPlayer
