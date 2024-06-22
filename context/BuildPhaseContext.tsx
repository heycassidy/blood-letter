import {
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react'
import {
  BuildPhaseState,
  Player,
  ItemOriginKind,
  DroppableKind,
  UUID,
} from '../lib/types'
import Letter from '../lib/Letter'
import Blot from '../lib/Blot'
import { wordList } from '../lib/words'
import { GameConfigContext } from './GameConfigContext'
import { useGameContext } from '../context/GameContext'
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
    allBlots,
    rackCapacity,
    letterBuyCost,
    letterSellValue,
    poolRefreshCost,
    wordBonusComputation,
  } = useContext(GameConfigContext)

  const {
    gameCount,
    activePlayer,
    updatePlayer,
    getPoolLetters,
    getWellBlots,
    poolTier,
    poolCapacity,
    wellTier,
    wellCapacity,
  } = useGameContext()

  const initState = (player: Player): BuildPhaseState => {
    return {
      rack: player.rack,
      pool: player.pool,
      well: player.well,
      gold: player.gold,
      selectedLetter: null,

      buyLetter,
      sellLetter,
      freezeLetter,
      selectLetter,
      refreshPool,

      addLetterToRack,
      removeLetterFromRack,
      moveLetterInRack,
      addBlotToLetter,
      removeBlotFromLetter,
      spendGold,
      setLetterOrigins,
      shallowMergeState,
    }
  }

  const [state, dispatch] = useReducer(reducer, activePlayer, initState)

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
  }, [state.pool, state.well, state.rack, state.gold])

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
        newRandomLetters: getPoolLetters(alphabet, poolTier, poolCapacity),
        newRandomBlots: getWellBlots(allBlots, wellTier, wellCapacity),
        player: activePlayer,
      },
    })
  }, [activePlayer.id])

  useEffect(() => {
    // console.log(state.rack)
  }, [state.rack])

  return (
    <BuildPhaseContext.Provider value={state}>
      {children}
    </BuildPhaseContext.Provider>
  )

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
  function refreshPool(): void {
    dispatch({
      type: ActionKind.RefreshPool,
      payload: {
        newRandomLetters: getPoolLetters(alphabet, poolTier, poolCapacity),
        cost: poolRefreshCost,
      },
    })
  }
  function addLetterToRack(letterId: UUID, overId: UUID): void {
    dispatch({
      type: ActionKind.AddLetterToRack,
      payload: { letterId, overId },
    })
  }
  function removeLetterFromRack(letterId: UUID): void {
    dispatch({
      type: ActionKind.RemoveLetterFromRack,
      payload: { letterId },
    })
  }
  function moveLetterInRack(letterId: UUID, overId: UUID): void {
    dispatch({
      type: ActionKind.MoveLetterInRack,
      payload: { letterId, overId },
    })
  }
  function addBlotToLetter(blotId: UUID, letterId: UUID): void {
    dispatch({
      type: ActionKind.AddBlotToLetter,
      payload: { blotId, letterId },
    })
  }
  function removeBlotFromLetter(blotId: UUID): void {
    dispatch({
      type: ActionKind.RemoveBlotFromLetter,
      payload: { blotId },
    })
  }
  function spendGold(amount: number): void {
    dispatch({
      type: ActionKind.SpendGold,
      payload: { amount },
    })
  }
  function setLetterOrigins(): void {
    dispatch({
      type: ActionKind.SetLetterOrigins,
    })
  }
  function shallowMergeState(partialState: Partial<BuildPhaseState>): void {
    dispatch({
      type: ActionKind.ShallowMergeState,
      payload: { partialState },
    })
  }
}

