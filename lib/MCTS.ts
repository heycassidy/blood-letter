import { randomItem, weightedRandomItem } from '../lib/helpers'
import { produce } from 'immer'
import Letter from './Letter'
import { MCTSMove, GameState, PhaseKind, UUID } from './types'
import {
  gameContextReducer,
  GameActionKind,
} from '../context/GameContextReducer'
import { gameConfig } from './gameConfig'

export class MCTSGame {
  state: GameState

  constructor(initialState: GameState) {
    this.state = initialState
  }

  simulateMove(move: MCTSMove): GameState {
    this.state = move.execute()

    // Computers players don't need to care about Battle Phase
    if (this.isBattlePhase) {
      this.state = this.incrementRound(this.state)
    }

    return this.state
  }

  simulateRandomMove(): GameState {
    return this.simulateMove(this.randomMove)
  }

  playMove(move: MCTSMove): GameState {
    return move.execute()
  }

  get isBattlePhase(): boolean {
    return this.state.phase === PhaseKind.Battle
  }

  get isOver(): boolean {
    return this.state.gameOver
  }

  get winnerId(): UUID | false {
    return this.state.gameWinnerId ?? false
  }

  get randomMove(): MCTSMove {
    return randomItem([...this.moves.values()])
  }

  get randomWeightedMove(): MCTSMove {
    return weightedRandomItem([...this.moves.values()])
  }

  get moves(): Map<string, MCTSMove> {
    const moves: Map<string, MCTSMove> = new Map<string, MCTSMove>()
    const { rack, pool, gold } = this.state
    const { letterBuyCost, rackCapacity, poolRefreshCost } = gameConfig

    // Buy Moves
    if (gold >= letterBuyCost && rack.length < rackCapacity) {
      pool.forEach((letter, i) => {
        const name = `buy-letter-${letter.name}-at-${i}`

        moves.set(name, {
          name,
          weight: 80 + letter.value,
          execute: () => this.buyLetter(letter, this.state),
          actionKind: GameActionKind.BuyLetter,
        })
      })
    }

    // Re-arrange Moves
    rack.forEach((fromLetter) => {
      rack
        .filter((letter) => letter.id !== fromLetter.id)
        .forEach((toLetter) => {
          const name = `move-letter-${fromLetter.name}-at-${rack.indexOf(
            fromLetter
          )}-to-${toLetter.name}-at-${rack.indexOf(toLetter)}`
          moves.set(name, {
            name,
            weight: 70,
            execute: () =>
              this.moveLetterInRack(fromLetter, toLetter, this.state),
            actionKind: GameActionKind.MoveLetterInRack,
          })
        })
    })

    // Refresh Pool
    if (gold >= poolRefreshCost) {
      const name = 'refresh-pool'
      moves.set(name, {
        name,
        weight: 50,
        execute: () => this.refreshPool(this.state),
        actionKind: GameActionKind.RefreshPool,
      })
    }

    // Thaw Moves
    pool
      .filter((letter) => letter.frozen)
      .forEach((letter, i) => {
        const name = `thaw-letter-${letter.name}-at-${i}`
        moves.set(name, {
          name,
          weight: 60 + letter.value,
          execute: () => this.thawLetter(letter, this.state),
          actionKind: GameActionKind.ThawLetter,
        })
      })

    // Freeze Moves
    pool
      .filter((letter) => !letter.frozen)
      .forEach((letter, i) => {
        const name = `freeze-letter-${letter.name}-at-${i}`
        moves.set(name, {
          name,
          weight: 40 + letter.value,
          execute: () => this.freezeLetter(letter, this.state),
          actionKind: GameActionKind.FreezeLetter,
        })
      })

    // Sell Moves
    rack.forEach((letter, i) => {
      const name = `sell-letter-${letter.name}-at-${i}`

      moves.set(name, {
        name,
        weight: 20 - letter.value,
        execute: () => this.sellLetter(letter, this.state),
        actionKind: GameActionKind.SellLetter,
      })
    })

    // End Turn
    moves.set('end-turn', {
      name: 'end-turn',
      weight: 5,
      execute: () => this.endTurn(this.state),
      actionKind: GameActionKind.EndTurn,
    })

    return moves
  }

  cloneState(state: GameState): GameState {
    return produce(state, (draft) => {
      return draft
    })
  }

  get noOpMove() {
    return {
      name: 'no-op',
      weight: 0,
      execute: () => this.state,
      actionKind: GameActionKind.Set,
    }
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

  incrementRound(state: GameState) {
    return gameContextReducer(state, {
      type: GameActionKind.IncrementRound,
    })
  }
}

// Heavily adapted from https://github.com/SethPipho/monte-carlo-tree-search-js
export class MCTSNode {
  parent: MCTSNode | null
  move: MCTSMove
  unexploredMoves: Map<string, MCTSMove>
  children: Map<string, MCTSNode>
  visits: number
  wins: number

