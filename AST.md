- RegExp `{ type: 'ROOT', children: [] }`
- `[]` CharacterSet `{ type: 'CHARACTER_SET', children: [...] }`
- Character
  - Literal `{ type: 'CHARACTER', value: '@' }`
  - `.` Any `{ type: 'CHARACTER', value: '.' }`
  - `\b` Boundary `{ type: 'CHARACTER', value: '\b' }`
  - `\d` Digit `{ type: 'CHARACTER', value: '\d' }`
  - `\s` Space `{ type: 'CHARACTER', value: '\s' }`
  - `\w` Word `{ type: 'CHARACTER', value: '\w' }`
- Quantifier
  - `+` OneOrMore `{ type: 'QUANTIFIER', value: '+' }`
  - `*` ZeroOrMore `{ type: 'QUANTIFIER', value: '*' }`