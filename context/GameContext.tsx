import {
  PropsWithChildren,
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react'
import {
  GameState,
  Player,
  PhaseKind,
  LetterOriginKind,
  UUID,
  PlayerClassificationKind,
  GameModeKind,
} from '../lib/types'
import Letter from '../lib/Letter'
import { GameConfigContext } from './GameConfigContext'
import { nanoid } from 'nanoid'
import {
  cyclicalNext,
  randomItems,
  getFromNumericMapWithMax,
  itemIsInRange,
} from '../lib/helpers'

const GameContext = createContext<GameState | undefined>(undefined)

export const useGameContext = () => {
  const context = useContext(GameContext)

  if (context === undefined) {
    throw Error('Game Context is undefined')
  }

  return context
}

export const GameContextProvider = ({ children }: PropsWithChildren) => {
  const {
    alphabet,
    initialRound,
    initialGold,
    initialHealth,
    numberOfPlayers,
    initialPhase,
    poolTierMap,
    poolCapacityMap,
    healthCostMap,
    healthToLose,
    battleVictoriesToWin,
    gameMode,
  } = useContext(GameConfigContext)

  const poolAmount = getPoolCapacity(initialRound)
  const poolTier = getPoolTier(initialRound)

  const [state, dispatch] = useReducer(reducer, null, initState)

  function restartGame(): void {
    dispatch({
      type: ActionKind.RestartGame,
      payload: { state: initState() },
    })
  }

  function initState(): GameState {
    const players = new Map(
      Array.from({ length: numberOfPlayers }).map((_, i) => {
        let player
        if (gameMode === GameModeKind.AgainstComputer && i !== 0) {
          player = generatePlayer(
            `Player ${i + 1} (computer)`,
            PlayerClassificationKind.Computer
          )
        } else {
          player = generatePlayer(`Player ${i + 1}`)
        }
        return [player.id, player]
      })
    )

    return {
      players,
      activePlayer: [...players.values()][0],
      round: initialRound,
      phase: initialPhase,
      battleWinner: undefined,
      gameOver: false,
      gameWinner: undefined,
      gameCount: 0,

      updatePlayer,
      setActivePlayer,
      togglePlayer,
      togglePhase,
      incrementRound,
      restartGame,

      getPoolLetters,

      getPoolTier,
      getPoolCapacity,
      getHealthCost,
    }
  }

  function generatePlayer(
    name: string,
    playerClassification: PlayerClassificationKind = PlayerClassificationKind.Human
  ): Player {
    return {
      name,
      id: nanoid() as UUID,
      health: initialHealth,
      gold: initialGold,
      rack: [],
      rackWord: '',
      rackScore: 0,
      wordBonus: 0,
      roundScore: 0,
      pool: getPoolLetters(alphabet, poolTier, poolAmount),
      completedTurn: false,
      battleVictories: 0,
      playerClassification,
    }
  }

  function updatePlayer(id: UUID, player: Partial<Player>): void {
    dispatch({
      type: ActionKind.UpdatePlayer,
      payload: {
        id,
        player,
      },
    })
  }

  function setActivePlayer(id: UUID): void {
    dispatch({
      type: ActionKind.SetActivePlayer,
      payload: { id },
    })
  }

  function togglePlayer(): void {
    dispatch({
      type: ActionKind.ToggleActivePlayer,
    })
  }

  function togglePhase(): void {
    dispatch({
      type: ActionKind.TogglePhase,
    })
  }

  function incrementRound(): void {
    dispatch({
      type: ActionKind.IncrementRound,
      payload: {
        gold: initialGold,
      },
    })
  }

  function getPlayerNames(numberOfPlayers: number) {
    // TODO: Allow Players to choose their name
    return [...Array(numberOfPlayers)].map((_, i) => `Player ${i + 1}`)
  }

  function getPoolLetters(letters: Letter[], tier: number, amount: number) {
    const tierAndBelowLetters = letters.filter((letter) =>
      itemIsInRange(letter.tier, 1, tier)
    )

    return randomItems(tierAndBelowLetters, amount).map((letter) => {
      const { name, tier, value } = letter
      return new Letter({ name, tier, value, origin: LetterOriginKind.Pool })
    })
  }
  function getPoolTier(round: number) {
    return getFromNumericMapWithMax(poolTierMap, round)
  }
  function getPoolCapacity(round: number) {
    return getFromNumericMapWithMax(poolCapacityMap, round)
  }
  function getHealthCost(round: number) {
    return getFromNumericMapWithMax(healthCostMap, round)
  }

  useEffect(() => {
    if (state.phase === PhaseKind.Build) {
      const players = Array.from(state.players.values())

      if (players.every((p) => p.completedTurn)) {
        dispatch({
          type: ActionKind.SetPhase,
          payload: PhaseKind.Battle,
        })
        return
      }

      if (state.activePlayer.completedTurn) {
        dispatch({
          type: ActionKind.ToggleActivePlayer,
        })
      }
    }
  }, [state.activePlayer])

  useEffect(() => {
    const players = [...state.players.values()]
    const isDraw = players.every((p) => p.roundScore === players[0].roundScore)
    const winner = players.reduce((p, c) =>
      p.roundScore > c.roundScore ? p : c
    )
    const losers = players.filter((p) => p !== winner)

    if (state.phase === PhaseKind.Battle) {
      dispatch({
        type: ActionKind.SetBattleResult,
        payload: {
          winner: isDraw ? false : winner,
          losers: isDraw ? [] : losers,
          healthCost: getHealthCost(state.round),
        },
      })
    }

    if (state.phase === PhaseKind.Build) {
      if (
        players.some(
          (player) =>
            player.health <= healthToLose ||
            player.battleVictories >= battleVictoriesToWin
        )
      ) {
        dispatch({
          type: ActionKind.SetGameResult,
          payload: { winner },
        })
      }
    }
  }, [state.phase])

  return <GameContext.Provider value={state}>{children}</GameContext.Provider>
}

enum ActionKind {
  RestartGame,
  UpdatePlayer,
  SetActivePlayer,
  ToggleActivePlayer,
  TogglePhase,
  SetPhase,
  SetBattleResult,
  IncrementRound,
  SetGameResult,
}
interface RestartGameAction {
  type: ActionKind.RestartGame
  payload: { state: GameState }
}
interface UpdatePlayerAction {
  type: ActionKind.UpdatePlayer
  payload: { id: UUID; player: Partial<Player> }
}
interface SetActivePlayerAction {
  type: ActionKind.SetActivePlayer
  payload: { id: UUID }
}
interface ToggleActivePlayerAction {
  type: ActionKind.ToggleActivePlayer
  payload?: null
}
interface TogglePhaseAction {
  type: ActionKind.TogglePhase
  payload?: null
}
interface SetPhaseAction {
  type: ActionKind.SetPhase
  payload: PhaseKind
}
interface SetBattleResultAction {
  type: ActionKind.SetBattleResult
  payload: { winner: Player | false; losers: Player[]; healthCost: number }
}
interface IncrementRoundAction {
  type: ActionKind.IncrementRound
  payload: { gold: number }
}
interface SetGameResultAction {
  type: ActionKind.SetGameResult
  payload: { winner: Player }
}
type GameContextAction =
  | RestartGameAction
  | UpdatePlayerAction
  | SetActivePlayerAction
  | ToggleActivePlayerAction
  | TogglePhaseAction
  | SetPhaseAction
  | SetBattleResultAction
  | IncrementRoundAction
  | SetGameResultAction

const reducer = (state: GameState, action: GameContextAction): GameState => {
  const { type, payload } = action

  switch (type) {
    case ActionKind.RestartGame: {
      return {
        ...payload.state,
        gameCount: state.gameCount + 1,
      }
    }

    case ActionKind.SetActivePlayer: {
      const player = state.players.get(payload.id)

      console.log(state.players, player)

      if (player === undefined) return state

      return {
        ...state,
        activePlayer: player,
      }
    }

    case ActionKind.ToggleActivePlayer: {
      const { players, activePlayer } = state

      const nextId = cyclicalNext(Array.from(players.keys()), activePlayer.id)

      if (typeof nextId !== 'string') return state

      const player = state.players.get(nextId)

      if (player === undefined) return state

      return {
        ...state,
        activePlayer: player,
      }
    }

    case ActionKind.TogglePhase: {
      const nextPhase = cyclicalNext(
        Object.values(PhaseKind),
        state.phase
      ) as PhaseKind

      return {
        ...state,
        phase: nextPhase,
      }
    }

    case ActionKind.SetPhase: {
      return {
        ...state,
        phase: payload,
      }
    }

    case ActionKind.SetBattleResult: {
      const { winner, losers, healthCost } = payload
      const players = new Map(state.players) // must clone Map

      if (winner) {
        players.set(winner.id, {
          ...winner,
          battleVictories: winner.battleVictories + 1,
        })
      }

      losers.forEach((loser) => {
        players.set(loser.id, {
          ...loser,
          health: loser.health - healthCost,
        })
      })

      return {
        ...state,
        players,
        battleWinner: winner,
      }
    }

    case ActionKind.UpdatePlayer: {
      const players = new Map(state.players) // must clone Map
      const player = players.get(payload.id)

      if (player === undefined) return state

      const updatedPlayer = {
        ...player,
        ...payload.player,
      }

      return {
        ...state,
        activePlayer:
          player.id === payload.id ? updatedPlayer : state.activePlayer,
        players: players.set(payload.id, updatedPlayer),
      }
    }

    case ActionKind.IncrementRound: {
      const players = new Map(state.players) // must clone Map

      players.forEach((player) => {
        players.set(player.id, {
          ...player,
          gold: payload.gold,
          completedTurn: false,
        })
      })

      return {
        ...state,
        round: state.round + 1,
        phase: PhaseKind.Build,
        players,
        activePlayer: [...players.values()][0],
      }
    }

    case ActionKind.SetGameResult: {
      return {
        ...state,
        gameOver: true,
        gameWinner: payload.winner,
      }
    }

    default:
      throw new Error()
  }
}
