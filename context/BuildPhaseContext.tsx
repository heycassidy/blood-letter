import { nanoid } from 'nanoid'
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
  BuildPhaseState,
  Letter,
  Player,
  LetterOriginKind,
  DroppableKind,
  UUID,
} from '../lib/types'
import { wordList } from '../lib/words'
import { GameConfigContext } from './GameConfigContext'
import { useGameContext } from '../context/GameContext'
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
import { arrayMove } from '@dnd-kit/sortable'
import { sumItemProperty, concatItemProperty } from '../lib/helpers'
import LetterCard from '../components/LetterCard'
import { CancelDropArguments } from '@dnd-kit/core/dist/components/DndContext/DndContext'

const BuildPhaseContext = createContext<BuildPhaseState | undefined>(undefined)

export const useBuildPhaseContext = () => {
  const context = useContext(BuildPhaseContext)

  if (context === undefined) {
    throw Error('Build Phase Context is undefined')
  }

  return context
}

interface Props {
  children?: ReactNode
}

export const BuildPhaseContextProvider = ({ children }: Props) => {
  const documentBodyRef = useRef<HTMLElement>()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    documentBodyRef.current = document.body
    setMounted(true)
  }, [])

  const {
    alphabet,
    rackCapacity,
    letterBuyCost,
    letterSellValue,
    storeRefreshCost,
    wordBonusComputation,
  } = useContext(GameConfigContext)

  const {
    round,
    gameCount,
    activePlayer,
    updatePlayer,
    getStoreTier,
    getStoreCapacity,
    getStoreLetters,
  } = useGameContext()

  const storeAmount = getStoreCapacity(round)
  const storeTier = getStoreTier(round)

  const initState = (player: Player): BuildPhaseState => {
    return {
      rack: player.rack,
      store: player.store,
      gold: player.gold,
      selectedLetter: null,
      draggingLetter: null,

      buyLetter,
      sellLetter,
      freezeLetter,
      selectLetter,
      rollStore,
    }
  }

  const [state, dispatch] = useReducer(reducer, activePlayer, initState)
  const [clonedState, setClonedState] = useState<BuildPhaseState | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    const letters = state.rack
    const word = concatItemProperty(letters, 'name')

    const rackScore = sumItemProperty(letters, 'value')

    const wordBonus = wordList.includes(word)
      ? wordBonusComputation(letters)
      : 0
    const roundScore = rackScore + wordBonus

    updatePlayer(activePlayer.id, {
      store: state.store,
      rack: state.rack,
      gold: state.gold,
      rackScore,
      wordBonus,
      roundScore,
    })
  }, [state.store, state.rack, state.gold])

  useEffect(() => {
    if (gameCount > 0) {
      dispatch({
        type: ActionKind.Reset,
        payload: { state: initState(activePlayer) },
      })
    }
  }, [gameCount])

  useEffect(() => {
    dispatch({
      type: ActionKind.RecallPlayer,
      payload: {
        newRandomLetters: getStoreLetters(
          alphabet,
          storeTier,
          storeAmount,
          nanoid
        ),
        player: activePlayer,
      },
    })
  }, [activePlayer.id])

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
        letterOrigin === LetterOriginKind.Store &&
        rackCollisions.length > 0 &&
        rackIds.filter((id) => letterId !== id).length > 0
      ) {
        return letterCollisions
      }

      return rectIntersection(args)
    },
    [state.rack, state.draggingLetter]
  )

  function handleDragStart({ active }: DragStartEvent) {
    const draggingLetter: Letter | undefined = active.data.current?.letter

    if (draggingLetter === undefined) {
      return false
    }

    setClonedState(state)

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

    const rackIds = state.rack.map(({ id }) => id)

    if (
      letterOrigin === LetterOriginKind.Store &&
      rackIds.length >= rackCapacity
    ) {
      return
    }

    if (!overId || overId === DroppableKind.Store) {
      dispatch({
        type: ActionKind.RemoveLetterFromRack,
        payload: { letterId },
      })
      return
    }

    if (
      letterOrigin === LetterOriginKind.Store &&
      overId !== letterId &&
      !rackIds.includes(letterId) &&
      (overId === DroppableKind.Rack || rackIds.includes(overId))
    ) {
      dispatch({
        type: ActionKind.DragLetterToRack,
        payload: { overId, letterId },
      })
      return
    }
  }

  function handleDragCancel({}: DragCancelEvent) {
    if (clonedState) {
      dispatch({
        type: ActionKind.Reset,
        payload: { state: clonedState },
      })
    }
    setClonedState(null)
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
    const rackIds = state.rack.map(({ id }) => id)

    if (
      overId &&
      letterOrigin === LetterOriginKind.Store &&
      (overId === DroppableKind.Rack || rackIds.includes(overId))
    ) {
      dispatch({
        type: ActionKind.SpendGold,
        payload: { amount: letterBuyCost },
      })
    }

    if (overId && (overId === DroppableKind.Rack || rackIds.includes(overId))) {
      dispatch({
        type: ActionKind.DragToSortRack,
        payload: { overId, letterId },
      })
    }

    dispatch({
      type: ActionKind.SetLetterOrigins,
    })
  }

  function cancelDrop({ active }: CancelDropArguments) {
    const letter = active?.data?.current?.letter
    const letterOrigin = letter?.origin

    if (!clonedState) return true

    if (
      letterOrigin === LetterOriginKind.Store &&
      (clonedState.rack.length >= rackCapacity ||
        clonedState.gold < letterBuyCost)
    ) {
      console.log('cancelled')
      return true
    }

    return false
  }

  function buyLetter(letter: Letter): void {
    dispatch({
      type: ActionKind.Buy,
      payload: { letter, cost: letterBuyCost, maxLetters: rackCapacity },
    })
  }

  function sellLetter(letter: Letter): void {
    dispatch({
      type: ActionKind.Sell,
      payload: { letter, refund: letterSellValue },
    })
  }

  function freezeLetter(letter: Letter): void {
    dispatch({
      type: ActionKind.ToggleFreeze,
      payload: { letter },
    })
  }

  function selectLetter(letter: Letter | null): void {
    dispatch({
      type: ActionKind.SelectLetter,
      payload: { letter },
    })
  }

  function rollStore(): void {
    dispatch({
      type: ActionKind.RollStore,
      payload: {
        newRandomLetters: getStoreLetters(
          alphabet,
          storeTier,
          storeAmount,
          nanoid
        ),
        cost: storeRefreshCost,
      },
    })
  }

  return (
    <BuildPhaseContext.Provider value={state}>
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
    </BuildPhaseContext.Provider>
  )
}

