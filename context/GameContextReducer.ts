import { alea } from 'seedrandom'
import { create, rawReturn, current } from 'mutative'
import {
  GameState,
  PhaseKind,
  LetterOriginKind,
  UUID,
  DroppableKind,
  Letter,
  GameModeKind,
  PlayerClassificationKind,
  Player,
} from '../lib/types'
import { createLetter } from '../lib/Letter'
import { arrayMove } from '../lib/helpers'
import {
  gameConfig,
  getHealthCost,
  getBattleWinner,
  getRefreshedPool,
  getGameWinner,
} from '../lib/gameConfig'

export enum GameActionKind {
  Set,
  ReturnFromComputerPlayer,

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
  payload?: { computerPlayer: Player; computerPlayerIndex: number }
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
  poolRefreshCost,
} = gameConfig

export const gameContextReducer = (
  state: GameState,
  action: GameContextAction,
  playerIndexOverride?: number
) => {
  return create(state, (draft) => {
    const { type, payload } = action

    const playerIndex =
      playerIndexOverride !== undefined
        ? playerIndexOverride
        : draft.activePlayerIndex

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
        draft.gameInProgress = true
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
        if (payload !== undefined) {
          const { computerPlayer, computerPlayerIndex } = payload

          draft.players[computerPlayerIndex].rack = computerPlayer.rack
          draft.players[computerPlayerIndex].pool = computerPlayer.pool
          draft.players[computerPlayerIndex].gold = computerPlayer.gold
          draft.players[computerPlayerIndex].playedTurn =
            computerPlayer.playedTurn
        } else {
          draft.players[playerIndex].playedTurn = true
        }

        let players = current(draft).players

        // A. Some players haven't taken their turn...
        if (draft.players.some((player) => !player.playedTurn)) {
          const nextPlayer = players.filter((player) => !player.playedTurn)[0]
          const nextPlayerIndex = players.indexOf(nextPlayer)

          // If the active player hasn't finished their turn, do nothing
          // "activePlayer" is primarily for UI
          // Usually this means the computer finished their turn while the human is still thinking
          if (nextPlayerIndex === draft.activePlayerIndex) {
            return
          }

          draft.activePlayerIndex = nextPlayerIndex
          draft.players[nextPlayerIndex].pool = getRefreshedPool(
            nextPlayer.pool,
            draft.round,
            nextPlayer.seed
          )
          draft.players[nextPlayerIndex].gold = initialGold

          return
        }

        players = current(draft).players
        const gameWinner = getGameWinner(players)
        const battleWinner = getBattleWinner(players)

        // B1. Game is over...
        if (gameWinner && battleWinner) {
          draft.gameOver = true

          // Tell the game the index of which player won the game
          draft.gameWinnerIndex = players.indexOf(gameWinner)

          return

          // setDraftForGameOver
        }

        // B2. Battle is over, but no game winner yet...
        if (battleWinner && !gameWinner) {
          // Give the battle winner a victory
          draft.players[players.indexOf(battleWinner)].battleVictories =
            battleWinner.battleVictories + 1

          // Deduct health for every player that lost the battle
          draft.players
            .filter(({ id }) => id !== battleWinner?.id)
            .forEach((loser) => {
              loser.health =
                loser.health -
                getHealthCost(draft.round, gameConfig.healthCostMap)
            })

          // Set the game phase
          draft.phase = PhaseKind.Battle

          // Tell the game the index of which player won the battle
          draft.battleWinnerIndex = players.indexOf(battleWinner)

          return

          // setDraftForBattleOver
        }

        // B3. We've got a draw...
        if (!battleWinner && !gameWinner) {
          // Set the game phase
          draft.phase = PhaseKind.Battle

          draft.battleWinnerIndex = undefined

          return

          // setDraftForDraw
        }
      }

      case GameActionKind.IncrementRound: {
        const firstPlayer = draft.players[0]
        const newRound = draft.round + 1

        const newPool = getRefreshedPool(
          firstPlayer.pool,
          newRound,
          firstPlayer.seed
        )

        draft.players.forEach((player) => (player.playedTurn = false))

        firstPlayer.pool = newPool
        firstPlayer.gold = initialGold
        draft.round = newRound
        draft.activePlayerIndex = 0
        draft.phase = PhaseKind.Build
        return
      }

      case GameActionKind.BuyLetter: {
        const { index, letter } = payload

        if (draft.players[playerIndex].rack.length >= rackCapacity) return
        if (draft.players[playerIndex].gold < letterBuyCost) return

        const insertionIndex = index ?? draft.players[playerIndex].rack.length

        const { id, name, tier, value } = letter
        draft.players[playerIndex].rack.splice(
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

        draft.players[playerIndex].pool = draft.players[
          playerIndex
        ].pool.filter((letter) => letter.id !== payload.letter.id)

        draft.selectedLetter = null
        draft.players[playerIndex].gold =
          draft.players[playerIndex].gold - letterBuyCost
        return
      }

      case GameActionKind.SellLetter: {
        draft.players[playerIndex].rack = draft.players[
          playerIndex
        ].rack.filter((letter) => letter.id !== payload.letter.id)

        draft.selectedLetter = null
        draft.players[playerIndex].gold =
          draft.players[playerIndex].gold + letterSellValue
        return
      }

      case GameActionKind.ToggleFreeze: {
        const index = draft.players[playerIndex].pool.findIndex(
          (letter) => letter.id === payload.letter.id
        )

        if (index !== -1) {
          draft.players[playerIndex].pool[index].frozen =
            !draft.players[playerIndex].pool[index].frozen
        }

        draft.selectedLetter = null
        return
      }
      case GameActionKind.FreezeLetter: {
        const index = draft.players[playerIndex].pool.findIndex(
          (letter) => letter.id === payload.letter.id
        )

        if (index !== -1) {
          draft.players[playerIndex].pool[index].frozen = true
        }

        draft.selectedLetter = null
        return
      }
      case GameActionKind.ThawLetter: {
        const index = draft.players[playerIndex].pool.findIndex(
          (letter) => letter.id === payload.letter.id
        )

        if (index !== -1) {
          draft.players[playerIndex].pool[index].frozen = false
        }

        draft.selectedLetter = null
        return
      }

      case GameActionKind.SpendGold: {
        draft.players[playerIndex].gold =
          draft.players[playerIndex].gold - payload.amount
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

        const letter = [
          ...draft.players[playerIndex].rack,
          ...draft.players[playerIndex].pool,
        ].find(({ id }) => id === letterId)

        if (letter === undefined) return

        const rackIds = draft.players[playerIndex].rack.map(({ id }) => id)
        const newIndex =
          overId === DroppableKind.Rack
            ? rackIds.length
            : rackIds.indexOf(overId)

        draft.selectedLetter = null
        draft.players[playerIndex].pool = draft.players[
          playerIndex
        ].pool.filter(({ id }) => letterId !== id)
        draft.players[playerIndex].rack.splice(newIndex, 0, letter)
        return
      }

      case GameActionKind.MoveLetterInRack: {
        const { overId, letterId } = payload

        const rackIds = draft.players[playerIndex].rack.map(({ id }) => id)

        const oldIndex = rackIds.indexOf(letterId)
        const newIndex = rackIds.indexOf(overId)

        draft.players[playerIndex].rack = arrayMove(
          draft.players[playerIndex].rack,
          oldIndex,
          newIndex
        )
        return
      }

      case GameActionKind.RemoveLetterFromRack: {
        const { letterId } = payload

        const letter = draft.players[playerIndex].rack.find(
          ({ id }) => id === letterId
        )
        if (letter === undefined) return draft

        const newIndex = draft.players[playerIndex].pool.length + 1

        draft.players[playerIndex].pool.splice(newIndex, 0, letter)
        draft.players[playerIndex].rack = draft.players[
          playerIndex
        ].rack.filter(({ id }) => letterId !== id)

        return
      }

      case GameActionKind.SetLetterOrigins: {
        for (const letter of draft.players[playerIndex].rack) {
          letter.origin = LetterOriginKind.Rack
        }
        for (const letter of draft.players[playerIndex].pool) {
          letter.origin = LetterOriginKind.Pool
        }

        return
      }

      case GameActionKind.RefreshPool: {
        if (draft.players[playerIndex].gold < poolRefreshCost) return draft

        const newPool = getRefreshedPool(
          draft.players[playerIndex].pool,
          draft.round,
          draft.players[playerIndex].seed
        )

        draft.players[playerIndex].gold =
          draft.players[playerIndex].gold - poolRefreshCost
        draft.players[playerIndex].pool = newPool
        return
      }

      default:
        throw new Error()
    }
  })
}
