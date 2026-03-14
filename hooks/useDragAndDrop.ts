import { PointerActivationConstraints } from '@dnd-kit/dom'
import {
  type DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import { type ComponentProps, useCallback, useState } from 'react'
import {
  GameActionKind,
  type GameContextAction,
} from '../context/GameContextReducer'
import { gameConfig } from '../lib/gameConfig'
import {
  DroppableKind,
  type GameState,
  type Letter,
  LetterOriginKind,
} from '../lib/types'

type DragDropProviderProps = ComponentProps<typeof DragDropProvider>

const { rackCapacity, letterBuyCost } = gameConfig

export const useDragAndDrop = (
  stateRef: React.RefObject<GameState>,
  dispatch: React.Dispatch<GameContextAction>
) => {
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

  const onDragStart: DragDropProviderProps['onDragStart'] = (event) => {
    const source = event.operation.source
    const draggingLetter: Letter | undefined = source?.data?.letter

    if (draggingLetter === undefined) {
      return
    }

    setClonedState(stateRef.current)

    dispatch({
      type: GameActionKind.SetDraggingLetter,
      payload: draggingLetter,
    })
  }

  const onDragOver: DragDropProviderProps['onDragOver'] = (event) => {
    const source = event.operation.source
    const target = event.operation.target

    const overId = target?.id
    const letterId = source?.id

    const letter = source?.data?.letter
    const letterOrigin = letter?.origin

    if (letterId === undefined) {
      return
    }

    const currentState = stateRef.current
    const rackIds = currentState.players[
      currentState.activePlayerIndex
    ].rack.map(({ id }) => id)

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

  const onDragEnd: DragDropProviderProps['onDragEnd'] = (event) => {
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

    const currentState = stateRef.current
    const source = event.operation.source
    const target = event.operation.target

    const overId = target?.id
    const letter = source?.data?.letter
    const letterOrigin = letter?.origin
    const rackIds = currentState.players[
      currentState.activePlayerIndex
    ].rack.map(({ id }) => id)

    // Pool letter dropped back on pool or outside rack — restore state
    if (
      letterOrigin === LetterOriginKind.Pool &&
      clonedState &&
      (!overId ||
        overId === DroppableKind.Pool ||
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
        const latestState = stateRef.current
        dispatch({
          type: GameActionKind.MoveLetterInRack,
          payload: {
            letterId:
              latestState.players[latestState.activePlayerIndex].rack[
                initialIndex
              ].id,
            overId:
              latestState.players[latestState.activePlayerIndex].rack[newIndex]
                .id,
          },
        })
      }
    }

    dispatch({
      type: GameActionKind.SetLetterOrigins,
    })
  }

  return { sensors, onDragStart, onDragOver, onDragEnd }
}
