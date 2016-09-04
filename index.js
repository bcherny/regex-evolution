const {random} = require('lodash');

const COMPLEXITY_PENALTY = -2;
const CORRECTNESS_BONUS = 10;
const INCORRECTNESS_PENALTY = -1;
const INVALID_PENALTY = -100;

const INITIAL_FITNESS = -Infinity

const MUTATION_TYPES = {
  0: 'ADDITION',
  1: 'DELETION',
  2: 'MUTATION',
  3: 'DUPLICATION'
}

const maybe = fn => {
  try {
    return fn()
  } catch (e) {
    return undefined
  }
};

// regex: string => RegExp
function toRegex(regex) {
  return maybe(() => new RegExp(regex))
}

// regex: string, cases: string[][] => number
function getFitness(regex, cases) {

  if (regex === '') {
    return INITIAL_FITNESS
  }

  let rgx = toRegex(regex);
  console.log('rgx', rgx)

  return (
    cases[0].reduce((score, _) => score + (rgx.test(_) ? CORRECTNESS_BONUS : INCORRECTNESS_PENALTY), 0)
    + cases[1].reduce((score, _) => score + (rgx.test(_) ? INCORRECTNESS_PENALTY : CORRECTNESS_BONUS), 0)
    + COMPLEXITY_PENALTY * getComplexity(regex)
  );
}

// regex: string, cases: string[][] => number
function getPercentCorrect(regex, cases) {
  return cases[0].reduce((score, _) => score + (getFitness(regex, cases) > 0 ? 1 : 0))
    + cases[1].reduce((score, _) => score + (getFitness(regex, cases) <= 0 ? 1 : 0));
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

const cases = [
  [['00', '01', '10'], ['11']],
  [['00', '01', '11'], ['10']]
];

let regex = '';
for (let n = 0; n < 10; n++) {
  let regex2 = regex;
  for (let n = 0; n < 10; n++) {
    regex2 = evolveRegex(regex2);
  }
  console.log('FITNESS', regex, '(' + getFitness(regex, cases) + ')', regex2, '(' + getFitness(regex2, cases) + ')')
  if (getFitness(regex2, cases) > getFitness(regex, cases)) {
    regex = regex2
  }
}

console.log(`RESULT: ${regex} (fitness=${getFitness(regex, cases)}, %correct=${getPercentCorrect(regex, cases)})`);



//////////////

// void => string
function getNext() {
  return ['*', '?', '+', '0', '1'][random(0, 4)];
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