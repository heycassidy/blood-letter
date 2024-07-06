import React, {
  PropsWithChildren,
  createContext,
  useState,
  useContext,
  useReducer,
  useCallback,
} from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragCancelEvent,
  DragStartEvent,
  DragOverEvent,
  rectIntersection,
  CollisionDetection,
  pointerWithin,
  KeyboardSensor,
} from '@dnd-kit/core'
import { CancelDropArguments } from '@dnd-kit/core/dist/components/DndContext/DndContext'
import {
  GameState,
  LetterOriginKind,
  PlayerClassificationKind,
  GameModeKind,
  DroppableKind,
  UUID,
} from '../lib/types'
import Letter from '../lib/Letter'
import Player from '../lib/Player'
import { gameConfig } from '../lib/gameConfig'
import LetterCard from '../components/LetterCard'
import {
  gameContextReducer,
  GameContextAction,
  GameActionKind,
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
    initialGold,
    numberOfPlayers,
    rackCapacity,
    letterBuyCost,
  } = gameConfig

  const [state, dispatch] = useReducer(gameContextReducer, null, initGameState)
  const [clonedState, setClonedState] = useState<GameState | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      const { active, droppableContainers } = args

      const letterId = active?.id
      const letter = active?.data?.current?.letter
      const letterOrigin = letter?.origin

      const rackIds = state.rack.map(({ id }) => id)

      const rackCollisions = pointerWithin({
        ...args,
        droppableContainers: droppableContainers.filter(
          ({ id }) => id === DroppableKind.Rack
        ),
      })

      const letterCollisions = closestCenter({
        ...args,
        droppableContainers: droppableContainers.filter(({ id }) =>
          rackIds.includes(id)
        ),
      })

      if (
        letterOrigin === LetterOriginKind.Rack &&
        rackIds.includes(letterId)
      ) {
        return letterCollisions
      }

      if (
        letterOrigin === LetterOriginKind.Pool &&
        rackCollisions.length > 0 &&
        rackIds.filter((id) => letterId !== id).length > 0
      ) {
        return letterCollisions
      }

      return rectIntersection(args)
    },
    [state.rack, state.draggingLetter]
  )

  function initGameState(): GameState {
    const gameMode = GameModeKind.AgainstComputer
    // const gameMode: GameModeKind = GameModeKind.PassToPlay

    const players: Map<UUID, Player> = new Map()

    Array.from({ length: numberOfPlayers }).map((_, i) => {
      let player

      if (gameMode === GameModeKind.AgainstComputer && i !== 0) {
        player = new Player({
          name: `Player ${i + 1} (computer)`,
          classification: PlayerClassificationKind.Computer,
        })
      } else {
        player = new Player({
          name: `Player ${i + 1}`,
          classification: PlayerClassificationKind.Human,
        })
      }

      players.set(player.id, player)
    })

    const firstPlayer = [...players.values()][0]

    return {
      players,
      activePlayerId: firstPlayer.id,
      battleWinnerId: undefined,
      gameWinnerId: undefined,
      round: initialRound,
      phase: initialPhase,
      gameOver: false,
      gameCount: 1,
      gameMode,

      rack: firstPlayer.rack,
      pool: firstPlayer.pool,
      gold: initialGold,
      selectedLetter: null,
      draggingLetter: null,

      restartGame,
    }
  }

  function restartGame(): void {
    dispatch({
      type: GameActionKind.RestartGame,
      payload: { state: initGameState() },
    })
  }

  // DnD-Kit Handlers:
  function handleDragStart({ active }: DragStartEvent): void {
    const draggingLetter: Letter | undefined = active.data.current?.letter

    if (draggingLetter === undefined) {
      return
    }

    setClonedState(state)

    dispatch({
      type: GameActionKind.SetDraggingLetter,
      payload: draggingLetter,
    })
  }

  function handleDragOver({ active, over }: DragOverEvent): void {
    const overId = over?.id
    const letterId = active?.id

    const letter = active?.data?.current?.letter
    const letterOrigin = letter?.origin

    if (letterId === undefined) {
      return
    }

    const rackIds = state.rack.map(({ id }) => id)

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
  }

  function handleDragCancel({}: DragCancelEvent): void {
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
  }

  function handleDragEnd({ active, over }: DragEndEvent): void {
    dispatch({
      type: GameActionKind.SetDraggingLetter,
      payload: null,
    })

    const overId = over?.id
    const letter = active?.data?.current?.letter
    const overLetter = over?.data?.current?.letter
    const letterOrigin = letter?.origin
    const rackIds = state.rack.map(({ id }) => id)

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

    if (
      overId &&
      (overId === DroppableKind.Rack || rackIds.includes(overId)) &&
      letter &&
      overLetter
    ) {
      dispatch({
        type: GameActionKind.MoveLetterInRack,
        payload: { letterId: letter.id, overId: overLetter.id },
      })
    }

    dispatch({
      type: GameActionKind.SetLetterOrigins,
    })
  }

  function cancelDrop({ active }: CancelDropArguments): boolean {
    const letter = active?.data?.current?.letter
    const letterOrigin = letter?.origin

    if (!clonedState) return true

    if (
      letterOrigin === LetterOriginKind.Pool &&
      (clonedState.rack.length >= rackCapacity ||
        clonedState.gold < letterBuyCost)
    ) {
      console.log('cancelled')
      return true
    }

    return false
  }

  return (
    <GameContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          cancelDrop={cancelDrop}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        >
          {children}
          <DragOverlay>
            {state.draggingLetter ? (
              <LetterCard letter={state.draggingLetter} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </GameDispatchContext.Provider>
    </GameContext.Provider>
  )
}
