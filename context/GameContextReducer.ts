import {
  GameState,
  PhaseKind,
  LetterOriginKind,
  UUID,
  DroppableKind,
} from '../lib/types'
import Letter from '../lib/Letter'
import Player from '../lib/Player'
import { cyclicalNext } from '../lib/helpers'
import { arrayMove } from '@dnd-kit/sortable'
import { gameConfig, getHealthCost, getBattleWinner } from '../lib/gameConfig'

export enum GameActionKind {
  Set,

  RestartGame,

  EndTurn,
  IncrementRound,

  BuyLetter,
  SellLetter,
  ToggleFreeze,
  SpendGold,
  SelectLetter,
  DeselectLetter,

  SetDraggingLetter,
  DragLetterToRack,
  MoveLetterInRack,
  SetLetterOrigins,
  RemoveLetterFromRack,
  RefreshPool,
}
interface RestartGameAction {
  type: GameActionKind.RestartGame
  payload: { state: GameState }
}
interface EndTurnAction {
  type: GameActionKind.EndTurn
  payload?: undefined
}
interface IncrementRoundAction {
  type: GameActionKind.IncrementRound
  payload?: undefined
}
interface SetAction {
  type: GameActionKind.Set
  payload: { state: GameState }
}
interface BuyLetterAction {
  type: GameActionKind.BuyLetter
  payload: { letter: Letter; index?: number }
}
interface SellLetterAction {
  type: GameActionKind.SellLetter
  payload: { letter: Letter }
}
interface ToggleFreezeAction {
  type: GameActionKind.ToggleFreeze
  payload: { letter: Letter }
}
interface SpendGold {
  type: GameActionKind.SpendGold
  payload: { amount: number }
}
interface SelectLetterAction {
  type: GameActionKind.SelectLetter
  payload: { letter: Letter }
}
interface DeselectLetterAction {
  type: GameActionKind.DeselectLetter
  payload?: undefined
}
interface SetDraggingLetterAction {
  type: GameActionKind.SetDraggingLetter
  payload: Letter | null
}
interface DragLetterToRack {
  type: GameActionKind.DragLetterToRack
  payload: { overId: UUID; letterId: UUID }
}
interface RemoveLetterFromRack {
  type: GameActionKind.RemoveLetterFromRack
  payload: { letterId: UUID }
}
interface MoveLetterInRackAction {
  type: GameActionKind.MoveLetterInRack
  payload: { overId: UUID; letterId: UUID }
}
interface SetLetterOrigins {
  type: GameActionKind.SetLetterOrigins
  payload?: undefined
}
interface RefreshPoolAction {
  type: GameActionKind.RefreshPool
  payload?: undefined
}
export type GameContextAction =
  | RestartGameAction
  | EndTurnAction
  | IncrementRoundAction
  | SetAction
  | BuyLetterAction
  | SellLetterAction
  | ToggleFreezeAction
  | SpendGold
  | SelectLetterAction
  | DeselectLetterAction
  | SetDraggingLetterAction
  | DragLetterToRack
  | RemoveLetterFromRack
  | RefreshPoolAction
  | MoveLetterInRackAction
  | SetLetterOrigins

