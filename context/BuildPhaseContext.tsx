import {
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react'
import type { BuildPhaseState, Letter, Player } from '../lib/types'
import { GameConfig } from './GameConfig'
import { useGameContext } from '../context/GameContext'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { randomLetters, computeLetterValueFromTier } from '../lib/helpers'

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
  const {
    alphabet,
    stageCapacity,
    letterBuyCost,
    letterSellValue,
    storeRefreshCost,
    storeTierFromRound,
    storeCapacityFromRound,
  } = useContext(GameConfig)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 20,
      },
    })
  )

  const { round, activePlayer, updatePlayer } = useGameContext()

  const highestTier = storeTierFromRound(round)
  const storeAmount = storeCapacityFromRound(round)

  const availableLetters = alphabet.filter((letter) =>
    [...Array(highestTier)].map((_, i) => i + 1).includes(letter.tier)
  )

  const initialState: BuildPhaseState = {
    stage: activePlayer.stage,
    store: activePlayer.store,
    gold: activePlayer.gold,

    buyLetter,
    sellLetter,
    rollStore,
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    updatePlayer(activePlayer.id, {
      store: state.store,
      stage: state.stage,
      gold: state.gold,
      stageScore: state.stage
        .map((letter) => computeLetterValueFromTier(letter.tier))
        .reduce((sum, value) => sum + value, 0),
    })
  }, [state.store, state.stage, state.gold])

  useEffect(() => {
    dispatch({
      type: ActionKind.RecallPlayer,
      payload: {
        player: {
          ...activePlayer,
          store: !activePlayer.completedTurn
            ? randomLetters(storeAmount, availableLetters)
            : activePlayer.store,
        },
      },
    })
  }, [activePlayer.id])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over !== null && active.id !== over.id) {
      const oldIndex = state.stage.findIndex(
        (letter) => letter.id === active.id
      )
      const newIndex = state.stage.findIndex((letter) => letter.id === over.id)

      dispatch({
        type: ActionKind.SortStage,
        payload: { letters: arrayMove(state.stage, oldIndex, newIndex) },
      })
    }
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

  function rollStore(): void {
    dispatch({
      type: ActionKind.RollStore,
      payload: {
        letters: randomLetters(storeAmount, availableLetters),
        cost: storeRefreshCost,
      },
    })
  }

  return (
    <BuildPhaseContext.Provider value={state}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {children}
      </DndContext>
    </BuildPhaseContext.Provider>
  )
}

enum ActionKind {
  Buy,
  Sell,
  RollStore,
  SortStage,
  RecallPlayer,
}
interface BuyAction {
  type: ActionKind.Buy
  payload: { letter: Letter; cost: number; maxLetters: number }
}
interface SellAction {
  type: ActionKind.Sell
  payload: { letter: Letter; refund: number }
}
interface RollStoreAction {
  type: ActionKind.RollStore
  payload: { letters: Letter[]; cost: number }
}
interface SortStageAction {
  type: ActionKind.SortStage
  payload: { letters: Letter[] }
}
interface RecallPlayerAction {
  type: ActionKind.RecallPlayer
  payload: { player: Player }
}

type BuildPhaseContextAction =
  | BuyAction
  | SellAction
  | RollStoreAction
  | SortStageAction
  | RecallPlayerAction

const reducer = (
  state: BuildPhaseState,
  action: BuildPhaseContextAction
): BuildPhaseState => {
  const { type, payload } = action

  switch (type) {
    case ActionKind.Buy: {
      const { cost, maxLetters } = payload

      if (state.stage.length >= maxLetters) return state
      if (state.gold < cost) return state

      return {
        ...state,
        gold: state.gold - cost,
        store: state.store.filter((letter) => letter.id !== payload.letter.id),
        stage: [...state.stage, payload.letter],
      }
    }

    case ActionKind.Sell: {
      return {
        ...state,
        gold: state.gold + payload.refund,
        stage: state.stage.filter((letter) => letter.id !== payload.letter.id),
        store: state.store,
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

    case ActionKind.SortStage: {
      return {
        ...state,
        stage: payload.letters,
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
