const {compute, getFitness, getPercentCorrect} = require('./')

// const cases = [
//   ['bcherny@gmail.com', 'boris@performancejs.com', 'johnq@yahoo.com', 'john.brown@gmail.com', 'a.b.c@d.co'],
//   ['foo', '123', 'bcherny.com', '@foo', '@foo.co', 'abcdefg', '-1@', '1.@a']
// ]

const test = {
  alphabet: ['0', '1'],
  good: ['101010'],
  bad: ['111111', '000000']
}

compute(test).then(({fitnessScore, percentCorrect, regex}) =>
  console.log(`
    BEST REGEX: "${regex}"
      fitness: ${fitnessScore}
      correct: ${percentCorrect}%
  `)
)