export const gameContextReducer = (
  state: GameState,
  action: GameContextAction
): GameState => {
  const { type, payload } = action

  const {
    initialGold,
    rackCapacity,
    letterBuyCost,
    letterSellValue,
    battleVictoriesToWin,
    healthToLose,
    poolRefreshCost,
  } = gameConfig

  // Clone players Map and explicitly assign active player so we can safely mutate players
  const players = new Map<UUID, Player>(
    [...state.players.entries()].map(([id, player]) => [id, player.clone()])
  )
  const playerIds = [...players.keys()]

  // Get active player from cloned Map instead of state
  const activePlayer = players.get(state.activePlayer.id)
  if (activePlayer === undefined) return state
  const nextPlayer = players.get(cyclicalNext(playerIds, activePlayer.id))
  if (nextPlayer === undefined) return state

  switch (type) {
    case GameActionKind.Set: {
      return {
        ...payload.state,
      }
    }

    case GameActionKind.RestartGame: {
      return {
        ...payload.state,
        gameCount: state.gameCount + 1,
      }
    }

    case GameActionKind.EndTurn: {
      const winner = getBattleWinner([...players.values()])
      const losers = [...players.values()].filter((p) => p !== winner)

      const battleOver = activePlayer.id === [...players.values()].at(-1)?.id

      // Other plays still have yet to take their turns
      if (!battleOver) {
        nextPlayer.refreshPool(state.round)

        return {
          ...state,
          rack: nextPlayer.rack,
          pool: nextPlayer.pool,
          gold: initialGold,
          activePlayer: nextPlayer,
          players,
        }
      }

      // Battle Over, all players have taken their turns
      if (winner) {
        winner.battleVictories = winner.battleVictories + 1

        losers.forEach((loser) => {
          loser.health =
            loser.health - getHealthCost(state.round, gameConfig.healthCostMap)
        })
      }

      // Game winner is battle winner when any player's lose or win condition is met
      const gameOver =
        winner &&
        [...players.values()].some((player) => {
          return (
            player.health <= healthToLose ||
            player.battleVictories >= battleVictoriesToWin
          )
        })

      if (gameOver) {
        return {
          ...state,
          gameOver: true,
          gameWinner: winner,
          players,
        }
      }

      // At this point all players have taken their turns, but the game is not over, so we show battle results
      return {
        ...state,
        phase: PhaseKind.Battle,
        battleWinner: winner,
        players,
      }
    }

    case GameActionKind.IncrementRound: {
      const firstPlayer = [...players.values()][0]

      const newRound = state.round + 1

      firstPlayer.refreshPool(newRound)

      return {
        ...state,
        gold: initialGold,
        rack: firstPlayer.rack,
        pool: firstPlayer.pool,
        round: newRound,
        phase: PhaseKind.Build,
        players,
        activePlayer: firstPlayer,
      }
    }

    case GameActionKind.BuyLetter: {
      const { index, letter } = payload

      if (state.rack.length >= rackCapacity) return state
      if (state.gold < letterBuyCost) return state

      const insertAt = index ?? state.rack.length

      const newRack = [...state.rack]
      const newPool = state.pool.filter(
        (letter) => letter.id !== payload.letter.id
      )

      newRack.splice(
        insertAt,
        0,
        new Letter({
          ...letter,
          origin: LetterOriginKind.Rack,
        })
      )

      activePlayer.rack = newRack
      activePlayer.pool = newPool

      return {
        ...state,
        selectedLetter: null,
        gold: state.gold - letterBuyCost,
        pool: newPool,
        rack: newRack,
        activePlayer,
        players,
      }
    }

    case GameActionKind.SellLetter: {
      const newRack = state.rack.filter(
        (letter) => letter.id !== payload.letter.id
      )

      activePlayer.rack = newRack

      return {
        ...state,
        selectedLetter: null,
        gold: state.gold + letterSellValue,
        rack: newRack,
        activePlayer,
        players,
      }
    }

    case GameActionKind.ToggleFreeze: {
      const newPool = state.pool.map((letter) =>
        letter.id === payload.letter.id
          ? new Letter({ ...letter, frozen: !letter.frozen })
          : letter
      )

      activePlayer.pool = newPool

      return {
        ...state,
        pool: newPool,
        selectedLetter: null,
        activePlayer,
        players,
      }
    }

    case GameActionKind.SpendGold: {
      return {
        ...state,
        gold: state.gold - payload.amount,
      }
    }

    case GameActionKind.SelectLetter: {
      return {
        ...state,
        selectedLetter: payload.letter,
      }
    }

    case GameActionKind.DeselectLetter: {
      return {
        ...state,
        selectedLetter: null,
      }
    }

    case GameActionKind.SetDraggingLetter: {
      return {
        ...state,
        draggingLetter: payload,
      }
    }

    case GameActionKind.DragLetterToRack: {
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

      const newPool = state.pool.filter(({ id }) => letterId !== id)
      const newRack = [
        ...rackLetters.slice(0, newIndex),
        letter,
        ...rackLetters.slice(newIndex, rackLetters.length),
      ]

      activePlayer.pool = newPool
      activePlayer.rack = newRack

      return {
        ...state,
        selectedLetter: null,
        pool: newPool,
        rack: newRack,
        activePlayer,
        players,
      }
    }

    case GameActionKind.MoveLetterInRack: {
      const { overId, letterId } = payload

      const rackLetters = state.rack
      const rackIds = rackLetters.map(({ id }) => id)

      const oldIndex = rackIds.indexOf(letterId)
      const newIndex = rackIds.indexOf(overId)

      const newRack = arrayMove(rackLetters, oldIndex, newIndex)

      activePlayer.rack = newRack

      return {
        ...state,
        rack: newRack,
        activePlayer,
        players,
      }
    }

    case GameActionKind.RemoveLetterFromRack: {
      const { letterId } = payload

      const rackLetters = state.rack
      const poolLetters = state.pool
      const letter = rackLetters.find(({ id }) => id === letterId)

      if (letter === undefined) return state

      const poolIds = rackLetters.map(({ id }) => id)

      const newIndex = poolIds.length + 1

      const newPool = [
        ...poolLetters.slice(0, newIndex),
        letter,
        ...poolLetters.slice(newIndex, poolLetters.length),
      ]
      const newRack = state.rack.filter(({ id }) => letterId !== id)

      activePlayer.pool = newPool
      activePlayer.rack = newRack

      return {
        ...state,
        rack: newRack,
        pool: newPool,
      }
    }

    case GameActionKind.SetLetterOrigins: {
      const newRack = state.rack.map(
        (letter) =>
          new Letter({
            ...letter,
            origin: LetterOriginKind.Rack,
          })
      )

      const newPool = state.pool.map(
        (letter) =>
          new Letter({
            ...letter,
            origin: LetterOriginKind.Pool,
          })
      )

      activePlayer.rack = newRack
      activePlayer.pool = newPool

      return {
        ...state,
        rack: newRack,
        pool: newPool,
      }
    }

    case GameActionKind.RefreshPool: {
      if (state.gold < poolRefreshCost) return state

      activePlayer.refreshPool(state.round)

      return {
        ...state,
        gold: state.gold - poolRefreshCost,
        pool: activePlayer.pool,
      }
    }

    default:
      throw new Error()
  }
}
