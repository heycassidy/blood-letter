import {
  PropsWithChildren,
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react'
import { GameState, Player, PhaseKind } from '../lib/types'
import { GameConfig } from './GameConfig'
import { nanoid } from 'nanoid'
import { getNextMod, randomLetters } from '../lib/helpers'

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
    initialPhase,
    storeTierFromRound,
    storeCapacityFromRound,
    healthLossFromRound,
  } = useContext(GameConfig)

  const availableLetters = alphabet.filter((letter) =>
    [...Array(storeTierFromRound(initialRound))]
      .map((_, i) => i + 1)
      .includes(letter.tier)
  )

  const storeAmount = storeCapacityFromRound(initialRound)

  const initialPlayersData: Player[] = [
    {
      id: nanoid(7),
      name: 'Player One',
      health: initialHealth,
      gold: initialGold,
      stage: [],
      stageScore: 0,
      store: randomLetters(storeAmount, availableLetters),
      completedTurn: false,
      battlesWon: 0,
    },
    {
      id: nanoid(7),
      name: 'Player Two',
      health: initialHealth,
      gold: initialGold,
      stage: [],
      stageScore: 0,
      store: randomLetters(storeAmount, availableLetters),
      completedTurn: false,
      battlesWon: 0,
    },
  ]

  const initialState: GameState = {
    players: new Map([
      [initialPlayersData[0].id, initialPlayersData[0]],
      [initialPlayersData[1].id, initialPlayersData[1]],
    ]),
    activePlayer: initialPlayersData[0],
    round: initialRound,
    phase: initialPhase,
    gameOver: false,
    gameWinner: undefined,
    battleWinner: undefined,

    updatePlayer,
    setActivePlayer,
    togglePlayer,
    togglePhase,
    incrementRound,
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  function updatePlayer(id: string, player: Partial<Player>): void {
    dispatch({
      type: ActionKind.UpdatePlayer,
      payload: {
        id,
        player,
      },
    })
  }

  function setActivePlayer(id: string): void {
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
      payload: { gold: initialGold },
    })
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
    if (state.phase === PhaseKind.Battle) {
      const players = Array.from(state.players.values())

      const isDraw = players.every(
        (p) => p.stageScore === players[0].stageScore
      )

      const winner = players.reduce((p, c) =>
        p.stageScore > c.stageScore ? p : c
      )
      const losers = players.filter((p) => p !== winner)

      dispatch({
        type: ActionKind.SetBattleResult,
        payload: {
          winner: isDraw ? false : winner,
          losers: isDraw ? [] : losers,
          healthLoss: healthLossFromRound(state.round),
        },
      })
    }
  }, [state.phase])

  useEffect(() => {
    // console.log(state)
  }, [state.phase])

  return <GameContext.Provider value={state}>{children}</GameContext.Provider>
}

enum ActionKind {
  UpdatePlayer,
  SetActivePlayer,
  ToggleActivePlayer,
  TogglePhase,
  SetPhase,
  SetBattleResult,
  IncrementRound,
}
interface UpdatePlayerAction {
  type: ActionKind.UpdatePlayer
  payload: { id: string; player: Partial<Player> }
}
interface SetActivePlayerAction {
  type: ActionKind.SetActivePlayer
  payload: { id: string }
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
  payload: { winner: Player | false; losers: Player[]; healthLoss: number }
}
interface IncrementRoundAction {
  type: ActionKind.IncrementRound
  payload: { gold: number }
}
type GameContextAction =
  | UpdatePlayerAction
  | SetActivePlayerAction
  | ToggleActivePlayerAction
  | TogglePhaseAction
  | SetPhaseAction
  | SetBattleResultAction
  | IncrementRoundAction

const reducer = (state: GameState, action: GameContextAction): GameState => {
  const { type, payload } = action

  switch (type) {
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

      const nextId = getNextMod(Array.from(players.keys()), activePlayer.id)

      if (typeof nextId !== 'string') return state

      const player = state.players.get(nextId)

      if (player === undefined) return state

      return {
        ...state,
        activePlayer: player,
      }
    }

    case ActionKind.TogglePhase: {
      const nextPhase = getNextMod(
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
      const { winner, losers, healthLoss } = payload
      const players = new Map(state.players) // must clone Map

      if (winner) {
        players.set(winner.id, { ...winner, battlesWon: winner.battlesWon + 1 })
      }

      losers.forEach((loser) => {
        players.set(loser.id, {
          ...loser,
          health: loser.health - healthLoss,
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

    default:
      throw new Error()
  }
}
