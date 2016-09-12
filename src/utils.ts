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