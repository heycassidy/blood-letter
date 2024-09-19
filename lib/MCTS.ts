import { SingleBar } from 'cli-progress'
import { randomItem, weightedRandomItem } from './utils'
import { create } from 'mutative'
import { getTotalScore } from './Player'
import { MCTSMove, GameState, PhaseKind, UUID, Letter } from './types'
import {
  gameContextReducer,
  GameActionKind,
} from '../context/GameContextReducer'
import { gameConfig } from './gameConfig'

export class MCTSGame {
  state: GameState
  playerIndex: number

  constructor(initialState: GameState, playerIndex: number) {
    this.state = initialState
    this.playerIndex = playerIndex
  }

  simulateMove(move: MCTSMove): GameState {
    this.state = move.execute(this.state)
    return this.state

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
    return move.execute(this.state)
  }

  get isBattlePhase(): boolean {
    return this.state.phase === PhaseKind.Battle
  }

  get isOver(): boolean {
    return this.state.gameOver
  }

  get winnerId(): UUID | false {
    return this.state.gameWinnerIndex ?? false
  }

  get randomMove(): MCTSMove {
    return randomItem([...this.moves.values()])
  }

  get randomWeightedMove(): MCTSMove {
    return weightedRandomItem([...this.moves.values()])
  }

  get moves(): Map<string, MCTSMove> {
    const moves: Map<string, MCTSMove> = new Map<string, MCTSMove>()
    const { rack, pool, gold } = this.state.players[this.playerIndex]
    const { letterBuyCost, rackCapacity, poolRefreshCost } = gameConfig

    // Buy Moves
    if (gold >= letterBuyCost && rack.length < rackCapacity) {
      pool.forEach((letter, i) => {
        const name = `buy-letter-${letter.name}-at-${i}`

        moves.set(name, {
          name,
          weight: 1,
          execute: (state) => this.buyLetter(letter, state),
          actionKind: GameActionKind.BuyLetter,
        })
      })
    }

    // Sell Moves
    rack.forEach((letter, i) => {
      const name = `sell-letter-${letter.name}-at-${i}`

      moves.set(name, {
        name,
        weight: 1,
        execute: (state) => this.sellLetter(letter, state),
        actionKind: GameActionKind.SellLetter,
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
            weight: 1,
            execute: (state) =>
              this.moveLetterInRack(fromLetter, toLetter, state),
            actionKind: GameActionKind.MoveLetterInRack,
          })
        })
    })

    // Refresh Pool
    if (gold >= poolRefreshCost) {
      const name = 'refresh-pool'
      moves.set(name, {
        name,
        weight: 1,
        execute: (state) => this.refreshPool(state),
        actionKind: GameActionKind.RefreshPool,
      })
    }

    // Freeze Moves
    pool
      .filter((letter) => !letter.frozen)
      .forEach((letter, i) => {
        const name = `freeze-letter-${letter.name}-at-${i}`
        moves.set(name, {
          name,
          weight: 1,
          execute: (state) => this.freezeLetter(letter, state),
          actionKind: GameActionKind.FreezeLetter,
        })
      })

    // Thaw Moves
    pool
      .filter((letter) => letter.frozen)
      .forEach((letter, i) => {
        const name = `thaw-letter-${letter.name}-at-${i}`
        moves.set(name, {
          name,
          weight: 1,
          execute: (state) => this.thawLetter(letter, state),
          actionKind: GameActionKind.ThawLetter,
        })
      })

    // End Turn
    moves.set('end-turn', {
      name: 'end-turn',
      weight: 1,
      execute: (state) => this.endTurn(state),
      actionKind: GameActionKind.EndTurn,
    })

    return moves
  }

  cloneState(state: GameState): GameState {
    return create(state, (draft) => {
      return draft
    })
  }

  get noOpMove() {
    return {
      name: 'no-op',
      weight: 1,
      execute: () => this.state,
      actionKind: GameActionKind.Set,
    }
  }

  buyLetter(letter: Letter, state: GameState) {
    return gameContextReducer(
      state,
      {
        type: GameActionKind.BuyLetter,
        payload: { letter },
      },
      this.playerIndex
    )
  }

  sellLetter(letter: Letter, state: GameState) {
    return gameContextReducer(
      state,
      {
        type: GameActionKind.SellLetter,
        payload: { letter },
      },
      this.playerIndex
    )
  }

  freezeLetter(letter: Letter, state: GameState) {
    return gameContextReducer(
      state,
      {
        type: GameActionKind.ToggleFreeze,
        payload: { letter },
      },
      this.playerIndex
    )
  }

  thawLetter(letter: Letter, state: GameState) {
    return gameContextReducer(
      state,
      {
        type: GameActionKind.ToggleFreeze,
        payload: { letter },
      },
      this.playerIndex
    )
  }

  moveLetterInRack(letter: Letter, overLetter: Letter, state: GameState) {
    return gameContextReducer(
      state,
      {
        type: GameActionKind.MoveLetterInRack,
        payload: { letterId: letter.id, overId: overLetter.id },
      },
      this.playerIndex
    )
  }

  refreshPool(state: GameState) {
    return gameContextReducer(
      state,
      {
        type: GameActionKind.RefreshPool,
      },
      this.playerIndex
    )
  }

  endTurn(state: GameState) {
    return gameContextReducer(
      state,
      {
        type: GameActionKind.EndTurn,
      },
      this.playerIndex
    )
  }

  incrementRound(state: GameState) {
    return gameContextReducer(
      state,
      {
        type: GameActionKind.IncrementRound,
      },
      this.playerIndex
    )
  }
}