enum ActionKind {
  Reset,
  Buy,
  Sell,
  ToggleFreeze,
  SpendGold,
  SelectLetter,
  SetDraggingLetter,
  DragLetterToRack,
  DragToSortRack,
  SetLetterOrigins,
  RemoveLetterFromRack,
  RollStore,
  RecallPlayer,
}
interface ResetAction {
  type: ActionKind.Reset
  payload: { state: BuildPhaseState }
}
interface BuyAction {
  type: ActionKind.Buy
  payload: { letter: Letter; index?: number; cost: number; maxLetters: number }
}
interface SellAction {
  type: ActionKind.Sell
  payload: { letter: Letter; refund: number }
}
interface ToggleFreezeAction {
  type: ActionKind.ToggleFreeze
  payload: { letter: Letter }
}
interface SpendGold {
  type: ActionKind.SpendGold
  payload: { amount: number }
}
interface SelectLetterAction {
  type: ActionKind.SelectLetter
  payload: { letter: Letter | null }
}
interface SetDraggingLetterAction {
  type: ActionKind.SetDraggingLetter
  payload: Letter | null
}
interface DragLetterToRack {
  type: ActionKind.DragLetterToRack
  payload: { overId: UUID; letterId: UUID }
}
interface RemoveLetterFromRack {
  type: ActionKind.RemoveLetterFromRack
  payload: { letterId: UUID }
}
interface DragToSortRackAction {
  type: ActionKind.DragToSortRack
  payload: { overId: UUID; letterId: UUID }
}
interface SetLetterOrigins {
  type: ActionKind.SetLetterOrigins
  payload?: undefined
}
interface RollStoreAction {
  type: ActionKind.RollStore
  payload: { newRandomLetters: Letter[]; cost: number }
}
interface RecallPlayerAction {
  type: ActionKind.RecallPlayer
  payload: { player: Player; newRandomLetters: Letter[] }
}

type BuildPhaseContextAction =
  | ResetAction
  | BuyAction
  | SellAction
  | ToggleFreezeAction
  | SpendGold
  | SelectLetterAction
  | SetDraggingLetterAction
  | DragLetterToRack
  | RemoveLetterFromRack
  | RollStoreAction
  | DragToSortRackAction
  | SetLetterOrigins
  | RecallPlayerAction

