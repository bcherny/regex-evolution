const {compute, getFitness, getPercentCorrect} = require('./')

// const cases = [['00', '01', '10'], ['11']];
const cases = [
  ['bcherny@gmail.com', 'boris@performancejs.com', 'johnq@yahoo.com', 'john.brown@gmail.com', 'a.b.c@d.co'],
  ['foo', '123', 'bcherny.com', '@foo', '@foo.co', 'abcdefg', '-1@', '1.@a']
]

compute(cases).then(winner =>
  console.log(`
    BEST REGEX: "^${winner}$"
      fitness: ${getFitness(winner, cases)}
      correct: ${getPercentCorrect(winner, cases)}%
  `)
)