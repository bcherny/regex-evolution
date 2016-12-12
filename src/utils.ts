import { random } from 'lodash'

export function array(length: number): undefined[] {
  return Array.apply(null, { length })
}

export function async<T>(fn: () => T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(fn()), 0))
}

export function maybe<T>(fn: () => T): T | undefined {
  try { return fn() }
  catch (e) { return undefined }
}

export function insertAt<A>(array: A[], index: number, ...elements: A[]): A[] {
  if (index < 0) {
    // TODO: handle negative indices
    throw new RangeError('index must be > -1')
  }
  return array.slice(0, index).concat(elements).concat(array.slice(index))
}

export function randomMember<A>(array: A[]): A {
  return array[random(0, array.length - 1)]
}

export function swapAt<A>(array: A[], index: number, replacement: A): A[] {
  if (index < 0) {
    // TODO: handle negative indices
    throw new RangeError('index must be > -1')
  }
  return array.slice(0, index).concat([replacement]).concat(array.slice(index + 1))
}

export function withoutAt<A>(array: A[], ...indices: number[]): A[] {
  switch (indices.length) {
    case 0: return array
    default:
      const index = indices[0]
      if (index > array.length - 1) {
        throw new RangeError('index must be < array length')
      }
      if (index < 0) {
        throw new RangeError('index must be > -1')
      }
      return withoutAt(
        array.slice(0, index).concat(array.slice(index + 1)),
        ...indices.slice(1).map(_ => _ - 1)
      )
  }
}