  constructor(
    parent: MCTSNode | null,
    move: MCTSMove,
    moves: Map<string, MCTSMove>
  ) {
    this.parent = parent
    this.children = new Map<string, MCTSNode>()
    this.move = move
    this.unexploredMoves = moves
    this.visits = 0
    this.wins = 0
  }

  activePlayerScore(gameState: GameState) {
    return gameState.players.get(gameState.activePlayerId)?.totalScore
  }

  // Used to balance between selecting optimal nodes and exploring new areas of the tree
  computeNodeScore(explorationConstant: number) {
    return (
      this.wins / this.visits +
      explorationConstant *
        Math.sqrt(Math.log(this?.parent?.visits ?? 0) / this.visits)
    )
  }
}

// Heavily adapted from https://github.com/SethPipho/monte-carlo-tree-search-js
export class MCTS {
  game: MCTSGame
  playerId: UUID
  iterations: number
  exploration: number

  constructor(
    game: MCTSGame,
    playerId: UUID,
    iterations?: number,
    exploration?: number
  ) {
    this.game = game
    this.playerId = playerId
    this.iterations = iterations ?? 500
    this.exploration = exploration ?? 1.41
  }

  public playTurn(): GameState {
    const originalState = this.game.state
    const root = new MCTSNode(null, this.game.noOpMove, this.game.moves)

    // Build stats
    console.log('building stats...')
    for (let i = 0; i < this.iterations; i++) {
      this.game.state = this.game.cloneState(originalState)

      // Phase 1: Select
      const selectedNode = this.#select(root)
      if (this.game.isOver && this.game.winnerId !== this.playerId) {
        if (selectedNode.parent) {
          selectedNode.parent.wins = -Infinity
        }
      }

      // Phase 2: Expand
      const expandedNode = this.#expand(selectedNode)

      // Phase 3: Simulate
      console.log('simulating game...')
      this.#simulate()

      // Phase 4: Back Propagate
      let wins = -1
      if (!this.game.winnerId) {
        wins = 0
      } else if (this.game.winnerId === this.playerId) {
        wins = 1
      }

      this.#backPropagate(expandedNode, wins)
    }

    // Play Turn
    this.game.state = originalState
    console.log('playing turn: ', this.playerId, this.game.state)
    return this.#playTurnMove(root)
  }

  // a sequence of moves representing the build phase, similar to #select, but ends when the turn is over instead of when the game is over
  #playTurnMove(node: MCTSNode): GameState {
    if (node.children.size === 0) {
      return this.game.endTurn(this.game.state)
    }

    const nextNode = [...node.children.values()].reduce(
      (bestChild, currentChild) => {
        const bestChildScore = bestChild.wins
        const currentChildScore = currentChild.wins

        if (currentChildScore > bestChildScore) {
          return currentChild
        }

        return bestChild
      }
    )

    console.log(nextNode.move.name, nextNode.wins)

    if (nextNode.move.name === 'end-turn') {
      return this.game.playMove(nextNode.move)
    }

    this.game.simulateMove(nextNode.move)

    return this.#playTurnMove(nextNode)
  }

  // Phase 1: Iterates through the tree using UCT calculation until it reaches a node with unexpanded nodes. Then returns that node.
  #select(node: MCTSNode): MCTSNode {
    if (node.unexploredMoves.size > 0) {
      return node
    }

    const selectedNode = this.#selectBestChild(node)

    this.game.simulateMove(selectedNode.move)
    return this.#select(selectedNode)
  }

  #selectBestChild(node: MCTSNode): MCTSNode {
    const explorationConstant = this.exploration

    return [...node.children.values()].reduce((bestChild, currentChild) => {
      const maxValue = bestChild.computeNodeScore(explorationConstant)
      const currentValue = currentChild.computeNodeScore(explorationConstant)

      if (currentValue > maxValue) {
        return currentChild
      }

      return bestChild
    })
  }

  // Phase 2: Attaches a random new node to the provided node and returns the new node
  #expand(node: MCTSNode): MCTSNode {
    const move = this.#selectRandomUnexploredMove(node)
    node.unexploredMoves.delete(move.name)

    this.game.simulateMove(move)

    const newNode = new MCTSNode(node, move, this.game.moves)
    node.children.set(move.name, newNode)

    return newNode
  }

  #selectRandomUnexploredMove(node: MCTSNode): MCTSMove {
    const randomMove = weightedRandomItem([...node.unexploredMoves.values()])

    if (node.children.has(randomMove.name)) {
      return this.#selectRandomUnexploredMove(node)
    }

    return randomMove
  }

  // Phase 3: Play out the game until the game is over
  #simulate() {
    while (!this.game.isOver) {
      this.game.simulateRandomMove()
    }
  }

  // Phase 4: Iterate back up the tree from the provided node to the root, updating node statistics along the way
  #backPropagate(node: MCTSNode, wins: number) {
    node.visits += 1
    node.wins += wins

    if (node.parent) {
      this.#backPropagate(node.parent, wins)
    }
  }
}
