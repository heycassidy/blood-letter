'use client'

import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import type React from 'react'
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useReducer,
  useRef,
} from 'react'
import LetterCard from '../components/LetterCard'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import { gameConfig } from '../lib/gameConfig'
import { createPlayer } from '../lib/Player'
import {
  GameModeKind,
  type GameState,
  type Player,
  PlayerClassificationKind,
} from '../lib/types'
import {
  type GameContextAction,
  gameContextReducer,
} from './GameContextReducer'

const GameContext = createContext<GameState | undefined>(undefined)
const GameDispatchContext = createContext<
  React.Dispatch<GameContextAction> | undefined
>(undefined)

export const useGameContext = () => {
  const context = useContext(GameContext)

  if (context === undefined) {
    throw Error('Game Context is undefined')
  }

  return context
}

export const useGameDispatchContext = () => {
  const context = useContext(GameDispatchContext)

  if (context === undefined) {
    throw Error('Game Dispatch Context is undefined')
  }

  return context
}

export const GameContextProvider = ({ children }: PropsWithChildren) => {
  const { initialRound, initialPhase, numberOfPlayers, defaultGameMode } =
    gameConfig

  const [state, dispatch] = useReducer(gameContextReducer, null, initGameState)
  const stateRef = useRef(state)
  stateRef.current = state

  const { sensors, onDragStart, onDragOver, onDragEnd } = useDragAndDrop(
    stateRef,
    dispatch
  )

  function initGameState(): GameState {
    const players: Player[] = []

    Array.from({ length: numberOfPlayers }).forEach((_, i) => {
      const playerName = `Player ${i + 1} ${
        defaultGameMode === GameModeKind.AgainstComputer && i !== 0
          ? '(computer)'
          : ''
      }`
      const playerClassification =
        defaultGameMode === GameModeKind.AgainstComputer && i !== 0
          ? PlayerClassificationKind.Computer
          : PlayerClassificationKind.Human

      const player = createPlayer({
        name: playerName,
        classification: playerClassification,
      })

      players.push(player)
    })

    return {
      players,
      activePlayerIndex: 0,
      battleWinnerIndex: undefined,
      gameWinnerIndex: undefined,
      round: initialRound,
      phase: initialPhase,
      gameOver: false,
      gameCount: 1,
      gameMode: defaultGameMode,
      gameInProgress: false,
      selectedLetter: null,
      draggingLetter: null,
    }
  }

  return (
    <GameContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        <DragDropProvider
          sensors={sensors}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          {children}
          <DragOverlay>
            {(source) =>
              source ? <LetterCard letter={source.data?.letter} /> : null
            }
          </DragOverlay>
        </DragDropProvider>
      </GameDispatchContext.Provider>
    </GameContext.Provider>
  )
}
