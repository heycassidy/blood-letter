import { useContext, useEffect, useReducer } from 'react'
import type { Letter } from '../lib/types'
import { GameConfig } from '../lib/GameConfig'
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

type Props = {
  highestTier: number
  storeAmount: number
  stageCapacity: number
}

const StagingView = ({ highestTier, storeAmount, stageCapacity }: Props) => {
  const { alphabet } = useContext(GameConfig)
  const availableLetters = alphabet.filter((letter) =>
    [...Array(highestTier)].map((_, i) => i + 1).includes(letter.tier)
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  )

  const initialState: State = {
    storeLetters: randomLetters(storeAmount, availableLetters),
    stageLetters: [],
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over !== null && active.id !== over.id) {
      const oldIndex = state.stageLetters.findIndex(
        (letter) => letter.id === active.id
      )
      const newIndex = state.stageLetters.findIndex(
        (letter) => letter.id === over.id
      )

      dispatch({
        type: ActionKind.SortStage,
        payload: { letters: arrayMove(state.stageLetters, oldIndex, newIndex) },
      })
    }
  }

  useEffect(() => {
    // console.log(state)
  }, [state])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="staging-view">
        <div className="info-list">
          <span className="info-box">Max Stage Letters: {stageCapacity}</span>
        </div>

        <Stage
          letters={state.stageLetters}
          capacity={stageCapacity}
          sellLetter={(letter: Letter) => {
            dispatch({
              type: ActionKind.Sell,
              payload: { letter },
            })
          }}
        />

        <div className="info-list">
          <span className="info-box">Tier: {highestTier}</span>
          <span className="info-box">Amount: {storeAmount}</span>
        </div>

        <LetterStore
          letters={state.storeLetters}
          amount={storeAmount}
          buyLetter={(letter: Letter) => {
            if (state.stageLetters.length < stageCapacity) {
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
              dispatch({
                type: ActionKind.RefreshStore,
                payload: {
                  letters: randomLetters(storeAmount, availableLetters),
                },
              })
            }}
          >
            Refresh Store
          </button>

          <button
            onClick={() => {
              dispatch({ type: ActionKind.ClearStage })
            }}
          >
            Clear Stage
          </button>
        </div>

        <style jsx>{styles}</style>
      </div>
    </DndContext>
  )
}

type State = {
  stageLetters: Letter[]
  storeLetters: Letter[]
}
enum ActionKind {
  Buy = 'BUY',
  Sell = 'SELL',
  RefreshStore = 'REFRESH_STORE',
  ClearStage = 'CLEAR_STAGE',
  SortStage = 'SORT_STAGE',
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

type StagingViewAction =
  | BuyAction
  | SellAction
  | RefreshStoreAction
  | ClearStageAction
  | SortStageAction

const reducer = (state: State, action: StagingViewAction): State => {
  const { type, payload } = action

  switch (type) {
    case ActionKind.Buy:
      return {
        storeLetters: state.storeLetters.filter(
          (letter) => letter.id !== payload.letter.id
        ),
        stageLetters: [...state.stageLetters, payload.letter],
      }

    case ActionKind.Sell:
      return {
        stageLetters: state.stageLetters.filter(
          (letter) => letter.id !== payload.letter.id
        ),
        storeLetters: state.storeLetters,
      }

    case ActionKind.RefreshStore:
      return {
        ...state,
        storeLetters: payload.letters,
      }

    case ActionKind.SortStage:
      return {
        ...state,
        stageLetters: payload.letters,
      }

    case ActionKind.ClearStage:
      return {
        ...state,
        stageLetters: [],
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
