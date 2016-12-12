//////// tree

import { flatten } from 'lodash'

abstract class Tree<T> {
  constructor(public value?: T, public children?: Tree<T>[]) { }
  // static toArray<T>(tree: Tree<T>): T[] {
  //   return [tree.value].concat(tree.children ? flatten(tree.children.map(Tree.toArray)) : [])
  // }
  abstract toString(): string
  static toString<T>(tree: Tree<T>) {
    return tree.children.map(_ => _.toString()).join('')
  }
}

class Root<T> extends Tree<T> {
  toString() { return Tree.toString(this) }
}

class CharacterSet<T> extends Tree<T> {
  toString() { return '[' + Tree.toString(this) + ']' }
}

// characters

class Character<T extends string> extends Tree<T> {
  constructor(public value: T) {
    super(value)
  }
  toString() { return this.value }
}

class Boundary extends Character<'\b'> {}
class Digit extends Character<'\d'> {}
class Space extends Character<'\s'> {}
class Word extends Character<'\w'> {}

// quantifiers

class Quantifier<T extends string> extends Character<T> {}

class OneOrMore extends Quantifier<'+'> {}
class ZeroOrMore extends Quantifier<'*'> { }

//

type TreeNode<T extends string> = Boundary | Character<T> | CharacterSet<T> | Digit | Space | Word | OneOrMore | ZeroOrMore

//////// ast

enum MUTATION {
  ADDITION,
  DELETION,
  MUTATION,
  DUPLICATION
}

import { random } from 'lodash'

type ASTNode = TreeNode<string>

class AST extends Tree<ASTNode> {
  applyMutationToNode(node: ASTNode, mutation: MUTATION): ASTNode {
    switch (mutation) {
      case MUTATION.ADDITION: return node instanceof CharacterSet ?
      case MUTATION.DELETION: return node.parent.removeChild(node)
    }
  }
  getRandomMutation(): MUTATION {
    const roll = random(0, 100)
    if (roll < 13) return MUTATION.ADDITION
    if (roll < 30) return MUTATION.DELETION
    return MUTATION.MUTATION
  }
  getRefToRandomNode(): AST {}
  mutateNode() {
    const node = this.getRefToRandomNode()
    const mutation = this.getRandomMutation()
    this.applyMutationToNode(node, mutation)
  }
  toString() { return Tree.toString(this) }
}
