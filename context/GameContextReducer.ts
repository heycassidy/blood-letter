import { alea } from 'seedrandom'
import { create, rawReturn } from 'mutative'
import {
  GameState,
  PhaseKind,
  LetterOriginKind,
  UUID,
  DroppableKind,
  Letter,
  GameModeKind,
  PlayerClassificationKind,
} from '../lib/types'
import { createLetter } from '../lib/Letter'
import { cyclicalNext, arrayMove } from '../lib/helpers'
import {
  gameConfig,
  getHealthCost,
  getBattleWinner,
  getRefreshedPool,
} from '../lib/gameConfig'

export enum GameActionKind {
  Set,

  RestartGame,
  StartGame,

  EndTurn,
  IncrementRound,

  BuyLetter,
  SellLetter,
  ToggleFreeze,
  FreezeLetter,
  ThawLetter,
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
interface StartGameAction {
  type: GameActionKind.StartGame
  payload: { gameMode: GameModeKind }
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
interface FreezeLetterAction {
  type: GameActionKind.FreezeLetter
  payload: { letter: Letter }
}
interface ThawLetterAction {
  type: GameActionKind.ThawLetter
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
  | StartGameAction
  | EndTurnAction
  | IncrementRoundAction
  | SetAction
  | BuyLetterAction
  | SellLetterAction
  | ToggleFreezeAction
  | FreezeLetterAction
  | ThawLetterAction
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

export const gameContextReducer = (
  state: GameState,
  action: GameContextAction
) => {
  return create(state, (draft) => {
    const { type, payload } = action
    const activePlayer = draft.players[draft.activePlayerIndex]

    if (!activePlayer) return

    if (type !== GameActionKind.Set) {
      draft.players.forEach((player) => {
        player.seed = player.seed + alea(`${player.seed}`)()
      })
    }

    switch (type) {
      case GameActionKind.Set: {
        return rawReturn(payload.state)
      }

      case GameActionKind.RestartGame: {
        draft.gameCount += 1
        return
      }

      case GameActionKind.StartGame: {
        draft.gameStarted = true
        draft.gameMode = payload.gameMode

        if (payload.gameMode === GameModeKind.AgainstComputer) {
          draft.players[0].name = 'Player 1'
          draft.players[0].classification = PlayerClassificationKind.Human

          draft.players[1].name = 'Player 2 (Computer)'
          draft.players[1].classification = PlayerClassificationKind.Computer
        }

        if (payload.gameMode === GameModeKind.PassToPlay) {
          draft.players[0].name = 'Player 1'
          draft.players[0].classification = PlayerClassificationKind.Human

          draft.players[1].name = 'Player 2'
          draft.players[1].classification = PlayerClassificationKind.Human
        }

        return
      }

      case GameActionKind.EndTurn: {
        const winner = getBattleWinner(draft.players)
        const losers = draft.players.filter(({ id }) => id !== winner?.id)
        const nextPlayer = cyclicalNext(draft.players, activePlayer)

        const battleOver = draft.activePlayerIndex === draft.players.length - 1

        const newPool = getRefreshedPool(
          nextPlayer.pool,
          draft.round,
          nextPlayer.seed
        )

        // Other plays still have yet to take their turns
        if (!battleOver && nextPlayer) {
          nextPlayer.pool = newPool
          draft.rack = nextPlayer.rack
          draft.pool = nextPlayer.pool
          draft.gold = initialGold
          draft.activePlayerIndex = draft.players.indexOf(nextPlayer)
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
          draft.players.some((player) => {
            return (
              player.health <= healthToLose ||
              player.battleVictories >= battleVictoriesToWin
            )
          })

        if (gameOver) {
          draft.gameOver = true
          draft.gameWinnerIndex = draft.players.indexOf(winner)
          return
        }

        // At this point all players have taken their turns, but the game is not over, so we show battle results
        draft.phase = PhaseKind.Battle
        draft.battleWinnerIndex = winner
          ? draft.players.indexOf(winner)
          : undefined
        return
      }

      case GameActionKind.IncrementRound: {
        const firstPlayer = draft.players[0]
        const newRound = draft.round + 1

        const newPool = getRefreshedPool(
          firstPlayer.pool,
          newRound,
          firstPlayer.seed
        )

        firstPlayer.pool = newPool

        draft.gold = initialGold
        draft.rack = firstPlayer.rack
        draft.pool = firstPlayer.pool
        draft.round = newRound
        draft.activePlayerIndex = 0
        draft.phase = PhaseKind.Build
        return
      }

      case GameActionKind.BuyLetter: {
        const { index, letter } = payload

        if (draft.rack.length >= rackCapacity) return
        if (draft.gold < letterBuyCost) return

        const insertionIndex = index ?? draft.rack.length

        const { id, name, tier, value } = letter
        draft.rack.splice(
          insertionIndex,
          0,
          createLetter({
            id,
            name,
            tier,
            value,
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
          draft.pool[index].frozen = !draft.pool[index].frozen
        }

        draft.selectedLetter = null
        activePlayer.pool = draft.pool
        return
      }
      case GameActionKind.FreezeLetter: {
        const index = draft.pool.findIndex(
          (letter) => letter.id === payload.letter.id
        )

        if (index !== -1) {
          draft.pool[index].frozen = true
        }

        draft.selectedLetter = null
        activePlayer.pool = draft.pool
        return
      }
      case GameActionKind.ThawLetter: {
        const index = draft.pool.findIndex(
          (letter) => letter.id === payload.letter.id
        )

        if (index !== -1) {
          draft.pool[index].frozen = false
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

        const newPool = getRefreshedPool(
          activePlayer.pool,
          draft.round,
          activePlayer.seed
        )

        activePlayer.pool = newPool
        draft.gold = draft.gold - poolRefreshCost
        draft.pool = activePlayer.pool
        return
      }

      default:
        throw new Error()
    }
  })
}
