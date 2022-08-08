import { useContext, useReducer } from 'react'
import type { Letter } from '../lib/types'
import { GameConfig } from '../lib/GameConfig'
import css from 'styled-jsx/css'
import LetterStore from './LetterStore'
import Stage from './Stage'
import { randomLetters } from '../lib/helpers'

type Props = {
  highestTier: number
  storeAmount: number
  stageAmount: number
}

const StagingView = ({ highestTier, storeAmount, stageAmount }: Props) => {
  const { alphabet } = useContext(GameConfig)
  const availableLetters = alphabet.filter((letter) =>
    [...Array(highestTier)].map((_, i) => i + 1).includes(letter.tier)
  )
  const initialState: State = {
    storeLetters: randomLetters(storeAmount, availableLetters),
    stageLetters: [],
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <div className="staging-view">
      <div className="info-list">
        <span className="info-box">Max Stage Letters: {stageAmount}</span>
      </div>

      <Stage
        letters={state.stageLetters}
        clearStage={() => {
          dispatch({ type: ActionKind.ClearStage })
        }}
        sellLetter={(letter: Letter, index: number) => {
          dispatch({
            type: ActionKind.Sell,
            payload: { letters: [letter], index },
          })
        }}
      />

      <div className="info-list">
        <span className="info-box">Tier: {highestTier}</span>
        <span className="info-box">Amount: {storeAmount}</span>
      </div>

      <LetterStore
        letters={state.storeLetters}
        buyLetter={(letter: Letter, index: number) => {
          if (state.stageLetters.length < stageAmount) {
            dispatch({
              type: ActionKind.Buy,
              payload: { letters: [letter], index },
            })
          }
        }}
      />

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
        Refresh
      </button>

      <style jsx>{styles}</style>
    </div>
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
}
interface BuyAction {
  type: ActionKind.Buy
  payload: { letters: Letter[]; index: number }
}
interface SellAction {
  type: ActionKind.Sell
  payload: { letters: Letter[]; index: number }
}
interface RefreshStoreAction {
  type: ActionKind.RefreshStore
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

const reducer = (state: State, action: StagingViewAction): State => {
  const { type, payload } = action

  switch (type) {
    case ActionKind.Buy:
      return {
        storeLetters: state.storeLetters.filter(
          (_, index) => index !== payload.index
        ),
        stageLetters: [...state.stageLetters, ...payload.letters],
      }

    case ActionKind.Sell:
      return {
        stageLetters: state.stageLetters.filter(
          (_, index) => index !== payload.index
        ),
        storeLetters: state.storeLetters,
      }

    case ActionKind.RefreshStore:
      return {
        ...state,
        storeLetters: payload.letters,
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
