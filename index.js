const {random} = require('lodash');

const COMPLEXITY_PENALTY = -2;
const CORRECTNESS_BONUS = 10;
const INCORRECTNESS_PENALTY = -1;
const INVALID_PENALTY = -100;

const MUTATION_TYPES = {
  0: 'ADDITION',
  1: 'DELETION',
  2: 'MUTATION',
  3: 'DUPLICATION'
}

// regex: string, cases: string[][] => number
function getFitness(regex, cases) {

  let rgx;
  try {
    rgx = new RegExp(regex);
  } catch (e) {
    return INVALID_PENALTY;
  }

  return (
    cases[0].reduce((score, _) => score + (rgx.test(_) ? CORRECTNESS_BONUS : INCORRECTNESS_PENALTY), 0)
    + cases[1].reduce((score, _) => score + (rgx.test(_) ? INCORRECTNESS_PENALTY : CORRECTNESS_BONUS), 0)
    + COMPLEXITY_PENALTY * getComplexity(regex)
  );
}

// regex: string => number
function getComplexity(regex) {
  return regex.length
}

// void => string
function getMutationType() {
  return MUTATION_TYPES[random(0, 3)];
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
for (let n = 0; n < 100; n++) {
  let regex2 = regex;
  for (let n = 0; n < 10; n++) {
    regex2 = evolveRegex(regex2);
    console.log(n, regex);
  }
  console.log('FITNESS', regex, '(' + getFitness(regex, cases) + ')', regex2, '(' + getFitness(regex2, cases) + ')')
  if (getFitness(regex2, cases) > getFitness(regex, cases)) {
    regex = regex2
  }
}



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