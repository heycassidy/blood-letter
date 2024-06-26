import {
  GameState,
  Player,
  PhaseKind,
  LetterOriginKind,
  UUID,
  DroppableKind,
} from '../lib/types'
import Letter from '../lib/Letter'
import { cyclicalNext } from '../lib/helpers'
import { arrayMove } from '@dnd-kit/sortable'
import {
  gameConfig,
  getPoolTier,
  getPoolCapacity,
  getHealthCost,
  getRandomPoolLetters,
  saveBoardStateToPlayer,
  restoreBoardStateFromPlayer,
} from '../lib/gameConfig'

export enum GameActionKind {
  Reset,

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
interface ResetAction {
  type: GameActionKind.Reset
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
  | ResetAction
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
    alphabet,
    initialGold,
    rackCapacity,
    letterBuyCost,
    letterSellValue,
    battleVictoriesToWin,
    healthToLose,
    poolRefreshCost,
  } = gameConfig

  switch (type) {
    case GameActionKind.Reset: {
      return payload.state
    }

    case GameActionKind.RestartGame: {
      return {
        ...payload.state,
        gameCount: state.gameCount + 1,
      }
    }

    case GameActionKind.EndTurn: {
      const players = new Map<UUID, Player>(state.players) // must clone Map
      const { activePlayer } = state

      const getFreshPlayer = (player: Player): Player =>
        players.get(player.id) ?? player

      const playerIds = [...players.keys()]

      const currentPlayer = getFreshPlayer(activePlayer)
      const nextId = cyclicalNext(playerIds, currentPlayer.id)
      const nextPlayer = players.get(nextId)

      const isLastTurnInRound =
        playerIds.indexOf(state.activePlayer.id) === playerIds.length - 1

      if (nextPlayer === undefined) return state

      players.set(
        currentPlayer.id,
        saveBoardStateToPlayer(getFreshPlayer(currentPlayer), state)
      )

      const winner: Player | null = [...players.values()].reduce(
        (acc: Player | null, player: Player): Player | null => {
          if (!acc || player.roundScore > acc.roundScore) {
            return player
          } else if (player.roundScore === acc.roundScore) {
            return null
          }
          return acc
        },
        null
      )

      const losers = [...players.values()].filter((p) => p !== winner)

      let battleState = {}
      if (isLastTurnInRound) {
        if (winner) {
          players.set(winner.id, {
            ...getFreshPlayer(winner),
            battleVictories: getFreshPlayer(winner).battleVictories + 1,
          })

          losers.forEach((loser) => {
            players.set(loser.id, {
              ...getFreshPlayer(loser),
              health:
                getFreshPlayer(loser).health -
                getHealthCost(state.round, gameConfig),
            })
          })
        }

        battleState = {
          phase: PhaseKind.Battle,
          players,
          battleWinner: winner,
        }
      }

      const isGameOver = [...players.values()].some((player) => {
        const freshPlayer = getFreshPlayer(player)
        return (
          freshPlayer.health <= healthToLose ||
          freshPlayer.battleVictories >= battleVictoriesToWin
        )
      })

      let gameOverState = {}
      if (isGameOver) {
        gameOverState = {
          gameOver: true,
          gameWinner: winner,
        }
      }

      return {
        ...state,
        ...battleState,
        ...gameOverState,
        ...restoreBoardStateFromPlayer(state, nextPlayer),
        gold: initialGold,
        activePlayer: nextPlayer,
        players,
      }
    }

    case GameActionKind.IncrementRound: {
      const players = new Map(state.players) // must clone Map
      const firstPlayer = [...players.values()][0]

      players.forEach((player) => {
        players.set(player.id, {
          ...player,
          gold: initialGold,
        })
      })

      return {
        ...state,
        ...restoreBoardStateFromPlayer(state, firstPlayer),
        round: state.round + 1,
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
        gold: state.gold - letterBuyCost,
        pool: state.pool.filter((letter) => letter.id !== payload.letter.id),
        rack: newRack,
      }
    }

    case GameActionKind.SellLetter: {
      return {
        ...state,
        selectedLetter: null,
        gold: state.gold + letterSellValue,
        rack: state.rack.filter((letter) => letter.id !== payload.letter.id),
        pool: state.pool,
      }
    }

    case GameActionKind.ToggleFreeze: {
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

    case GameActionKind.MoveLetterInRack: {
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

    case GameActionKind.RemoveLetterFromRack: {
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

    case GameActionKind.SetLetterOrigins: {
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

    case GameActionKind.RefreshPool: {
      if (state.gold < poolRefreshCost) return state

      const newRandomLetters = getRandomPoolLetters(
        alphabet,
        getPoolTier(state.round, gameConfig),
        getPoolCapacity(state.round, gameConfig)
      )

      return {
        ...state,
        gold: state.gold - poolRefreshCost,
        pool: newRandomLetters.map((letter, index) => {
          return state.pool[index]?.frozen ? state.pool[index] : letter
        }),
      }
    }

    default:
      throw new Error()
  }
}
