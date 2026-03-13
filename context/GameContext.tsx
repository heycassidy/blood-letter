'use client'

import {
  DragDropProvider,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
} from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import {
  PointerActivationConstraints,
} from '@dnd-kit/dom'
import type React from 'react'
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useReducer,
  useState,
} from 'react'
import LetterCard from '../components/LetterCard'
import { gameConfig } from '../lib/gameConfig'
import { createPlayer } from '../lib/Player'
import {
  DroppableKind,
  GameModeKind,
  type GameState,
  type Letter,
  LetterOriginKind,
  type Player,
  PlayerClassificationKind,
} from '../lib/types'
import {
  GameActionKind,
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
  const {
    initialRound,
    initialPhase,
    numberOfPlayers,
    rackCapacity,
    letterBuyCost,
    defaultGameMode,
  } = gameConfig

  const [state, dispatch] = useReducer(gameContextReducer, null, initGameState)
  const [clonedState, setClonedState] = useState<GameState | null>(null)

  const sensors = useCallback(
    () => [
      PointerSensor.configure({
        activationConstraints: [
          new PointerActivationConstraints.Distance({ value: 10 }),
        ],
      }),
      KeyboardSensor,
    ],
    []
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
          onDragStart={(event) => {
            const source = event.operation.source
            const draggingLetter: Letter | undefined = source?.data?.letter

            if (draggingLetter === undefined) {
              return
            }

            setClonedState(state)

            dispatch({
              type: GameActionKind.SetDraggingLetter,
              payload: draggingLetter,
            })
          }}
          onDragOver={(event) => {
            const source = event.operation.source
            const target = event.operation.target

            const overId = target?.id
            const letterId = source?.id

            const letter = source?.data?.letter
            const letterOrigin = letter?.origin

            if (letterId === undefined) {
              return
            }

            const rackIds = state.players[state.activePlayerIndex].rack.map(
              ({ id }) => id
            )

            if (
              letterOrigin === LetterOriginKind.Pool &&
              rackIds.length >= rackCapacity
            ) {
              return
            }

            if (!overId || overId === DroppableKind.Pool) {
              dispatch({
                type: GameActionKind.RemoveLetterFromRack,
                payload: { letterId },
              })
              return
            }

            if (
              letterOrigin === LetterOriginKind.Pool &&
              overId !== letterId &&
              !rackIds.includes(letterId) &&
              (overId === DroppableKind.Rack || rackIds.includes(overId))
            ) {
              dispatch({
                type: GameActionKind.DragLetterToRack,
                payload: { overId, letterId },
              })
              return
            }
          }}
          onDragEnd={(event) => {
            const { canceled } = event

            // Handle cancellation (replaces onDragCancel)
            if (canceled) {
              if (clonedState) {
                dispatch({
                  type: GameActionKind.Set,
                  payload: { state: clonedState },
                })
              }
              setClonedState(null)
              dispatch({
                type: GameActionKind.SetDraggingLetter,
                payload: null,
              })
              return
            }

            const source = event.operation.source
            const target = event.operation.target

            const overId = target?.id
            const letter = source?.data?.letter
            const letterOrigin = letter?.origin
            const rackIds = state.players[state.activePlayerIndex].rack.map(
              ({ id }) => id
            )

            // Pool letter dropped back on pool or outside rack — restore state
            if (
              letterOrigin === LetterOriginKind.Pool &&
              clonedState &&
              (!overId || overId === DroppableKind.Pool ||
                !(overId === DroppableKind.Rack || rackIds.includes(overId)))
            ) {
              dispatch({
                type: GameActionKind.Set,
                payload: { state: clonedState },
              })
              setClonedState(null)
              dispatch({
                type: GameActionKind.SetDraggingLetter,
                payload: null,
              })
              return
            }

            // cancelDrop validation: rack full or can't afford
            if (
              letterOrigin === LetterOriginKind.Pool &&
              clonedState &&
              (clonedState.players[clonedState.activePlayerIndex].rack.length >=
                rackCapacity ||
                clonedState.players[clonedState.activePlayerIndex].gold < letterBuyCost)
            ) {
              dispatch({
                type: GameActionKind.Set,
                payload: { state: clonedState },
              })
              setClonedState(null)
              dispatch({
                type: GameActionKind.SetDraggingLetter,
                payload: null,
              })
              return
            }

            dispatch({
              type: GameActionKind.SetDraggingLetter,
              payload: null,
            })

            // Handle pool → rack: spend gold
            if (
              overId &&
              letterOrigin === LetterOriginKind.Pool &&
              (overId === DroppableKind.Rack || rackIds.includes(overId))
            ) {
              dispatch({
                type: GameActionKind.SpendGold,
                payload: { amount: letterBuyCost },
              })
            }

            // Handle rack reordering via sortable index tracking
            if (source && isSortable(source)) {
              const { initialIndex, sortable } = source
              const newIndex = sortable.index

              if (initialIndex !== newIndex) {
                dispatch({
                  type: GameActionKind.MoveLetterInRack,
                  payload: {
                    letterId: state.players[state.activePlayerIndex].rack[initialIndex].id,
                    overId: state.players[state.activePlayerIndex].rack[newIndex].id,
                  },
                })
              }
            }

            dispatch({
              type: GameActionKind.SetLetterOrigins,
            })
          }}
        >
          {children}
          <DragOverlay>
            {(source) =>
              source ? (
                <LetterCard letter={source.data?.letter} />
              ) : null
            }
          </DragOverlay>
        </DragDropProvider>
      </GameDispatchContext.Provider>
    </GameContext.Provider>
  )
}
