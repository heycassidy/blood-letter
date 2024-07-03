import { randomItem } from '../lib/helpers'
import { nanoid } from 'nanoid'
import { produce } from 'immer'
import Letter from './Letter'
import { cpuMove, GameState } from './types'
import {
  gameContextReducer,
  GameActionKind,
} from '../context/GameContextReducer'
import { gameConfig } from './gameConfig'

export class MCTSGame {
  state: GameState
  lastMove: cpuMove | null = null

  constructor(initialState: GameState) {
    this.state = initialState
  }

  playMove(move: cpuMove) {
    move.execute()
  }

  get randomMove(): cpuMove {
    return randomItem(this.availableMoves)
  }

  selectMove() {
    this.lastMove = this.randomMove
    return this.lastMove
  }

  get isTurnOver(): boolean {
    return this.lastMove?.name === 'end-turn' || this.availableMoves.length < 1
  }

  get clonedState(): GameState {
    return produce(this.state, (draft) => {
      return draft
    })
  }

  get availableMoves(): cpuMove[] {
    const moves: cpuMove[] = []
    const { rack, pool, gold } = this.state
    const { letterBuyCost, rackCapacity, poolRefreshCost } = gameConfig

    // Buy Moves
    if (gold >= letterBuyCost && rack.length < rackCapacity) {
      Array.from(pool.values()).forEach((letter) => {
        const name = `buy-letter-${letter.name}`

        moves.push({
          name,
          id: nanoid(10),
          execute: () => this.buyLetter(letter, this.state),
        })
      })
    }

    // Sell Moves
    rack.forEach((letter) => {
      const name = `sell-letter-${letter.name}-at-${rack.indexOf(letter)}`

      moves.push({
        name,
        id: nanoid(10),
        execute: () => this.sellLetter(letter, this.state),
      })
    })

    // Freeze Moves
    pool
      .filter((letter) => !letter.frozen)
      .forEach((letter) => {
        const name = `freeze-letter-${letter.name}`
        moves.push({
          name,
          id: nanoid(10),
          execute: () => this.freezeLetter(letter, this.state),
        })
      })

    // Thaw Moves
    pool
      .filter((letter) => letter.frozen)
      .forEach((letter) => {
        const name = `thaw-letter-${letter.name}`
        moves.push({
          name,
          id: nanoid(10),
          execute: () => this.thawLetter(letter, this.state),
        })
      })

    // Re-arrange Moves
    rack.forEach((fromLetter) => {
      rack
        .filter((letter) => letter.id !== fromLetter.id)
        .forEach((toLetter) => {
          const name = `move-letter-${fromLetter.name}-at-${rack.indexOf(
            fromLetter
          )}-to-${toLetter.name}-at-${rack.indexOf(toLetter)}`
          moves.push({
            name,
            id: nanoid(10),
            execute: () =>
              this.moveLetterInRack(fromLetter, toLetter, this.state),
          })
        })
    })

    // Refresh Pool
    if (gold >= poolRefreshCost) {
      const name = 'refresh-pool'
      moves.push({
        name,
        id: nanoid(10),
        execute: () => this.refreshPool(this.state),
      })
    }

    // End Turn
    moves.push({
      name: 'end-turn',
      id: nanoid(10),
      execute: () => this.endTurn(this.state),
    })

    return moves
  }

  buyLetter(letter: Letter, state: GameState) {
    return gameContextReducer(state, {
      type: GameActionKind.BuyLetter,
      payload: { letter },
    })
  }

  sellLetter(letter: Letter, state: GameState) {
    return gameContextReducer(state, {
      type: GameActionKind.SellLetter,
      payload: { letter },
    })
  }

  freezeLetter(letter: Letter, state: GameState) {
    return gameContextReducer(state, {
      type: GameActionKind.ToggleFreeze,
      payload: { letter },
    })
  }

  thawLetter(letter: Letter, state: GameState) {
    return gameContextReducer(state, {
      type: GameActionKind.ToggleFreeze,
      payload: { letter },
    })
  }

  moveLetterInRack(letter: Letter, overLetter: Letter, state: GameState) {
    return gameContextReducer(state, {
      type: GameActionKind.MoveLetterInRack,
      payload: { letterId: letter.id, overId: overLetter.id },
    })
  }

  refreshPool(state: GameState) {
    return gameContextReducer(state, {
      type: GameActionKind.RefreshPool,
    })
  }

  endTurn(state: GameState) {
    return gameContextReducer(state, {
      type: GameActionKind.EndTurn,
    })
  }
}
