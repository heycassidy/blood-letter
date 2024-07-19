import { alea } from 'seedrandom'
import { produce } from 'immer'
import {
  GameState,
  PhaseKind,
  LetterOriginKind,
  UUID,
  DroppableKind,
} from '../lib/types'
import Letter from '../lib/Letter'
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

const {
  initialGold,
  rackCapacity,
  letterBuyCost,
  letterSellValue,
  battleVictoriesToWin,
  healthToLose,
  poolRefreshCost,
} = gameConfig

export const gameContextReducer = produce(
  (draft: GameState, action: GameContextAction) => {
    const { type, payload } = action
    const activePlayer = draft.players.get(draft.activePlayerId)

    if (!activePlayer) return

    if (type !== GameActionKind.Set) {
      draft.players.forEach((player) => {
        player.seed = player.seed + alea(`${player.seed}`)()
      })
    }

    switch (type) {
      case GameActionKind.Set: {
        return payload.state
      }

      case GameActionKind.RestartGame: {
        draft.gameCount += 1
        return
      }

      case GameActionKind.EndTurn: {
        const winner = getBattleWinner([...draft.players.values()])
        const losers = [...draft.players.values()].filter((p) => p !== winner)
        const nextPlayer = cyclicalNext(
          [...draft.players.values()],
          activePlayer
        )

        const battleOver =
          draft.activePlayerId === [...draft.players.keys()].at(-1)

        // Other plays still have yet to take their turns
        if (!battleOver && nextPlayer) {
          nextPlayer.refreshPool(draft.round)
          draft.rack = nextPlayer.rack
          draft.pool = nextPlayer.pool
          draft.gold = initialGold
          draft.activePlayerId = nextPlayer.id
          return
        }

        // Battle Over, all players have taken their turns
        if (winner) {
          winner.battleVictories = winner.battleVictories + 1

          losers.forEach((loser) => {
            loser.health =
              loser.health -
              getHealthCost(draft.round, gameConfig.healthCostMap)
          })
        }

        // Game winner is battle winner when any player's lose or win condition is met
        const gameOver =
          winner &&
          [...draft.players.values()].some((player) => {
            return (
              player.health <= healthToLose ||
              player.battleVictories >= battleVictoriesToWin
            )
          })

        if (gameOver) {
          draft.gameOver = true
          draft.gameWinnerId = winner.id
          return
        }

        // At this point all players have taken their turns, but the game is not over, so we show battle results
        draft.phase = PhaseKind.Battle
        draft.battleWinnerId = winner?.id
        return
      }

      case GameActionKind.IncrementRound: {
        const firstPlayer = [...draft.players.values()][0]
        const newRound = draft.round + 1

        firstPlayer.refreshPool(newRound)

        draft.gold = initialGold
        draft.rack = firstPlayer.rack
        draft.pool = firstPlayer.pool
        draft.round = newRound
        draft.activePlayerId = firstPlayer.id
        draft.phase = PhaseKind.Build
        return
      }

      case GameActionKind.BuyLetter: {
        const { index, letter } = payload

        if (draft.rack.length >= rackCapacity) return
        if (draft.gold < letterBuyCost) return

        draft.rack.splice(
          index ?? draft.rack.length,
          0,
          new Letter({
            ...letter,
            origin: LetterOriginKind.Rack,
          })
        )

        draft.pool = draft.pool.filter(
          (letter) => letter.id !== payload.letter.id
        )

        activePlayer.rack = draft.rack
        activePlayer.pool = draft.pool

        draft.selectedLetter = null
        draft.gold = draft.gold - letterBuyCost
        return
      }

      case GameActionKind.SellLetter: {
        draft.rack = draft.rack.filter(
          (letter) => letter.id !== payload.letter.id
        )
        draft.selectedLetter = null
        draft.gold = draft.gold + letterSellValue
        activePlayer.rack = draft.rack
        return
      }

      case GameActionKind.ToggleFreeze: {
        const index = draft.pool.findIndex(
          (letter) => letter.id === payload.letter.id
        )

        if (index !== -1) {
          draft.pool[index] = new Letter({
            ...draft.pool[index],
            frozen: !draft.pool[index].frozen,
          })
        }

        draft.selectedLetter = null
        activePlayer.pool = draft.pool
        return
      }

      case GameActionKind.SpendGold: {
        draft.gold = draft.gold - payload.amount
        return
      }

      case GameActionKind.SelectLetter: {
        draft.selectedLetter = payload.letter
        return
      }

      case GameActionKind.DeselectLetter: {
        draft.selectedLetter = null
        return
      }

      case GameActionKind.SetDraggingLetter: {
        draft.draggingLetter = payload
        return
      }

      case GameActionKind.DragLetterToRack: {
        const { overId, letterId } = payload

        const letter = [...draft.rack, ...draft.pool].find(
          ({ id }) => id === letterId
        )

        if (letter === undefined) return

        const rackIds = draft.rack.map(({ id }) => id)
        const newIndex =
          overId === DroppableKind.Rack
            ? rackIds.length
            : rackIds.indexOf(overId)

        draft.selectedLetter = null
        draft.pool = draft.pool.filter(({ id }) => letterId !== id)
        draft.rack.splice(newIndex, 0, letter)
        activePlayer.pool = draft.pool
        activePlayer.rack = draft.rack
        return
      }

      case GameActionKind.MoveLetterInRack: {
        const { overId, letterId } = payload

        const rackIds = draft.rack.map(({ id }) => id)

        const oldIndex = rackIds.indexOf(letterId)
        const newIndex = rackIds.indexOf(overId)

        draft.rack = arrayMove(draft.rack, oldIndex, newIndex)
        activePlayer.rack = draft.rack
        return
      }

      case GameActionKind.RemoveLetterFromRack: {
        const { letterId } = payload

        const letter = draft.rack.find(({ id }) => id === letterId)
        if (letter === undefined) return draft

        const newIndex = draft.pool.length + 1

        draft.pool.splice(newIndex, 0, letter)
        draft.rack = draft.rack.filter(({ id }) => letterId !== id)

        activePlayer.pool = draft.pool
        activePlayer.rack = draft.rack
        return
      }

      case GameActionKind.SetLetterOrigins: {
        for (const letter of draft.rack) {
          letter.origin = LetterOriginKind.Rack
        }
        for (const letter of draft.pool) {
          letter.origin = LetterOriginKind.Pool
        }

        activePlayer.rack = draft.rack
        activePlayer.pool = draft.pool
        return
      }

      case GameActionKind.RefreshPool: {
        if (draft.gold < poolRefreshCost) return draft

        activePlayer.refreshPool(draft.round)
        draft.gold = draft.gold - poolRefreshCost
        draft.pool = activePlayer.pool
        return
      }

      default:
        throw new Error()
    }
  }
)
