const {random} = require('lodash');

const COMPLEXITY_PENALTY = -1;
const CORRECTNESS_BONUS = 10;
const INCORRECTNESS_PENALTY = -1;
const INITIAL_FITNESS = -Infinity;
const INVALID_PENALTY = -Infinity;
const GENERATIONS_PER_LINEAGE = 1000;
const NUMBER_OF_LINEAGES = 1000;
const SUPPORTED_REGEX_OPERANDS = ['*', '?', '+', '\\s', '\\d', '\\b', '\\w', '@', '\\.'];

const MUTATION_TYPES = {
  0: 'ADDITION',
  1: 'DELETION',
  2: 'MUTATION',
  3: 'DUPLICATION'
}

// [A] fn: () => A => A | undefined
const maybe = fn => {
  try {
    return fn()
  } catch (e) {
    return undefined
  }
};

// regex: string => RegExp|undefined
function toRegex(regex) {
  return maybe(() => new RegExp('^' + regex + '$'))
}

// regex: string, cases: string[][] => number
function getFitness(regex, cases) {

  if (regex === '') {
    return INITIAL_FITNESS
  }

  const rgx = toRegex(regex);

  switch (rgx) {
    case undefined:
      return INVALID_PENALTY;
    default:
      const pos = cases[0].reduce((score, _) => score + (rgx.test(_) ? CORRECTNESS_BONUS : INCORRECTNESS_PENALTY), 0);
      const neg = cases[1].reduce((score, _) => score + (rgx.test(_) ? INCORRECTNESS_PENALTY : CORRECTNESS_BONUS), 0);
      return pos + neg + (COMPLEXITY_PENALTY * getComplexity(regex));
  }
}

// regex: string, cases: string[][] => number
function getPercentCorrect(regex, cases) {

  if (regex === '') {
    return 0;
  }

  const rgx = toRegex(regex);

  switch (rgx) {
    case undefined:
      return 0;
    default:
      const posCorrect = cases[0].reduce((score, _) => score + (rgx.test(_) ? 1 : 0), 0);
      const negCorrect = cases[1].reduce((score, _) => score + (rgx.test(_) ? 0 : 1), 0);
      const correct = posCorrect + negCorrect;
      const total = cases[0].length + cases[1].length;
      return Math.round(100 * correct / total);
  }
}

// regex: string => number
function getComplexity(regex) {
  return regex.length
}

// void => string
function getMutationType() {
  let roll = random(0, 100)
  if (roll < 10) return MUTATION_TYPES[0];
  if (roll < 20) return MUTATION_TYPES[1];
  if (roll < 90) return MUTATION_TYPES[2];
  return MUTATION_TYPES[3];
}

// seed: string => string
function evolveRegex(regex) {
  switch (getMutationType()) {
    case 'ADDITION': return ins(regex, random(0, regex.length - 1));
    case 'DELETION': return del(regex, random(0, regex.length - 1));
    case 'MUTATION': return mut(regex, random(0, regex.length - 1));
    case 'DUPLICATION': return dup(regex, random(0, regex.length - 1));
  }
}

//// test

// const cases = [['00', '01', '10'], ['11']];
const cases = [
  ['bcherny@gmail.com', 'boris@performancejs.com', 'johnq@yahoo.com', 'john.brown@gmail.com'],
  ['foo', '123', 'bcherny.com', '@foo', '@foo.co']
]

const best = Array.apply(null, { length: NUMBER_OF_LINEAGES })
  .map(() => {
    let best = '';
    let current = '';
    for (let n = 0; n < GENERATIONS_PER_LINEAGE; n++) {
      current = evolveRegex(current);
      if (getFitness(current, cases) > getFitness(best, cases)) {
        best = current
      }
    }
    return best;
  })
  .reduce((best, current) => getFitness(current, cases) > getFitness(best, cases) ? current : best, '');



console.log(`BEST REGEX: "^${best}$" (fitness=${getFitness(best, cases)}, correct=${getPercentCorrect(best, cases)}%)`);



//////////////

// void => string
function getNext() {
  return SUPPORTED_REGEX_OPERANDS[random(0, SUPPORTED_REGEX_OPERANDS.length - 1)];
}

// regex: string, index: number => string
function del(regex, index) {
  return regex.slice(0, index).concat(regex.slice(index + 1));
}

// regex: string, index: number => string
function dup(regex, index) {
  return regex.slice(0, index).concat(regex[index]).concat(regex.slice(index));
}

// regex: string, index: number => string
function ins(regex, index) {
  return regex.slice(0, index).concat(getNext()).concat(regex.slice(index));
}

// regex: string, index: number => string
function mut(regex, index) {
  return regex.slice(0, index).concat(getNext()).concat(regex.slice(index + 1));
}