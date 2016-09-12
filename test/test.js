import test from 'ava'
import { compute } from '../dist/index'

// const cases = [
//   ['bcherny@gmail.com', 'boris@performancejs.com', 'johnq@yahoo.com', 'john.brown@gmail.com', 'a.b.c@d.co'],
//   ['foo', '123', 'bcherny.com', '@foo', '@foo.co', 'abcdefg', '-1@', '1.@a']
// ]

// const SUPPORTED_REGEX_OPERANDS = ['1', '0'] //['*', '.', '?', '\\b', '\\w', '@', '\\.'] // '+', '%', '$', '#', '!', '&', '\\s', '\\d'

const tests = [
  {
    alphabet: ['0', '1'],
    good: ['101010'],
    bad: ['111111', '000000']
  },
  {
    alphabet: ['0', '1'],
    good: ['111111'],
    bad: ['000000']
  },
  {
    alphabet: ['1', '2', '3', '4', '5', '6', 'a', 'b', 'c'],
    good: ['123456'],
    bad: ['abcdefg']
  },
  {
    alphabet: ['1', '2', '3', '4', '5', '6', 'a', 'b', 'c', '\\.'],
    good: ['abc.123'],
    bad: ['123.abc']
  },
  {
    alphabet: ['\w', '\d', '+', '*', '\\.', '@'],
    good: ['bcherny@gmail.com', 'boris@performancejs.com', 'johnq@yahoo.com', 'john.brown@gmail.com', 'a.b.c@d.co'],
    bad: []
  }
]

Promise.all(tests.map(async one =>
  test(`compute: ${one.good}`, async t =>
    compute(one).then(({fitnessScore, percentCorrect, regex}) => {
      console.log(`
        BEST REGEX: "${regex}"
          fitness: ${fitnessScore}
          correct: ${percentCorrect}%
      `)
      t.is(fitnessScore, Infinity)
    })
  )
))
