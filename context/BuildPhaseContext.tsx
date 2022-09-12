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
  closestCorners,
  pointerWithin,
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
    stageCapacity,
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
      stage: player.stage,
      store: player.store,
      gold: player.gold,
      selectedLetter: null,
      draggingLetter: null,

      buyLetter,
      sellLetter,
      selectLetter,
      rollStore,
    }
  }

  const [state, dispatch] = useReducer(reducer, activePlayer, initState)
  const [clonedState, setClonedState] = useState<BuildPhaseState | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 20,
      },
    })
  )

  useEffect(() => {
    const letters = state.stage
    const word = concatItemProperty(letters, 'name')

    const stageScore = sumItemProperty(letters, 'value')

    const wordBonus = wordList.includes(word)
      ? wordBonusComputation(letters)
      : 0
    const roundScore = stageScore + wordBonus

    updatePlayer(activePlayer.id, {
      store: state.store,
      stage: state.stage,
      gold: state.gold,
      stageScore,
      wordBonus,
      roundScore,
    })
  }, [state.store, state.stage, state.gold])

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
        player: {
          ...activePlayer,
          store: !activePlayer.completedTurn
            ? getStoreLetters(alphabet, storeTier, storeAmount, nanoid)
            : activePlayer.store,
        },
      },
    })
  }, [activePlayer.id])

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      const { active, droppableContainers } = args

      const letterId = active?.id
      const letter = active?.data?.current?.letter
      const letterOrigin = letter?.origin

      const stageIds = state.stage.map(({ id }) => id)

      const stageCollisions = pointerWithin({
        ...args,
        droppableContainers: droppableContainers.filter(
          ({ id }) => id === DroppableKind.Stage
        ),
      })

      const letterCollisions = closestCenter({
        ...args,
        droppableContainers: droppableContainers.filter(({ id }) =>
          stageIds.includes(id)
        ),
      })

      if (
        letterOrigin === LetterOriginKind.Stage &&
        stageIds.includes(letterId)
      ) {
        return letterCollisions
      }

      if (
        letterOrigin === LetterOriginKind.Store &&
        stageCollisions.length > 0 &&
        stageIds.filter((id) => letterId !== id).length > 0
      ) {
        return letterCollisions
      }

      return rectIntersection(args)
    },
    [state.stage, state.draggingLetter]
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

    const stageIds = state.stage.map(({ id }) => id)

    if (letterId === undefined) {
      return
    }

    if (
      letterOrigin === LetterOriginKind.Store &&
      state.stage.length >= stageCapacity
    ) {
      return
    }

    if (!overId || overId === DroppableKind.Store) {
      dispatch({
        type: ActionKind.RemoveLetterFromStage,
        payload: { letterId },
      })
      return
    }

    if (
      letterOrigin === LetterOriginKind.Store &&
      overId !== letterId &&
      !stageIds.includes(letterId) &&
      (overId === DroppableKind.Stage || stageIds.includes(overId))
    ) {
      dispatch({
        type: ActionKind.DragLetterToStage,
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
    const stageIds = state.stage.map(({ id }) => id)

    if (
      letterOrigin === LetterOriginKind.Store &&
      (state.stage.length >= stageCapacity || state.gold < letterBuyCost)
    ) {
      return
    }

    if (
      overId &&
      letterOrigin === LetterOriginKind.Store &&
      (overId === DroppableKind.Stage || stageIds.includes(overId))
    ) {
      dispatch({
        type: ActionKind.SpendGold,
        payload: { amount: letterBuyCost },
      })
    }

    if (
      overId &&
      (overId === DroppableKind.Stage || stageIds.includes(overId))
    ) {
      dispatch({
        type: ActionKind.DragToSortStage,
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

    if (
      letterOrigin === LetterOriginKind.Store &&
      (state.stage.length > stageCapacity || state.gold < letterBuyCost)
    ) {
      console.log('cancelled')
      return true
    }

    return false
  }

  function buyLetter(letter: Letter): void {
    dispatch({
      type: ActionKind.Buy,
      payload: { letter, cost: letterBuyCost, maxLetters: stageCapacity },
    })
  }

  function sellLetter(letter: Letter): void {
    dispatch({
      type: ActionKind.Sell,
      payload: { letter, refund: letterSellValue },
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
        letters: getStoreLetters(alphabet, storeTier, storeAmount, nanoid),
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
  SpendGold,
  SelectLetter,
  SetDraggingLetter,
  DragLetterToStage,
  DragToSortStage,
  SetLetterOrigins,
  RemoveLetterFromStage,
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
interface DragLetterToStage {
  type: ActionKind.DragLetterToStage
  payload: { overId: UUID; letterId: UUID }
}
interface RemoveLetterFromStage {
  type: ActionKind.RemoveLetterFromStage
  payload: { letterId: UUID }
}
interface DragToSortStageAction {
  type: ActionKind.DragToSortStage
  payload: { overId: UUID; letterId: UUID }
}
interface SetLetterOrigins {
  type: ActionKind.SetLetterOrigins
  payload?: undefined
}
interface RollStoreAction {
  type: ActionKind.RollStore
  payload: { letters: Letter[]; cost: number }
}
interface RecallPlayerAction {
  type: ActionKind.RecallPlayer
  payload: { player: Player }
}

type BuildPhaseContextAction =
  | ResetAction
  | BuyAction
  | SellAction
  | SpendGold
  | SelectLetterAction
  | SetDraggingLetterAction
  | DragLetterToStage
  | RemoveLetterFromStage
  | RollStoreAction
  | DragToSortStageAction
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

      if (state.stage.length >= maxLetters) return state
      if (state.gold < cost) return state

      const insertAt = index ?? state.stage.length

      const newStage = [...state.stage]

      newStage.splice(insertAt, 0, {
        ...payload.letter,
        origin: LetterOriginKind.Stage,
      })

      return {
        ...state,
        selectedLetter: null,
        gold: state.gold - cost,
        store: state.store.filter((letter) => letter.id !== payload.letter.id),
        stage: newStage,
      }
    }

    case ActionKind.Sell: {
      return {
        ...state,
        selectedLetter: null,
        gold: state.gold + payload.refund,
        stage: state.stage.filter((letter) => letter.id !== payload.letter.id),
        store: state.store,
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

    case ActionKind.DragLetterToStage: {
      const { overId, letterId } = payload

      const stageLetters = state.stage
      const storeLetters = state.store
      const letter = [...storeLetters, ...stageLetters].find(
        ({ id }) => id === letterId
      )

      if (letter === undefined) return state

      const stageIds = stageLetters.map(({ id }) => id)
      let newIndex: number

      if (overId === DroppableKind.Stage) {
        newIndex = stageIds.length
      } else {
        newIndex = stageIds.indexOf(overId)
      }

      return {
        ...state,
        store: state.store.filter(({ id }) => letterId !== id),
        stage: [
          ...stageLetters.slice(0, newIndex),
          letter,
          ...stageLetters.slice(newIndex, stageLetters.length),
        ],
      }
    }

    case ActionKind.DragToSortStage: {
      const { overId, letterId } = payload

      const stageLetters = state.stage
      const stageIds = stageLetters.map(({ id }) => id)

      const oldIndex = stageIds.indexOf(letterId)
      const newIndex = stageIds.indexOf(overId)

      return {
        ...state,
        stage: arrayMove(stageLetters, oldIndex, newIndex),
      }
    }

    case ActionKind.RemoveLetterFromStage: {
      const { letterId } = payload

      const stageLetters = state.stage
      const storeLetters = state.store
      const letter = stageLetters.find(({ id }) => id === letterId)

      if (letter === undefined) return state

      const storeIds = stageLetters.map(({ id }) => id)

      const newIndex = storeIds.length + 1

      return {
        ...state,
        stage: state.stage.filter(({ id }) => letterId !== id),
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
        stage: state.stage.map((letter) => ({
          ...letter,
          origin: LetterOriginKind.Stage,
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
        store: payload.letters,
      }
    }

    case ActionKind.RecallPlayer: {
      const { store, stage, gold } = payload.player

      return {
        ...state,
        store,
        stage,
        gold,
      }
    }

    default:
      throw new Error()
  }
}
