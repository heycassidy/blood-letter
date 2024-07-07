import { randomItem } from '../lib/helpers'
import { nanoid } from 'nanoid'
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

  get moves(): Map<string, MCTSMove> {
    const moves: Map<string, MCTSMove> = new Map<string, MCTSMove>()
    const { rack, pool, gold } = this.state
    const { letterBuyCost, rackCapacity, poolRefreshCost } = gameConfig

    // Buy Moves
    if (gold >= letterBuyCost && rack.length < rackCapacity) {
      pool.forEach((letter) => {
        const name = `buy-letter-${letter.name}`

        moves.set(name, {
          name,
          execute: () => this.buyLetter(letter, this.state),
        })
      })
    }

    // Sell Moves
    rack.forEach((letter) => {
      const name = `sell-letter-${letter.name}`

      moves.set(name, {
        name,
        execute: () => this.sellLetter(letter, this.state),
      })
    })

    // Freeze Moves
    pool
      .filter((letter) => !letter.frozen)
      .forEach((letter) => {
        const name = `freeze-letter-${letter.name}`
        moves.set(name, {
          name,
          execute: () => this.freezeLetter(letter, this.state),
        })
      })

    // Thaw Moves
    pool
      .filter((letter) => letter.frozen)
      .forEach((letter) => {
        const name = `thaw-letter-${letter.name}`
        moves.set(name, {
          name,
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
          moves.set(name, {
            name,
            execute: () =>
              this.moveLetterInRack(fromLetter, toLetter, this.state),
          })
        })
    })

    // Refresh Pool
    if (gold >= poolRefreshCost) {
      const name = 'refresh-pool'
      moves.set(name, {
        name,
        execute: () => this.refreshPool(this.state),
      })
    }

    // End Turn
    moves.set('end-turn', {
      name: 'end-turn',
      execute: () => this.endTurn(this.state),
    })

    return moves
  }

  cloneState(state: GameState): GameState {
    return produce(state, (draft) => {
      return draft
    })
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
  visits: number
  wins: number
  heuristicScore: number
  numUnexpandedMoves: number
  children: Map<string, MCTSNode>
  moves: Map<string, MCTSMove>
  gameState: GameState

  constructor(
    moves: Map<string, MCTSMove>,
    parent: MCTSNode | null,
    gameState: GameState
  ) {
    this.parent = parent
    this.visits = 0
    this.wins = 0
    this.heuristicScore = 0
    this.numUnexpandedMoves = moves.size
    this.children = new Map<string, MCTSNode>()
    this.moves = moves
    this.gameState = gameState
  }

  get combinedScore() {
    return this.wins + this.heuristicScore
  }

  // Used to balance between selecting optimal nodes and exploring new areas of the tree
  computeNodeScore(explorationConstant: number) {
    return (
      this.wins / this.visits +
      explorationConstant *
        Math.sqrt(Math.log(this?.parent?.visits ?? 0) / this.visits) +
      this.heuristicScore / this.visits
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
    const moves = this.game.moves
    const root = new MCTSNode(moves, null, this.game.state)

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
      let reward
      if (!this.game.winnerId) {
        reward = 0
      } else if (this.game.winnerId === this.playerId) {
        reward = 1
      } else {
        reward = -1
      }

      let heuristicScore = 0
      const currentPlayer = expandedNode.gameState.players.get(
        expandedNode.gameState.activePlayerId
      )

      if (currentPlayer) {
        if (currentPlayer.id === this.playerId) {
          heuristicScore += currentPlayer.totalScore
        } else {
          heuristicScore -= currentPlayer.totalScore
        }
      }

      // console.log('back propagate: ', expandedNode, reward)
      this.#backPropagate(expandedNode, reward, heuristicScore)
    }

    // Play Turn
    this.game.state = originalState
    console.log('playing turn: ', this.playerId, this.game.state)
    return this.#playTurnMoves(root)
  }

  // a sequence of moves representing the build phase, similar to #simulate, but ends when the turn is over instead of when the game is over
  #playTurnMoves(node: MCTSNode): GameState {
    let maxScore = -Infinity
    let bestChild
    let bestMoveName = ''

    node.children.forEach((child, moveName) => {
      if (child.combinedScore > maxScore) {
        maxScore = child.combinedScore
        bestChild = child
        bestMoveName = moveName
      }
    })

    const bestMove = node.moves.get(bestMoveName)

    if (bestMove && bestChild) {
      this.game.state = bestMove.execute()
      console.log(bestMove.name, bestChild)
      return this.#playTurnMoves(bestChild)
    }

    const endTurnState = this.game.endTurn(this.game.state)
    console.log('Ending turn: ', endTurnState)
    return endTurnState
  }

  // Phase 1: Iterates through the tree using UCT calculation until it reaches a node with unexpanded nodes. Then returns that node.
  #select(node: MCTSNode): MCTSNode {
    let root = node
    const explorationConstant = this.exploration

    while (root.numUnexpandedMoves === 0) {
      let maxValue = -Infinity
      let moveName = ''

      root.children.forEach((child, key) => {
        const value = child.computeNodeScore(explorationConstant)

        if (value > maxValue) {
          maxValue = value
          moveName = key
        }
      })

      const move = root.moves.get(moveName)
      const newRoot = root.children.get(moveName)

      if (move && newRoot) {
        this.game.state = move.execute()
        if (this.game.isBattlePhase) {
          this.game.state = this.game.incrementRound(this.game.state)
        }

        if (this.game.isOver) {
          return root
        }

        root = newRoot
      }
    }
    return root
  }

  // Phase 2: Attaches a random new node to the provided node and returns the new node
  #expand(node: MCTSNode): MCTSNode {
    if (this.game.isOver) {
      return node
    }

    const move = this.#selectRandomUnexpandedMove(node)

    this.game.state = move.execute()

    if (this.game.isBattlePhase) {
      this.game.state = this.game.incrementRound(this.game.state)
    }

    const newNode = new MCTSNode(this.game.moves, node, this.game.state)
    node.children.set(move.name, newNode)

    return newNode
  }

  #selectRandomUnexpandedMove(node: MCTSNode): MCTSMove {
    const [moveName, move] = randomItem([...node.moves])

    if (node.children.has(moveName)) {
      return this.#selectRandomUnexpandedMove(node)
    }

    node.numUnexpandedMoves -= 1
    return move
  }

  // Phase 3: Play out the game until the game is over
  #simulate() {
    // console.log('Simulate')
    while (!this.game.isOver) {
      const randomMove = this.game.randomMove
      this.game.state = randomMove.execute()

      if (this.game.isBattlePhase) {
        this.game.state = this.game.incrementRound(this.game.state)
      }
    }
  }

  // Phase 4: Iterate back up the tree from the provided node to the root, updating node statistics along the way
  #backPropagate(node: MCTSNode | null, wins: number, heuristicScore: number) {
    const currentNode = node
    if (!currentNode) {
      return
    }

    currentNode.visits += 1
    currentNode.wins += wins
    currentNode.heuristicScore += heuristicScore
    this.#backPropagate(currentNode.parent, wins, heuristicScore)
  }
}
