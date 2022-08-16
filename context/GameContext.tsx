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
  } = useContext(GameConfig)

  const availableLetters = alphabet.filter((letter) =>
    [...Array(storeTierFromRound(initialRound))]
      .map((_, i) => i + 1)
      .includes(letter.tier)
  )

  const storeAmount = storeCapacityFromRound(initialRound)

  const initialPlayersData = [
    {
      id: nanoid(7),
      name: 'Player One',
      health: initialHealth,
      gold: initialGold,
      stage: [],
      stageScore: 0,
      store: randomLetters(storeAmount, availableLetters),
    },
    {
      id: nanoid(7),
      name: 'Player Two',
      health: initialHealth,
      gold: initialGold,
      stage: [],
      stageScore: 0,
      store: randomLetters(storeAmount, availableLetters),
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
    winner: undefined,

    updatePlayer,
    setActivePlayer,
    togglePlayer,
    togglePhase,
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

  useEffect(() => {
    // console.log(state)
  }, [state])

  return <GameContext.Provider value={state}>{children}</GameContext.Provider>
}

enum ActionKind {
  UpdatePlayer,
  SetActivePlayer,
  ToggleActivePlayer,
  TogglePhase,
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
  payload?: unknown
}
interface TogglePhaseAction {
  type: ActionKind.TogglePhase
  payload?: unknown
}
type GameContextAction =
  | UpdatePlayerAction
  | SetActivePlayerAction
  | ToggleActivePlayerAction
  | TogglePhaseAction

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

    default:
      throw new Error()
  }
}
