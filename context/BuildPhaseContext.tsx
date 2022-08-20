import { nanoid } from 'nanoid'
import {
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react'
import type { BuildPhaseState, Letter, Player } from '../lib/types'
import { wordList } from '../lib/words'
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
import { sumItemProperty, concatItemProperty } from '../lib/helpers'

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
    wordBonusComputation,
  } = useContext(GameConfig)

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

      buyLetter,
      sellLetter,
      rollStore,
    }
  }

  const [state, dispatch] = useReducer(reducer, activePlayer, initState)

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
          store:
            !activePlayer.completedTurn && gameCount > 0
              ? getStoreLetters(alphabet, storeTier, storeAmount, nanoid)
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
        letters: getStoreLetters(alphabet, storeTier, storeAmount, nanoid),
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
  Reset,
  Buy,
  Sell,
  RollStore,
  SortStage,
  RecallPlayer,
}
interface ResetAction {
  type: ActionKind.Reset
  payload: { state: BuildPhaseState }
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
  | ResetAction
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
    case ActionKind.Reset: {
      return payload.state
    }

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