enum ActionKind {
  Reset,
  ShallowMergeState,
  Buy,
  Sell,
  ToggleFreeze,
  SpendGold,
  SelectLetter,
  AddLetterToRack,
  MoveLetterInRack,
  AddBlotToLetter,
  RemoveBlotFromLetter,
  SetLetterOrigins,
  RemoveLetterFromRack,
  RefreshPool,
  RecallPlayer,
}
interface ResetAction {
  type: ActionKind.Reset
  payload: { state: BuildPhaseState }
}
interface ShallowMergeStateAction {
  type: ActionKind.ShallowMergeState
  payload: { partialState: Partial<BuildPhaseState> }
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
interface SpendGoldAction {
  type: ActionKind.SpendGold
  payload: { amount: number }
}
interface SelectLetterAction {
  type: ActionKind.SelectLetter
  payload: { letter: Letter | null }
}
interface AddLetterToRackAction {
  type: ActionKind.AddLetterToRack
  payload: { overId: UUID; letterId: UUID }
}
interface RemoveLetterFromRackAction {
  type: ActionKind.RemoveLetterFromRack
  payload: { letterId: UUID }
}
interface MoveLetterInRackAction {
  type: ActionKind.MoveLetterInRack
  payload: { overId: UUID; letterId: UUID }
}
interface AddBlotToLetterAction {
  type: ActionKind.AddBlotToLetter
  payload: { blotId: UUID; letterId: UUID }
}
interface RemoveBlotFromLetterAction {
  type: ActionKind.RemoveBlotFromLetter
  payload: { blotId: UUID }
}
interface SetLetterOriginsAction {
  type: ActionKind.SetLetterOrigins
  payload?: undefined
}
interface RefreshPoolAction {
  type: ActionKind.RefreshPool
  payload: { newRandomLetters: Letter[]; cost: number }
}
interface RecallPlayerAction {
  type: ActionKind.RecallPlayer
  payload: {
    player: Player
    newRandomLetters: Letter[]
    newRandomBlots: Blot[]
  }
}

type BuildPhaseContextAction =
  | ResetAction
  | ShallowMergeStateAction
  | BuyAction
  | SellAction
  | ToggleFreezeAction
  | SpendGoldAction
  | SelectLetterAction
  | AddLetterToRackAction
  | RemoveLetterFromRackAction
  | RefreshPoolAction
  | MoveLetterInRackAction
  | AddBlotToLetterAction
  | RemoveBlotFromLetterAction
  | SetLetterOriginsAction
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

    case ActionKind.ShallowMergeState: {
      return {
        ...state,
        ...payload.partialState,
      }
    }

    case ActionKind.Buy: {
      const { cost, maxLetters, index, letter } = payload

      if (state.rack.length >= maxLetters) return state
      if (state.gold < cost) return state

      const insertAt = index ?? state.rack.length

      const newRack = [...state.rack]

      const newLetter = letter
      letter.origin = ItemOriginKind.Rack

      newRack.splice(insertAt, 0, newLetter)

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
      const newPool = [...state.pool]

      newPool.forEach((letter) => {
        if (letter.id === payload.letter.id) {
          letter.frozen = true
        }
      })

      console.log(newPool)

      return {
        ...state,
        pool: newPool,
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

    case ActionKind.AddLetterToRack: {
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
      const newRack = [...state.rack]
      const newPool = [...state.pool]

      newRack.forEach((letter) => {
        letter.origin = ItemOriginKind.Rack
      })
      newPool.forEach((letter) => {
        letter.origin = ItemOriginKind.Pool
      })

      return {
        ...state,
        rack: newRack,
        pool: newPool,
      }
    }

    case ActionKind.AddBlotToLetter: {
      const blots = [...state.well]
      const blot = blots.find(({ id }) => id === payload.blotId)

      if (blot === undefined) return state

      const newRack = [...state.rack]

      newRack.forEach((letter) => {
        if (letter.id === payload.letterId) {
          letter.blot = blot
        }
      })

      return {
        ...state,
        rack: newRack,
      }
    }

    case ActionKind.RemoveBlotFromLetter: {
      const blots = [...state.well]
      const blot = blots.find(({ id }) => id === payload.blotId)

      if (blot === undefined) return state

      const newRack = [...state.rack]

      newRack.forEach((letter) => {
        if (letter?.blot?.id === payload.blotId) {
          letter.blot = undefined
        }
      })

      return { ...state, rack: newRack }
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
      const { pool, well, rack, gold } = payload.player

      return {
        ...state,
        pool: payload.newRandomLetters.map((letter, index) => {
          return pool[index]?.frozen ? state.pool[index] : letter
        }),
        well: payload.newRandomBlots.map((blot, index) => {
          return well[index]?.frozen ? state.well[index] : blot
        }),
        rack,
        gold,
      }
    }

    default:
      throw new Error()
  }
}
