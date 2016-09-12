import { chunk, random } from 'lodash'
import {array, async, maybe} from './utils'

const COMPLEXITY_PENALTY = -1
const CORRECTNESS_BONUS = 10
const INCORRECTNESS_PENALTY = -5
const INITIAL_FITNESS = -Infinity
const INVALID_PENALTY = -Infinity
const GENERATIONS_PER_LINEAGE = 100
const MUTATIONS_PER_GENERATION_MIN = 1
const MUTATIONS_PER_GENERATION_MAX = 1
const NUMBER_OF_LINEAGES = 100

enum MUTATION_TYPE {
  ADDITION,
  DELETION,
  MUTATION,
  DUPLICATION
}

function toRegex(regex: string[]): RegExp | undefined {
  return maybe(() => new RegExp(regex.join('')))
}

function getFitness(regex: string[], alphabet: string[], good: string[], bad: string[]): number {

  if (regex[0] === undefined) {
    return INITIAL_FITNESS
  }

  const rgx = toRegex(regex)

  if (rgx === undefined) return INVALID_PENALTY

  const getOne = (oneCase: string): number => {
    const match = oneCase.match(rgx)
    if (match === null) return 0
    if (match[0].length === oneCase.length) return Infinity // perfect match
    return match[0].length
  }

  const get = (cases: string[]): number => cases.reduce((score, _) => score + getOne(_), 0)

  const pos = CORRECTNESS_BONUS * get(good)
  const neg = INCORRECTNESS_PENALTY * get(bad)
  return pos + neg + (COMPLEXITY_PENALTY * getComplexity(regex))
}

function getPercentCorrect(regex: string[], alphabet: string[], good: string[], bad: string[]): number {

  if (regex[0] === undefined) {
    return 0
  }

  const rgx = toRegex(regex)

  if (rgx === undefined) return 0

  const posCorrect = good.reduce((score, _) => score + (_.match(rgx) ? 1 : 0), 0)
  const negCorrect = bad.reduce((score, _) => score + (_.match(rgx) ? 0 : 1), 0)
  const correct = posCorrect + negCorrect
  const total = good.length + bad.length
  return Math.round(100 * correct / total)
}

function getComplexity(regex: string[]): number {
  return regex.length
}

function getMutationType(): MUTATION_TYPE {
  let roll = random(0, 100)
  if (roll < 13) return MUTATION_TYPE.ADDITION
  if (roll < 30) return MUTATION_TYPE.DELETION
  return MUTATION_TYPE.MUTATION
  // return MUTATION_TYPE.DUPLICATION
}

function evolveRegex(regex: string[], alphabet: string[]): string[] {
  switch (getMutationType()) {
    case MUTATION_TYPE.ADDITION: return ins(regex, random(0, regex.length - 1), alphabet)
    case MUTATION_TYPE.DELETION: return del(regex, random(0, regex.length - 1))
    case MUTATION_TYPE.MUTATION: return mut(regex, random(0, regex.length - 1), alphabet)
    default: return dup(regex, random(0, regex.length - 1))
  }
}

interface Input { alphabet: string[], good: string[], bad: string[] }
interface Result { regex: string, fitnessScore: number, percentCorrect: number }

export function compute({alphabet, good, bad}: Input): Promise<Result> {
  const total = NUMBER_OF_LINEAGES * GENERATIONS_PER_LINEAGE * MUTATIONS_PER_GENERATION_MAX
  let counter = 0
  console.log(`generating up to ${total} mutations...`)
  return Promise.all(
    array(NUMBER_OF_LINEAGES).map(_ => async(() => {
      let best: string[] = []
      let bestFitness = -Infinity
      for (let i = GENERATIONS_PER_LINEAGE; i--;) {

        // log new best
        let symbol = '.'

        // mutate j times per generation
        let current: string[] = []
        for (let j = random(MUTATIONS_PER_GENERATION_MIN, MUTATIONS_PER_GENERATION_MAX); j--;) {
          current = evolveRegex(best, alphabet)
        }

        const fitness = getFitness(current, alphabet, good, bad)
        // console.log(array(f/10 | 1).map(() => '=').join(''), current.join(''))

        // if we have a perfect match, short circuit
        if (fitness === Infinity) {
          return current
        }

        if (fitness > bestFitness) {
          best = current
          bestFitness = fitness
          symbol = 'x'
        }

        // log progress
        counter++
        if (((100000*counter/total) | 0) % 100 === 0) process.stdout.write(symbol)
      }
      return best
    }))
  )
    .then(_ => {
      const winner = _.reduce((best, current) =>
        getFitness(current, alphabet, good, bad) > getFitness(best, alphabet, good, bad) ? current : best, []
      )
      return {
        regex: winner.join(''),
        fitnessScore: getFitness(winner, alphabet, good, bad),
        percentCorrect: getPercentCorrect(winner, alphabet, good, bad)
      }
    })
}

function getNext(current: string, alphabet: string[]): string {
  const next = alphabet[random(0, alphabet.length - 1)]
  if (next === current) return getNext(current, alphabet) // don't generate consecutive duplicates
  return next
}

function del(value: string[], index: number): string[] {
  return value.slice(0, index).concat(value.slice(index + 1))
}

function dup(value: string[], index: number): string[] {
  return value.slice(0, index).concat(value[index] || '').concat(value.slice(index))
}

function ins(value: string[], index: number, alphabet: string[]): string[] {
  return value.slice(0, index).concat(getNext(value[index], alphabet)).concat(value.slice(index))
}

function mut(value: string[], index: number, alphabet: string[]): string[] {
  return value.slice(0, index).concat(getNext(value[index], alphabet)).concat(value.slice(index + 1))
}