const reducer = (
  state: BuildPhaseState,
  action: BuildPhaseContextAction
): BuildPhaseState => {
  const { type, payload } = action

  switch (type) {
    case ActionKind.Reset: {
      return payload.state
    }

    case ActionKind.Buy: {
      const { cost, maxLetters, index } = payload

      if (state.rack.length >= maxLetters) return state
      if (state.gold < cost) return state

      const insertAt = index ?? state.rack.length

      const newRack = [...state.rack]

      newRack.splice(insertAt, 0, {
        ...payload.letter,
        origin: LetterOriginKind.Rack,
      })

      return {
        ...state,
        selectedLetter: null,
        gold: state.gold - cost,
        store: state.store.filter((letter) => letter.id !== payload.letter.id),
        rack: newRack,
      }
    }

    case ActionKind.Sell: {
      return {
        ...state,
        selectedLetter: null,
        gold: state.gold + payload.refund,
        rack: state.rack.filter((letter) => letter.id !== payload.letter.id),
        store: state.store,
      }
    }

    case ActionKind.ToggleFreeze: {
      return {
        ...state,
        store: state.store.map((letter) =>
          letter.id === payload.letter.id
            ? { ...letter, frozen: !letter.frozen }
            : letter
        ),
        selectedLetter: null,
      }
    }

    case ActionKind.SpendGold: {
      return {
        ...state,
        gold: state.gold - payload.amount,
      }
    }

    case ActionKind.SelectLetter: {
      return {
        ...state,
        selectedLetter: payload.letter,
      }
    }

    case ActionKind.SetDraggingLetter: {
      return {
        ...state,
        draggingLetter: payload,
      }
    }

    case ActionKind.DragLetterToRack: {
      const { overId, letterId } = payload

      const rackLetters = state.rack
      const storeLetters = state.store
      const letter = [...storeLetters, ...rackLetters].find(
        ({ id }) => id === letterId
      )

      if (letter === undefined) return state

      const rackIds = rackLetters.map(({ id }) => id)
      let newIndex: number

      if (overId === DroppableKind.Rack) {
        newIndex = rackIds.length
      } else {
        newIndex = rackIds.indexOf(overId)
      }

      return {
        ...state,
        selectedLetter: null,
        store: state.store.filter(({ id }) => letterId !== id),
        rack: [
          ...rackLetters.slice(0, newIndex),
          letter,
          ...rackLetters.slice(newIndex, rackLetters.length),
        ],
      }
    }

    case ActionKind.DragToSortRack: {
      const { overId, letterId } = payload

      const rackLetters = state.rack
      const rackIds = rackLetters.map(({ id }) => id)

      const oldIndex = rackIds.indexOf(letterId)
      const newIndex = rackIds.indexOf(overId)

      return {
        ...state,
        rack: arrayMove(rackLetters, oldIndex, newIndex),
      }
    }

    case ActionKind.RemoveLetterFromRack: {
      const { letterId } = payload

      const rackLetters = state.rack
      const storeLetters = state.store
      const letter = rackLetters.find(({ id }) => id === letterId)

      if (letter === undefined) return state

      const storeIds = rackLetters.map(({ id }) => id)

      const newIndex = storeIds.length + 1

      return {
        ...state,
        rack: state.rack.filter(({ id }) => letterId !== id),
        store: [
          ...storeLetters.slice(0, newIndex),
          letter,
          ...storeLetters.slice(newIndex, storeLetters.length),
        ],
      }
    }

    case ActionKind.SetLetterOrigins: {
      return {
        ...state,
        rack: state.rack.map((letter) => ({
          ...letter,
          origin: LetterOriginKind.Rack,
        })),
        store: state.store.map((letter) => ({
          ...letter,
          origin: LetterOriginKind.Store,
        })),
      }
    }

    case ActionKind.RollStore: {
      if (state.gold < payload.cost) return state

      return {
        ...state,
        gold: state.gold - payload.cost,
        store: payload.newRandomLetters.map((letter, index) => {
          return state.store[index]?.frozen ? state.store[index] : letter
        }),
      }
    }

    case ActionKind.RecallPlayer: {
      const { store, rack, gold } = payload.player

      return {
        ...state,
        store: payload.newRandomLetters.map((letter, index) => {
          return store[index]?.frozen ? state.store[index] : letter
        }),
        rack,
        gold,
      }
    }

    default:
      throw new Error()
  }
}
