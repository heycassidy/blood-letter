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
  Player,
  LetterOriginKind,
  DroppableKind,
  UUID,
} from '../lib/types'
import Letter from '../lib/Letter'
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
    poolRefreshCost,
    wordBonusComputation,
  } = useContext(GameConfigContext)

  const {
    round,
    activePlayer,
    updatePlayer,
    getPoolTier,
    getPoolCapacity,
    getPoolLetters,
  } = useGameContext()

  const poolAmount = getPoolCapacity(round)
  const poolTier = getPoolTier(round)

  const initState = (player: Player): BuildPhaseState => {
    return {
      rack: player.rack,
      pool: player.pool,
      gold: player.gold,
      selectedLetter: null,
      draggingLetter: null,

      buyLetter,
      sellLetter,
      toggleLetterFreeze,
      moveLetterToLetter,
      selectLetter,
      refreshPool,
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
    const word = concatItemProperty(
      letters.map((letter) => ({ ...letter })),
      'name'
    )

    const rackScore = sumItemProperty(
      letters.map((letter) => ({ ...letter })),
      'value'
    )

    const wordBonus = wordList.includes(word)
      ? wordBonusComputation(letters)
      : 0
    const roundScore = rackScore + wordBonus

    updatePlayer(activePlayer.id, {
      pool: state.pool,
      rack: state.rack,
      gold: state.gold,
      rackScore,
      wordBonus,
      roundScore,
    })
  }, [state.pool, state.rack, state.gold])

  useEffect(() => {
    dispatch({
      type: ActionKind.RecallPlayer,
      payload: {
        newRandomLetters: getPoolLetters(alphabet, poolTier, poolAmount),
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
      letterOrigin === LetterOriginKind.Pool &&
      rackIds.length >= rackCapacity
    ) {
      return
    }

    if (!overId || overId === DroppableKind.Pool) {
      dispatch({
        type: ActionKind.RemoveLetterFromRack,
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
        type: ActionKind.SpendGold,
        payload: { amount: letterBuyCost },
      })
    }

    if (
      overId &&
      (overId === DroppableKind.Rack || rackIds.includes(overId)) &&
      letter &&
      overLetter
    ) {
      moveLetterToLetter(letter, overLetter)
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
      letterOrigin === LetterOriginKind.Pool &&
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

  function moveLetterToLetter(letter: Letter, overLetter: Letter): void {
    dispatch({
      type: ActionKind.MoveLetterInRack,
      payload: { letterId: letter.id, overId: overLetter.id },
    })
  }

  function toggleLetterFreeze(letter: Letter): void {
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

  function refreshPool(): void {
    dispatch({
      type: ActionKind.RefreshPool,
      payload: {
        newRandomLetters: getPoolLetters(alphabet, poolTier, poolAmount),
        cost: poolRefreshCost,
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
  MoveLetterInRack,
  SetLetterOrigins,
  RemoveLetterFromRack,
  RefreshPool,
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
interface MoveLetterInRackAction {
  type: ActionKind.MoveLetterInRack
  payload: { overId: UUID; letterId: UUID }
}
interface SetLetterOrigins {
  type: ActionKind.SetLetterOrigins
  payload?: undefined
}
interface RefreshPoolAction {
  type: ActionKind.RefreshPool
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
  | RefreshPoolAction
  | MoveLetterInRackAction
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
      const { cost, maxLetters, index, letter } = payload

      if (state.rack.length >= maxLetters) return state
      if (state.gold < cost) return state

      const insertAt = index ?? state.rack.length

      const newRack = [...state.rack]

      newRack.splice(
        insertAt,
        0,
        new Letter({
          ...letter,
          origin: LetterOriginKind.Rack,
        })
      )

      return {
        ...state,
        selectedLetter: null,
        gold: state.gold - cost,
        pool: state.pool.filter((letter) => letter.id !== payload.letter.id),
        rack: newRack,
      }
    }

    case ActionKind.Sell: {
      return {
        ...state,
        selectedLetter: null,
        gold: state.gold + payload.refund,
        rack: state.rack.filter((letter) => letter.id !== payload.letter.id),
        pool: state.pool,
      }
    }

    case ActionKind.ToggleFreeze: {
      return {
        ...state,
        pool: state.pool.map((letter) =>
          letter.id === payload.letter.id
            ? new Letter({ ...letter, frozen: !letter.frozen })
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
      const poolLetters = state.pool
      const letter = [...poolLetters, ...rackLetters].find(
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
        pool: state.pool.filter(({ id }) => letterId !== id),
        rack: [
          ...rackLetters.slice(0, newIndex),
          letter,
          ...rackLetters.slice(newIndex, rackLetters.length),
        ],
      }
    }

    case ActionKind.MoveLetterInRack: {
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
      const poolLetters = state.pool
      const letter = rackLetters.find(({ id }) => id === letterId)

      if (letter === undefined) return state

      const poolIds = rackLetters.map(({ id }) => id)

      const newIndex = poolIds.length + 1

      return {
        ...state,
        rack: state.rack.filter(({ id }) => letterId !== id),
        pool: [
          ...poolLetters.slice(0, newIndex),
          letter,
          ...poolLetters.slice(newIndex, poolLetters.length),
        ],
      }
    }

    case ActionKind.SetLetterOrigins: {
      return {
        ...state,
        rack: state.rack.map(
          (letter) =>
            new Letter({
              ...letter,
              origin: LetterOriginKind.Rack,
            })
        ),
        pool: state.pool.map(
          (letter) =>
            new Letter({
              ...letter,
              origin: LetterOriginKind.Pool,
            })
        ),
      }
    }

    case ActionKind.RefreshPool: {
      if (state.gold < payload.cost) return state

      return {
        ...state,
        gold: state.gold - payload.cost,
        pool: payload.newRandomLetters.map((letter, index) => {
          return state.pool[index]?.frozen ? state.pool[index] : letter
        }),
      }
    }

    case ActionKind.RecallPlayer: {
      const { pool, rack, gold } = payload.player

      return {
        ...state,
        pool: payload.newRandomLetters.map((letter, index) => {
          return pool[index]?.frozen ? state.pool[index] : letter
        }),
        rack,
        gold,
      }
    }

    default:
      throw new Error()
  }
}
