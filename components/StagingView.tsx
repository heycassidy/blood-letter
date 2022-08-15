import { useContext, useEffect, useReducer } from 'react'
import type { Letter, Player } from '../lib/types'
import { GameConfig } from '../context/GameConfig'
import css from 'styled-jsx/css'
import LetterStore from './LetterStore'
import Stage from './Stage'
import { randomLetters } from '../lib/helpers'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useGameContext } from '../context/GameContext'

const StagingView = () => {
  const {
    alphabet,
    stageCapacity,
    letterBuyCost,
    letterSellValue,
    storeRefreshCost,
    storeTierFromRound,
    storeCapacityFromRound,
  } = useContext(GameConfig)
  const { round, activePlayer, updatePlayer } = useGameContext()
  const { name: playerName, gold, health } = activePlayer

  const highestTier = storeTierFromRound(round)
  const storeAmount = storeCapacityFromRound(round)

  const availableLetters = alphabet.filter((letter) =>
    [...Array(highestTier)].map((_, i) => i + 1).includes(letter.tier)
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 20,
      },
    })
  )

  const [state, dispatch] = useReducer(reducer, activePlayer)

  const handleDragEnd = (event: DragEndEvent) => {
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

  // update player in game context when local state changes
  useEffect(() => {
    updatePlayer(activePlayer.id, { stage: state.stage, store: state.store })
  }, [state.stage, state.store])

  // update local state active player when game context active player changes
  useEffect(() => {
    dispatch({
      type: ActionKind.RecallPlayer,
      payload: { player: activePlayer },
    })
  }, [activePlayer.id])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="staging-view">
        <div className="info-list">
          <span className="info-box">{playerName}</span>
          <span className="info-box">Turn: {round}</span>
          <span className="info-box">Gold: {gold}</span>
          <span className="info-box">Health: {health}</span>
        </div>

        <Stage
          letters={state.stage}
          capacity={stageCapacity}
          sellLetter={(letter: Letter) => {
            updatePlayer(activePlayer.id, { gold: gold + letterSellValue })
            dispatch({
              type: ActionKind.Sell,
              payload: { letter },
            })
          }}
        />

        <div className="info-list">
          <span className="info-box">Tier: {highestTier}</span>
        </div>

        <LetterStore
          letters={state.store}
          amount={storeAmount}
          buyLetter={(letter: Letter) => {
            if (state.stage.length < stageCapacity && gold >= letterBuyCost) {
              updatePlayer(activePlayer.id, { gold: gold - letterBuyCost })
              dispatch({
                type: ActionKind.Buy,
                payload: { letter },
              })
            }
          }}
        />

        <div className="info-list">
          <button
            onClick={() => {
              if (gold >= storeRefreshCost) {
                updatePlayer(activePlayer.id, {
                  gold: gold - storeRefreshCost,
                })
                dispatch({
                  type: ActionKind.RefreshStore,
                  payload: {
                    letters: randomLetters(storeAmount, availableLetters),
                  },
                })
              }
            }}
          >
            Roll Store
          </button>
        </div>

        <style jsx>{styles}</style>
      </div>
    </DndContext>
  )
}

type State = {
  stage: Letter[]
  store: Letter[]
}
enum ActionKind {
  Buy,
  Sell,
  RefreshStore,
  ClearStage,
  SortStage,
  RecallPlayer,
  Reset,
}
interface BuyAction {
  type: ActionKind.Buy
  payload: { letter: Letter }
}
interface SellAction {
  type: ActionKind.Sell
  payload: { letter: Letter }
}
interface RefreshStoreAction {
  type: ActionKind.RefreshStore
  payload: { letters: Letter[] }
}
interface SortStageAction {
  type: ActionKind.SortStage
  payload: { letters: Letter[] }
}
interface ClearStageAction {
  type: ActionKind.ClearStage
  payload?: unknown
}
interface RecallPlayerAction {
  type: ActionKind.RecallPlayer
  payload: { player: Player }
}
interface ResetAction {
  type: ActionKind.Reset
  payload: { letters: Letter[] }
}

type StagingViewAction =
  | BuyAction
  | SellAction
  | RefreshStoreAction
  | ClearStageAction
  | SortStageAction
  | RecallPlayerAction
  | ResetAction

const reducer = (state: State, action: StagingViewAction): State => {
  const { type, payload } = action

  switch (type) {
    case ActionKind.Buy: {
      return {
        store: state.store.filter((letter) => letter.id !== payload.letter.id),
        stage: [...state.stage, payload.letter],
      }
    }

    case ActionKind.Sell: {
      return {
        stage: state.stage.filter((letter) => letter.id !== payload.letter.id),
        store: state.store,
      }
    }

    case ActionKind.RefreshStore: {
      return {
        ...state,
        store: payload.letters,
      }
    }

    case ActionKind.SortStage: {
      return {
        ...state,
        stage: payload.letters,
      }
    }

    case ActionKind.ClearStage: {
      return {
        ...state,
        stage: [],
      }
    }

    case ActionKind.RecallPlayer: {
      return {
        store: payload.player.store,
        stage: payload.player.stage,
      }
    }

    case ActionKind.Reset: {
      return {
        store: payload.letters,
        stage: [],
      }
    }

    default:
      throw new Error()
  }
}

const styles = css`
  .staging-view {
    gap: 1rem;
    display: grid;
    justify-content: start;
    justify-items: start;
  }
  .info-list {
    display: flex;
    gap: 0.25rem;
  }
  .info-box {
    line-height: 1;
    padding: 0.125rem 0.5rem;
    background: #e3e3e3;
  }
`

export default StagingView
