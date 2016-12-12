
interface Char { type: 'CHAR', value: string }
interface Literal { type: 'LITERAL', value: string }
interface Any extends Char { value: '.' }
interface Boundary extends Char { value: '\b' }
interface Digit extends Char { value: '\d' }
interface Space extends Char { value: '\s' }
interface Word extends Char { value: '\w' }

interface Quantifier { type: 'QUANTIFIER', value: string }
interface OneOrMore { type: 'QUANTIFIER', value: '+' }
interface ZeroOrMore { type: 'QUANTIFIER', value: '*' }

interface CharSet { children: NonRootAST[], type: 'CHAR_SET' }
interface Root { children: NonRootAST[], type: 'ROOT' }

type NonRootAST = Any | Boundary | CharSet | Digit | Literal | OneOrMore | Space | Word | ZeroOrMore
type LeafAST = Any | Boundary | Digit | Literal | OneOrMore | Space | Word | ZeroOrMore
type ParentAST = CharSet | Root
type AST = NonRootAST | Root

type ASTType = 'CHAR' | 'CHAR_SET' | 'LITERAL' | 'QUANTIFIER'
const ASTTypes: ASTType[] = ['CHAR', 'CHAR_SET', 'LITERAL', 'QUANTIFIER']

type CharValue = '.' | '\b' | '\d' | '\s' | '\w'
const CharTypes: CharValue[] = ['.', '\b', '\d', '\s', '\w']

type SupportedLiteral = '.' | '@' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
const SupportedLiterals: SupportedLiteral[] = ['.', '@', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

type SupportedQuantifier = '+' | '*'
const SupportedQuantifiers: SupportedQuantifier[] = ['+', '*']

const example: Root = {
  type: 'ROOT',
  children: [
    { type: 'CHAR', value: '\w' },
    { type: 'QUANTIFIER', value: '+' },
    { type: 'LITERAL', value: '@' },
    { type: 'CHAR', value: '\w' },
    { type: 'QUANTIFIER', value: '+' },
    { type: 'LITERAL', value: '.' },
    { type: 'LITERAL', value: 'com' }
  ]
}

type MUTATION_TYPE = 'ADDITION' | 'DELETION' | 'DUPLICATION' | 'MUTATION'

import { random } from 'lodash'
import { insertAt, randomMember, swapAt, withoutAt } from './utils'

const AST = {
  mutate(node: ParentAST, type: MUTATION_TYPE): AST {
    const randomIndex = random(0, node.children.length - 1)
    switch (type) {
      case 'ADDITION': return AST.ops.insertChild(node, randomIndex, AST.ops.createRandomNode(node))
      case 'DELETION': return AST.ops.deleteChild(node, randomIndex)
      case 'DUPLICATION': return AST.ops.duplicateChild(node, randomIndex)
      case 'MUTATION': return AST.ops.mutateChild(node, randomIndex)
    }
  },
  ops: {
    createRandomNode(fromNode: ParentAST): NonRootAST {
      return AST.ops.createRandomNodeOfType(AST.random.type())
    },
    createRandomNodeOfType(type: ASTType): NonRootAST {
      return type === 'CHAR_SET'
        ? { type, children: [] }
        : { type, value: AST.random.value(type) } as LeafAST // TS :(
    },
    deleteChild(parentNode: ParentAST, index: number): ParentAST {
      return {
        children: withoutAt(parentNode.children, index),
        type: parentNode.type
      } as ParentAST // TS :(
    },
    duplicateChild(parentNode: ParentAST, index: number): ParentAST {
      return AST.ops.insertChild(parentNode, index, parentNode.children[index])
    },
    insertChild(parentNode: ParentAST, index: number, node: NonRootAST): ParentAST {
      return {
        children: insertAt(parentNode.children, index, node),
        type: parentNode.type
      } as ParentAST // TS :(
    },
    mutateChild(parentNode: ParentAST, index: number): ParentAST {
      return {
        children: swapAt(parentNode.children, index, AST.ops.createRandomNodeOfType(parentNode.children[index].type)),
        type: parentNode.type
      } as ParentAST // TS :(
    }
  },
  random: {
    type(): ASTType { return randomMember(ASTTypes) },
    value(type: 'CHAR' | 'LITERAL' | 'QUANTIFIER') {
      switch (type) {
        case 'CHAR': return randomMember(CharTypes)
        case 'LITERAL': return randomMember(SupportedLiterals)
        case 'QUANTIFIER': return randomMember(SupportedQuantifiers)
      }
    }
  },
  toRegExp(ast: AST): RegExp {
    return new RegExp(AST.toString(ast))
  },
  toString(ast: AST): string {
    switch (ast.type) {
      case 'CHAR': return ast.value
      case 'CHAR_SET': return '[' + ast.children.map(AST.toString).join('') + ']'
      case 'LITERAL': return '\\' + ast.value.split('').join('\\')
      case 'QUANTIFIER': return ast.value
      case 'ROOT': return ast.children.map(AST.toString).join('')
    }
  }
}
