const {chunk, random} = require('lodash')

module.exports.compute = compute
module.exports.getFitness = getFitness
module.exports.getPercentCorrect = getPercentCorrect

const COMPLEXITY_PENALTY = -1
const CORRECTNESS_BONUS = 10
const INCORRECTNESS_PENALTY = -1
const INITIAL_FITNESS = -Infinity
const INVALID_PENALTY = -Infinity
const GENERATIONS_PER_LINEAGE = 500
const MUTATIONS_PER_GENERATION_MIN = 1
const MUTATIONS_PER_GENERATION_MAX = 10
const NUMBER_OF_LINEAGES = 500
const SUPPORTED_REGEX_OPERANDS = ['*', '?', '+', '\\s', '\\d', '\\b', '\\w', '@', '\\.']

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

// regex: string => RegExp|undefined
function toRegex(regex) {
  return maybe(() => new RegExp('^' + regex + '$'))
}

// regex: string, cases: string[][] => number
function getFitness(regex, cases) {

  if (regex === '') {
    return INITIAL_FITNESS
  }

  const rgx = toRegex(regex)

  switch (rgx) {
    case undefined:
      return INVALID_PENALTY
    default:
      const pos = cases[0].reduce((score, _) => score + (rgx.test(_) ? CORRECTNESS_BONUS : INCORRECTNESS_PENALTY), 0)
      const neg = cases[1].reduce((score, _) => score + (rgx.test(_) ? INCORRECTNESS_PENALTY : CORRECTNESS_BONUS), 0)
      return pos > 0
        ? pos + neg + (COMPLEXITY_PENALTY * getComplexity(regex))
        : 0
  }
}

// regex: string, cases: string[][] => number
function getPercentCorrect(regex, cases) {

  if (regex === '') {
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
  if (roll < 20) return MUTATION_TYPES.ADDITION
  if (roll < 70) return MUTATION_TYPES.DELETION
  if (roll < 90) return MUTATION_TYPES.MUTATION
  return MUTATION_TYPES.DUPLICATION
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

// cases: string[][] => Promise[string]
function compute(cases) {
  return Promise.all(
    array(NUMBER_OF_LINEAGES).map(_ => async(() => {
      let best = ''
      let current = ''
      for (let i = 0; i < GENERATIONS_PER_LINEAGE; i++) {

        // mutate j times per generation
        for (let j = 0; j < random(MUTATIONS_PER_GENERATION_MIN, MUTATIONS_PER_GENERATION_MAX); j++) {
          current = evolveRegex(current)
        }

        if (getFitness(current, cases) > getFitness(best, cases)) {
          best = current
        }
      }
      return best
    }))
  )
    .then(_ => _.reduce((best, current) => getFitness(current, cases) > getFitness(best, cases) ? current : best, ''))
}

// void => string
function getNext() {
  return SUPPORTED_REGEX_OPERANDS[random(0, SUPPORTED_REGEX_OPERANDS.length - 1)]
}

// regex: string, index: number => string
function del(regex, index) {
  return regex.slice(0, index).concat(regex.slice(index + 1))
}

// regex: string, index: number => string
function dup(regex, index) {
  return regex.slice(0, index).concat(regex[index] || '').concat(regex.slice(index))
}

// regex: string, index: number => string
function ins(regex, index) {
  return regex.slice(0, index).concat(getNext()).concat(regex.slice(index))
}

// regex: string, index: number => string
function mut(regex, index) {
  return regex.slice(0, index).concat(getNext()).concat(regex.slice(index + 1))
}