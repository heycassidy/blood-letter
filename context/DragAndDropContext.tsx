import {
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react'
import { createPortal } from 'react-dom'
import {
  DragAndDropState,
  LetterOriginKind,
  DroppableKind,
  BuildPhaseState,
} from '../lib/types'
import Letter from '../lib/Letter'
import { GameConfigContext } from './GameConfigContext'
import { useBuildPhaseContext } from '../context/BuildPhaseContext'
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
import LetterCard from '../components/LetterCard'
import { CancelDropArguments } from '@dnd-kit/core/dist/components/DndContext/DndContext'

const DragAndDropContext = createContext<DragAndDropState | undefined>(
  undefined
)

export const useDragAndDropContext = () => {
  const context = useContext(DragAndDropContext)

  if (context === undefined) {
    throw Error('Drag and Drop Context is undefined')
  }

  return context
}

interface Props {
  children?: ReactNode
}

export const DragAndDropContextProvider = ({ children }: Props) => {
  const documentBodyRef = useRef<HTMLElement>()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    documentBodyRef.current = document.body
    setMounted(true)
  }, [])

  const { rackCapacity, letterBuyCost } = useContext(GameConfigContext)

  const {
    rack,
    pool,
    gold,
    addLetterToRack,
    removeLetterFromRack,
    moveLetterInRack,
    spendGold,
    setLetterOrigins,
    shallowMergeState,
  } = useBuildPhaseContext()

  const [state, dispatch] = useReducer(reducer, {
    draggingLetter: null,
  })

  const [clonedBuildPhaseState, setClonedBuildPhaseState] =
    useState<Partial<BuildPhaseState> | null>(null)

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

      const rackIds = rack.map(({ id }) => id)

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
    [rack, state.draggingLetter]
  )

  function handleDragStart({ active }: DragStartEvent) {
    const draggingLetter: Letter | undefined = active.data.current?.letter

    if (draggingLetter === undefined) {
      return false
    }

    setClonedBuildPhaseState({ rack, pool, gold })

    dispatch({
      type: ActionKind.SetDraggingLetter,
      payload: draggingLetter,
    })
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    const overId = over?.id
    const letterId = active?.id

    const letter = active?.data?.current?.letter
    const letterOrigin = letter?.origin

    if (letterId === undefined) {
      return
    }

    const rackIds = rack.map(({ id }) => id)

    if (
      letterOrigin === LetterOriginKind.Pool &&
      rackIds.length >= rackCapacity
    ) {
      return
    }

    if (!overId || overId === DroppableKind.Pool) {
      removeLetterFromRack(letterId)
      return
    }

    if (
      letterOrigin === LetterOriginKind.Pool &&
      overId !== letterId &&
      !rackIds.includes(letterId) &&
      (overId === DroppableKind.Rack || rackIds.includes(overId))
    ) {
      addLetterToRack(letterId, overId)
      return
    }
  }

  function handleDragCancel({}: DragCancelEvent) {
    if (clonedBuildPhaseState) {
      shallowMergeState(clonedBuildPhaseState)
    }
    setClonedBuildPhaseState(null)
    dispatch({
      type: ActionKind.SetDraggingLetter,
      payload: null,
    })
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    dispatch({
      type: ActionKind.SetDraggingLetter,
      payload: null,
    })

    const overId = over?.id
    const letterId = active?.id
    const letter = active?.data?.current?.letter
    const letterOrigin = letter?.origin
    const rackIds = rack.map(({ id }) => id)

    if (
      overId &&
      letterOrigin === LetterOriginKind.Pool &&
      (overId === DroppableKind.Rack || rackIds.includes(overId))
    ) {
      spendGold(letterBuyCost)
    }

    if (overId && (overId === DroppableKind.Rack || rackIds.includes(overId))) {
      moveLetterInRack(letterId, overId)
    }

    setLetterOrigins()
  }

  function cancelDrop({ active }: CancelDropArguments) {
    const letter = active?.data?.current?.letter
    const letterOrigin = letter?.origin

    if (
      clonedBuildPhaseState?.gold === undefined ||
      clonedBuildPhaseState?.rack?.length === undefined
    ) {
      return true
    }

    if (
      letterOrigin === LetterOriginKind.Pool &&
      (clonedBuildPhaseState.rack.length >= rackCapacity ||
        clonedBuildPhaseState.gold < letterBuyCost)
    ) {
      return true
    }

    return false
  }

  return (
    <DragAndDropContext.Provider value={state}>
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

        {mounted
          ? createPortal(
              <DragOverlay>
                {state.draggingLetter ? (
                  <LetterCard letter={state.draggingLetter} />
                ) : null}
              </DragOverlay>,
              document.body
            )
          : null}
      </DndContext>
    </DragAndDropContext.Provider>
  )
}

enum ActionKind {
  SetDraggingLetter,
}
interface SetDraggingLetterAction {
  type: ActionKind.SetDraggingLetter
  payload: Letter | null
}

type DragAndDropContextAction = SetDraggingLetterAction

const reducer = (
  state: DragAndDropState,
  action: DragAndDropContextAction
): DragAndDropState => {
  const { type, payload } = action

  switch (type) {
    case ActionKind.SetDraggingLetter: {
      return {
        ...state,
        draggingLetter: payload,
      }
    }

    default:
      throw new Error()
  }
}