// Heavily adapted from https://github.com/SethPipho/monte-carlo-tree-search-js
export class MCTSNode {
  parent: MCTSNode | null
  move: MCTSMove
  unexploredMoves: Map<string, MCTSMove>
  children: Map<string, MCTSNode>
  visits: number
  reward: number

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
    this.reward = 0
  }

  // Used to balance between selecting optimal nodes and exploring new areas of the tree
  computeNodeScore(explorationConstant: number) {
    return (
      this.reward / this.visits +
      explorationConstant *
        Math.sqrt(Math.log(this?.parent?.visits ?? 0) / this.visits)
    )
  }
}

// Heavily adapted from https://github.com/SethPipho/monte-carlo-tree-search-js
export class MCTS {
  game: MCTSGame
  playerIndex: number
  iterations: number
  exploration: number

  constructor(
    game: MCTSGame,
    playerIndex: number,
    iterations?: number,
    exploration?: number
  ) {
    this.game = game
    this.playerIndex = playerIndex
    this.iterations = iterations ?? 500
    this.exploration = exploration ?? 1.41
  }

  public playTurn(): GameState {
    const originalState = this.game.state
    const root = new MCTSNode(null, this.game.noOpMove, this.game.moves)

    let highestAchievedScore = 1

    const progressBar = new SingleBar({
      format:
        'Building stats... [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
      stopOnComplete: true,
    })

    // Build stats
    progressBar.start(this.iterations, 0)
    for (let i = 0; i < this.iterations; i++) {
      progressBar.increment()
      this.game.state = this.game.cloneState(originalState)

      // Phase 1: Select
      const selectedNode = this.#select(root)

      // Phase 2: Expand
      const expandedNode = this.#expand(selectedNode)

      // Phase 3: Simulate
      // console.log('simulating game...')
      const [reward, computerPlayerScore] = this.#simulate(highestAchievedScore)

      // Logging
      if (computerPlayerScore > highestAchievedScore) {
        highestAchievedScore = computerPlayerScore
      }

      // Phase 4: Back Propagate
      this.#backPropagate(expandedNode, reward)
    }

    // Play Turn
    this.game.state = originalState
    // console.log('playing turn: ', this.playerId, this.game.state)
    return this.#playTurnMove(root)
  }

  // a sequence of moves representing the build phase, similar to #select, but ends when the turn is over instead of when the game is over
  #playTurnMove(node: MCTSNode): GameState {
    if (node.children.size === 0) {
      return this.game.endTurn(this.game.state)
    }

    const nextNode = [...node.children.values()].reduce(
      (bestChild, currentChild) => {
        const bestChildScore = bestChild.reward
        const currentChildScore = currentChild.reward

        if (currentChildScore > bestChildScore) {
          return currentChild
        }

        return bestChild
      }
    )

    console.table(
      [...node.children.values()].map((node) => ({
        name: node.move.name,
        reward: node.reward,
        visits: node.visits,
      }))
    )

    console.log('chosen move: ', nextNode.move.name, nextNode.reward)

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

  // Phase 3: Instead of full playouts, use abstracted simulation inspired by this paper
  // http://www.gameaipro.com/GameAIPro3/GameAIPro3_Chapter28_Pitfalls_and_Solutions_When_Using_Monte_Carlo_Tree_Search_for_Strategy_and_Tactical_Games.pdf
  #simulate(maxScore: number): [number, number] {
    const playerScore = getTotalScore(this.game.state.players[this.playerIndex])

    const simulatedWinner = this.game.state.players.reduce(
      (previousPlayer, player) => {
        if (getTotalScore(player) > getTotalScore(previousPlayer)) {
          return player
        }

        return previousPlayer
      }
    )

    const simulatedWinnerIndex = this.game.state.players.findIndex(
      (player) => player.id === simulatedWinner.id
    )

    const { min, max } = this.game.state.players.reduce(
      (acc, player) => {
        const num = getTotalScore(player)

        return {
          min: num < acc.min ? num : acc.min,
          max: num > acc.max ? num : acc.max,
        }
      },
      { min: Infinity, max: -Infinity }
    )

    let scoreDifference = Math.abs(max - min)
    if (simulatedWinnerIndex !== this.playerIndex) {
      scoreDifference = scoreDifference * -1
    }

    const reward = this.#normalizedReward(scoreDifference, maxScore)

    return [reward, playerScore]
  }

  #normalizedReward(scoreDifference: number, maxScore: number) {
    // If a player played 6 tier 6 letters and got a word, their score would be 432

    const maxScoreDiff = maxScore
    const minScoreDiff = -1 * maxScoreDiff

    return (scoreDifference - minScoreDiff) / (maxScoreDiff - minScoreDiff)
  }

  // Phase 4: Iterate back up the tree from the provided node to the root, updating node statistics along the way
  #backPropagate(node: MCTSNode, reward: number) {
    node.visits += 1
    node.reward += reward

    if (node.parent) {
      this.#backPropagate(node.parent, reward)
    }
  }
}
