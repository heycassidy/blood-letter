import { nanoid } from 'nanoid'
import { gameConfig } from '../lib/gameConfig'
import { sumItemProperty, concatItemProperty } from './utils'
import { getPoolForRound, wordsSet } from './helpers'
import { Player, PlayerOptions } from '../lib/types'

const { initialRound, initialHealth, initialGold } = gameConfig

// Function to create a Player object
function createPlayer(options: Readonly<PlayerOptions>): Player {
  return {
    id: options.id ?? nanoid(10),
    name: options.name,
    classification: options.classification,
    seed: options.startingSeed ?? Math.random(),
    health: options.health ?? initialHealth,
    battleVictories: options.battleVictories ?? 0,
    rack: options.rack ?? [],
    pool: options.pool ?? getPoolForRound(initialRound),
    gold: options.gold ?? initialGold,
    playedTurn: options.playedTurn ?? false,
  }
}

function getRackWord(player: Player): string {
  return concatItemProperty(
    player.rack.map((letter) => ({ name: letter.name })),
    'name'
  )
}

function getRackScore(player: Player): number {
  return sumItemProperty(
    player.rack.map((letter) => ({ value: letter.value })),
    'value'
  )
}

function getWordBonus(player: Player): number {
  const rackWord = getRackWord(player)
  return wordsSet.has(rackWord)
    ? gameConfig.wordBonusComputation(rackWord.length)
    : 0
}

function getTotalScore(player: Player): number {
  const rackScore = getRackScore(player)
  const wordBonus = getWordBonus(player)
  return rackScore + wordBonus
}

export { createPlayer, getRackWord, getRackScore, getWordBonus, getTotalScore }
