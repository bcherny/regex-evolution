const {chunk, random} = require('lodash')

module.exports.compute = compute
module.exports.getFitness = getFitness
module.exports.getPercentCorrect = getPercentCorrect

const COMPLEXITY_PENALTY = -1
const CORRECTNESS_BONUS = 10
const INCORRECTNESS_PENALTY = -1
const INITIAL_FITNESS = -Infinity
const INVALID_PENALTY = -Infinity
const GENERATIONS_PER_LINEAGE = 500000
const MUTATIONS_PER_GENERATION_MIN = 1
const MUTATIONS_PER_GENERATION_MAX = 10
const NUMBER_OF_LINEAGES = 1
const SUPPORTED_REGEX_OPERANDS = ['*', '.', '?', '\\b', '\\w', '@', '\\.'] // '+', '%', '$', '#', '!', '&', '\\s', '\\d'

const MUTATION_TYPES = {
  ADDITION: 'ADDITION',
  DELETION: 'DELETION',
  MUTATION: 'MUTATION',
  DUPLICATION: 'DUPLICATION'
}

const array = length => Array.apply(null, { length })
const async = fn => new Promise(resolve => setTimeout(() => resolve(fn()), 0))

// [A] fn: () => A => A | undefined
const maybe = fn => { try { return fn() } catch (e) { return undefined } }

// regex: string[] => RegExp|undefined
function toRegex(regex) {
  return maybe(() => new RegExp('^' + regex.join('') + '$'))
}

// regex: string[], cases: string[][] => number
function getFitness(regex, cases) {

  if (regex[0] === undefined) {
    return INITIAL_FITNESS
  }

  const rgx = toRegex(regex)

  // oneCase: string => number
  const getOne = oneCase => oneCase.split('').reduce((acc, _) => acc + (rgx.test(_) ? 1 : 0), 0)

  // cases: string[] => number
  const get = cases => cases.reduce((score, _) => score + getOne(_), 0)

  switch (rgx) {
    case undefined:
      return INVALID_PENALTY
    default:
      const pos = CORRECTNESS_BONUS * get(cases[0])
      const neg = INCORRECTNESS_PENALTY * get(cases[1])
      return pos + neg + (COMPLEXITY_PENALTY * getComplexity(regex))
  }
}

// regex: string, cases: string[][] => number
function getPercentCorrect(regex, cases) {

  if (regex[0] === undefined) {
    return 0
  }

  const rgx = toRegex(regex)

  switch (rgx) {
    case undefined:
      return 0
    default:
      const posCorrect = cases[0].reduce((score, _) => score + (rgx.test(_) ? 1 : 0), 0)
      const negCorrect = cases[1].reduce((score, _) => score + (rgx.test(_) ? 0 : 1), 0)
      const correct = posCorrect + negCorrect
      const total = cases[0].length + cases[1].length
      return Math.round(100 * correct / total)
  }
}

// regex: string => number
function getComplexity(regex) {
  return regex.length
}

// void => string
function getMutationType() {
  let roll = random(0, 100)
  if (roll < 10) return MUTATION_TYPES.ADDITION
  if (roll < 30) return MUTATION_TYPES.DELETION
  return MUTATION_TYPES.MUTATION
  // return MUTATION_TYPES.DUPLICATION
}

// seed: string => string
function evolveRegex(regex) {
  switch (getMutationType()) {
    case MUTATION_TYPES.ADDITION: return ins(regex, random(0, regex.length - 1))
    case MUTATION_TYPES.DELETION: return del(regex, random(0, regex.length - 1))
    case MUTATION_TYPES.MUTATION: return mut(regex, random(0, regex.length - 1))
    case MUTATION_TYPES.DUPLICATION: return dup(regex, random(0, regex.length - 1))
  }
}

// cases: string[][] => Promise[string[]]
function compute(cases) {
  const total = NUMBER_OF_LINEAGES * GENERATIONS_PER_LINEAGE * MUTATIONS_PER_GENERATION_MAX
  let counter = 0
  console.log(`generating up to ${total} mutations...`)
  return Promise.all(
    array(NUMBER_OF_LINEAGES).map(_ => async(() => {
      let best = []
      let current = []
      for (let i = GENERATIONS_PER_LINEAGE; i--;) {

        // log new best
        let symbol = '.'

        // mutate j times per generation
        for (let j = random(MUTATIONS_PER_GENERATION_MIN, MUTATIONS_PER_GENERATION_MAX); j--;) {
          current = evolveRegex(current)
        }

        const f = getFitness(current, cases)
        // console.log(array(f/10 | 1).map(() => '=').join(''), current.join(''))

        if (f > getFitness(best, cases)) {
          best = current
          symbol = 'x'
        }

        // log progress
        counter++
        if (((100000*counter/total) | 0) % 100 === 0) process.stdout.write(symbol)
      }
      return best
    }))
  )
    .then(_ => _.reduce((best, current) => getFitness(current, cases) > getFitness(best, cases) ? current : best, []))
}

// current: string => string
function getNext(current) {
  const next = SUPPORTED_REGEX_OPERANDS[random(0, SUPPORTED_REGEX_OPERANDS.length - 1)]
  if (next === current) return getNext(current) // don't generate consecutive duplicates
  return next
}

// value: array|string, index: number => array|string
function del(value, index) {
  return value.slice(0, index).concat(value.slice(index + 1))
}

// value: array|string, index: number => array|string
function dup(value, index) {
  return value.slice(0, index).concat(value[index] || '').concat(value.slice(index))
}

// value: array|string, index: number => array|string
function ins(value, index) {
  return value.slice(0, index).concat(getNext(value[index])).concat(value.slice(index))
}

// value: array|string, index: number => array|string
function mut(value, index) {
  return value.slice(0, index).concat(getNext(value[index])).concat(value.slice(index + 1))
}