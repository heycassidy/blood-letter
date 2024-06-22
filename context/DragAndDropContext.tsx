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
  ItemOriginKind,
  DroppableKind,
  BuildPhaseState,
} from '../lib/types'
import Letter from '../lib/Letter'
import Blot from '../lib/Blot'
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
import BlotCard from '../components/BlotCard'
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
    well,
    pool,
    gold,
    addLetterToRack,
    removeLetterFromRack,
    moveLetterInRack,
    addBlotToLetter,
    removeBlotFromLetter,
    spendGold,
    setLetterOrigins,
    shallowMergeState,
  } = useBuildPhaseContext()

  const [state, dispatch] = useReducer(reducer, {
    draggingItem: null,
  })

  useEffect(() => {
    // console.log(state.draggingItem)
  }, [state.draggingItem])

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

      const activeItem = active.data.current?.item
      const activeItemOriginKind = active.data.current?.item?.origin

      const rackCollisions = pointerWithin({
        ...args,
        droppableContainers: droppableContainers.filter(({ data }) => {
          return data.current?.droppableKind === DroppableKind.Rack
        }),
      })

      const letterCollisions = closestCenter({
        ...args,
        droppableContainers: droppableContainers.filter(({ data }) => {
          return data.current?.droppableKind === DroppableKind.Letter
        }),
      })

      if (
        activeItemOriginKind === ItemOriginKind.Rack &&
        activeItem instanceof Letter
      ) {
        return letterCollisions
      }

      if (
        activeItemOriginKind === ItemOriginKind.Pool &&
        rackCollisions.length > 0
      ) {
        return letterCollisions
      }

      return rectIntersection(args)
    },
    [rack, well, state.draggingItem]
  )

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      const activeItem = active.data.current?.item

      if (!(activeItem instanceof Letter || activeItem instanceof Blot)) {
        return false
      }

      setClonedBuildPhaseState({ rack, pool, well, gold })

      dispatch({
        type: ActionKind.SetDraggingItem,
        payload: activeItem,
      })
    },
    [rack, pool, well, gold]
  )

  const handleDragCancel = useCallback(
    ({}: DragCancelEvent) => {
      if (clonedBuildPhaseState) {
        shallowMergeState(clonedBuildPhaseState)
      }
      setClonedBuildPhaseState(null)
      dispatch({
        type: ActionKind.SetDraggingItem,
        payload: null,
      })
    },
    [clonedBuildPhaseState]
  )

  const handleDragOver = useCallback(
    ({ active, over }: DragOverEvent) => {
      // if (!over) return

      const activeItem = active.data.current?.item
      const overItemKind = over?.data.current?.droppableKind
      const activeItemOriginKind = active.data.current?.item?.origin
      const overItemOriginKind = over?.data.current?.item?.origin
      const overId = over?.data.current?.item?.id
      const activeId = active.data.current?.item?.id
      const rackIds = rack.map(({ id }) => id)

      console.log(overItemKind)

      if (activeItem instanceof Letter) {
        if (
          overItemKind !== DroppableKind.Rack ||
          overItemKind !== DroppableKind.Letter
        ) {
          removeLetterFromRack(activeId)
          // return
        }

        if (
          // if the letter is already in the rack OR
          rackIds.includes(activeId) ||
          // if the rack is full OR
          rackIds.length >= rackCapacity ||
          // if letter is not from the pool
          activeItemOriginKind !== ItemOriginKind.Pool
        ) {
          // do nothing
          return
        }

        if (
          // if over a the rack OR
          overItemKind === DroppableKind.Rack ||
          // if over a Letter
          overItemKind === DroppableKind.Letter
        ) {
          addLetterToRack(activeId, overId)
          return
        }
      }

      if (activeItem instanceof Blot) {
        if (overItemKind !== DroppableKind.Letter) {
          removeBlotFromLetter(activeId)
          return
        }

        if (
          // if over a letter in the rack
          overItemKind === DroppableKind.Letter &&
          overItemOriginKind === ItemOriginKind.Rack
        ) {
          // Add blot to letter
          removeBlotFromLetter(activeId)
          addBlotToLetter(activeId, overId)
          return
        }
      }
    },
    [rack]
  )

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      dispatch({
        type: ActionKind.SetDraggingItem,
        payload: null,
      })

      const activeItem = active.data.current?.item

      if (activeItem instanceof Letter) {
        handleLetterDragEnd({ active, over })
      }

      if (activeItem instanceof Blot) {
        handleBlotDragEnd({ active, over })
      }
    },
    [rack]
  )

  const cancelDrop = useCallback(
    ({ active }: CancelDropArguments) => {
      const activeItem = active.data.current?.item

      if (activeItem instanceof Letter) {
        return cancelLetterDrop({ active })
      }

      if (activeItem instanceof Letter) {
        return cancelBlotDrop({ active })
      }

      return false
    },
    [clonedBuildPhaseState]
  )

  function cancelLetterDrop({ active }: Pick<CancelDropArguments, 'active'>) {
    const activeItem = active.data.current?.item
    const activeItemOrigin = activeItem?.origin

    if (
      clonedBuildPhaseState?.gold === undefined ||
      clonedBuildPhaseState?.rack?.length === undefined
    ) {
      return true
    }

    if (
      activeItemOrigin === ItemOriginKind.Pool &&
      (clonedBuildPhaseState.rack.length >= rackCapacity ||
        clonedBuildPhaseState.gold < letterBuyCost)
    ) {
      return true
    }

    return false
  }

  function handleLetterDragEnd({
    active,
    over,
  }: Pick<DragEndEvent, 'active' | 'over'>) {
    if (!over) return

    const overId = over.data.current?.item?.id
    const activeItem = active.data.current?.item

    const rackLetterIds = rack.map(({ id }) => id)

    if (
      activeItem?.origin === ItemOriginKind.Pool &&
      (overId === DroppableKind.Rack || rackLetterIds.includes(overId))
    ) {
      spendGold(letterBuyCost)
    }

    if (overId === DroppableKind.Rack || rackLetterIds.includes(overId)) {
      moveLetterInRack(activeItem?.id, overId)
    }

    setLetterOrigins()
  }

  function handleBlotDragEnd({
    active,
    over,
  }: Pick<DragEndEvent, 'active' | 'over'>) {
    if (!over) return

    // console.log(over)

    return
  }

  function cancelBlotDrop({ active }: Pick<CancelDropArguments, 'active'>) {
    const activeItem = active.data.current?.item
    const activeItemOrigin = activeItem?.origin

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
                {state.draggingItem instanceof Letter && (
                  <LetterCard letter={state.draggingItem} />
                )}

                {state.draggingItem instanceof Blot && (
                  <BlotCard blot={state.draggingItem} />
                )}
              </DragOverlay>,
              document.body
            )
          : null}
      </DndContext>
    </DragAndDropContext.Provider>
  )
}

enum ActionKind {
  SetDraggingItem,
}
interface SetDraggingItemAction {
  type: ActionKind.SetDraggingItem
  payload: Letter | Blot | null
}

type DragAndDropContextAction = SetDraggingItemAction

const reducer = (
  state: DragAndDropState,
  action: DragAndDropContextAction
): DragAndDropState => {
  const { type, payload } = action

  switch (type) {
    case ActionKind.SetDraggingItem: {
      return {
        ...state,
        draggingItem: payload,
      }
    }

    default:
      throw new Error()
  }
}
