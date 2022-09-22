/**
 * Data structure which represents non-empty readonly arrays.
 *
 * ```ts
 * export type ReadonlyNonEmptyArray<A> = ReadonlyArray<A> & {
 *   readonly 0: A
 * }
 * ```
 *
 * Note that you don't need any conversion, a `ReadonlyNonEmptyArray` is a `ReadonlyArray`,
 * so all `ReadonlyArray`'s APIs can be used with a `ReadonlyNonEmptyArray` without further ado.
 *
 * @since 3.0.0
 */
import type * as semigroupK from './SemigroupK'
import * as apply from './Apply'
import type * as applicative from './Applicative'
import * as flat from './Flat'
import type * as comonad from './Comonad'
import type { Endomorphism } from './Endomorphism'
import * as eq from './Eq'
import type * as foldable from './Foldable'
import type * as foldableWithIndex from './FoldableWithIndex'
import type { LazyArg } from './function'
import { flow, identity, pipe } from './function'
import * as functor from './Functor'
import type * as functorWithIndex from './FunctorWithIndex'
import type { HKT, Kind } from './HKT'
import * as _ from './internal'
import type * as monad from './Monad'
import type { Option } from './Option'
import * as ord from './Ord'
import type * as pointed from './Pointed'
import type { ReadonlyRecord } from './ReadonlyRecord'
import * as semigroup from './Semigroup'
import type { Show } from './Show'
import type * as traversable from './Traversable'
import type * as traversableWithIndex from './TraversableWithIndex'
import * as tuple from './tuple'
import type { Eq } from './Eq'
import type { Ord } from './Ord'
import type { Semigroup } from './Semigroup'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 3.0.0
 */
export type ReadonlyNonEmptyArray<A> = ReadonlyArray<A> & {
  readonly 0: A
}

// -------------------------------------------------------------------------------------
// internal
// -------------------------------------------------------------------------------------

/**
 * @internal
 */
export const prepend =
  <B>(head: B) =>
  <A>(tail: ReadonlyArray<A>): ReadonlyNonEmptyArray<A | B> =>
    [head, ...tail]

/**
 * @internal
 */
export const append =
  <B>(end: B) =>
  <A>(init: ReadonlyArray<A>): ReadonlyNonEmptyArray<A | B> =>
    concat([end])(init)

/**
 * @internal
 */
export const isNonEmpty: <A>(as: ReadonlyArray<A>) => as is ReadonlyNonEmptyArray<A> = _.isNonEmpty

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * Builds a `ReadonlyNonEmptyArray` from an array returning `none` if `as` is an empty array.
 *
 * @category constructors
 * @since 3.0.0
 */
export const fromReadonlyArray = <A>(as: ReadonlyArray<A>): Option<ReadonlyNonEmptyArray<A>> =>
  isNonEmpty(as) ? _.some(as) : _.none

/**
 * Return a `ReadonlyNonEmptyArray` of length `n` with element `i` initialized with `f(i)`.
 *
 * **Note**. `n` is normalized to a natural number.
 *
 * @example
 * import { makeBy } from 'fp-ts/ReadonlyNonEmptyArray'
 * import { pipe } from 'fp-ts/function'
 *
 * const double = (n: number): number => n * 2
 * assert.deepStrictEqual(pipe(5, makeBy(double)), [0, 2, 4, 6, 8])
 *
 * @category constructors
 * @since 3.0.0
 */
export const makeBy =
  <A>(f: (i: number) => A) =>
  (n: number): ReadonlyNonEmptyArray<A> => {
    const j = Math.max(0, Math.floor(n))
    const out: _.NonEmptyArray<A> = [f(0)]
    for (let i = 1; i < j; i++) {
      out.push(f(i))
    }
    return out
  }

/**
 * Create a `ReadonlyNonEmptyArray` containing a value repeated the specified number of times.
 *
 * **Note**. `n` is normalized to a natural number.
 *
 * @example
 * import { replicate } from 'fp-ts/ReadonlyNonEmptyArray'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe(3, replicate('a')), ['a', 'a', 'a'])
 *
 * @category constructors
 * @since 3.0.0
 */
export const replicate = <A>(a: A): ((n: number) => ReadonlyNonEmptyArray<A>) => makeBy(() => a)

/**
 * Create a `ReadonlyNonEmptyArray` containing a range of integers, including both endpoints.
 *
 * @example
 * import { range } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(range(1, 5), [1, 2, 3, 4, 5])
 *
 * @category constructors
 * @since 3.0.0
 */
export const range = (start: number, end: number): ReadonlyNonEmptyArray<number> =>
  start <= end ? makeBy((i) => start + i)(end - start + 1) : [start]

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * Produces a couple of the first element of the array, and a new array of the remaining elements, if any.
 *
 * @example
 * import { unprepend } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(unprepend([1, 2, 3, 4]), [1, [2, 3, 4]])
 *
 * @category destructors
 * @since 3.0.0
 */
export const unprepend = <A>(as: ReadonlyNonEmptyArray<A>): readonly [A, ReadonlyArray<A>] => [head(as), tail(as)]

/**
 * Produces a couple of a copy of the array without its last element, and that last element.
 *
 * @example
 * import { unappend } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(unappend([1, 2, 3, 4]), [[1, 2, 3], 4])
 *
 * @category destructors
 * @since 3.0.0
 */
export const unappend = <A>(as: ReadonlyNonEmptyArray<A>): readonly [ReadonlyArray<A>, A] => [init(as), last(as)]

/**
 * Break a `ReadonlyArray` into its first element and remaining elements.
 *
 * @category destructors
 * @since 3.0.0
 */
export const matchLeft =
  <A, B>(f: (head: A, tail: ReadonlyArray<A>) => B) =>
  (as: ReadonlyNonEmptyArray<A>): B =>
    f(head(as), tail(as))

/**
 * Break a `ReadonlyArray` into its initial elements and the last element.
 *
 * @category destructors
 * @since 3.0.0
 */
export const matchRight =
  <A, B>(f: (init: ReadonlyArray<A>, last: A) => B) =>
  (as: ReadonlyNonEmptyArray<A>): B =>
    f(init(as), last(as))

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 3.0.0
 */
export function concat<B>(second: ReadonlyNonEmptyArray<B>): <A>(self: ReadonlyArray<A>) => ReadonlyNonEmptyArray<A | B>
export function concat<B>(second: ReadonlyArray<B>): <A>(self: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A | B>
export function concat<B>(second: ReadonlyArray<B>): <A>(self: ReadonlyNonEmptyArray<A>) => ReadonlyArray<A | B> {
  return <A>(self: ReadonlyNonEmptyArray<A | B>) => self.concat(second)
}

/**
 * Remove duplicates from a `ReadonlyNonEmptyArray`, keeping the first occurrence of an element.
 *
 * @example
 * import { uniq } from 'fp-ts/ReadonlyNonEmptyArray'
 * import * as N from 'fp-ts/number'
 *
 * assert.deepStrictEqual(uniq(N.Eq)([1, 2, 1]), [1, 2])
 *
 * @category combinators
 * @since 3.0.0
 */
export const uniq =
  <A>(E: Eq<A>) =>
  (as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<A> => {
    if (as.length === 1) {
      return as
    }
    const out: _.NonEmptyArray<A> = [head(as)]
    const rest = tail(as)
    for (const a of rest) {
      if (out.every((o) => !E.equals(o)(a))) {
        out.push(a)
      }
    }
    return out
  }

/**
 * Sort the elements of a `ReadonlyNonEmptyArray` in increasing order, where elements are compared using first `ords[0]`, then `ords[1]`,
 * etc...
 *
 * @example
 * import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
 * import { contramap } from 'fp-ts/Ord'
 * import * as S from 'fp-ts/string'
 * import * as N from 'fp-ts/number'
 * import { pipe } from 'fp-ts/function'
 *
 * interface Person {
 *   name: string
 *   age: number
 * }
 *
 * const byName = pipe(S.Ord, contramap((p: Person) => p.name))
 *
 * const byAge = pipe(N.Ord, contramap((p: Person) => p.age))
 *
 * const sortByNameByAge = RNEA.sortBy([byName, byAge])
 *
 * const persons: RNEA.ReadonlyNonEmptyArray<Person> = [
 *   { name: 'a', age: 1 },
 *   { name: 'b', age: 3 },
 *   { name: 'c', age: 2 },
 *   { name: 'b', age: 2 }
 * ]
 *
 * assert.deepStrictEqual(sortByNameByAge(persons), [
 *   { name: 'a', age: 1 },
 *   { name: 'b', age: 2 },
 *   { name: 'b', age: 3 },
 *   { name: 'c', age: 2 }
 * ])
 *
 * @category combinators
 * @since 3.0.0
 */
export const sortBy = <B>(
  ords: ReadonlyArray<Ord<B>>
): (<A extends B>(as: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A>) => {
  if (isNonEmpty(ords)) {
    const M = ord.getMonoid<B>()
    return sort(ords.reduce((a, acc) => M.combine(acc)(a), M.empty))
  }
  return identity
}

/**
 * Creates a `ReadonlyArray` of unique values, in order, from all given `ReadonlyArray`s using a `Eq` for equality comparisons.
 *
 * @example
 * import { union } from 'fp-ts/ReadonlyArray'
 * import * as N from 'fp-ts/number'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe([1, 2], union(N.Eq)([2, 3])), [1, 2, 3])
 *
 * @category combinators
 * @since 3.0.0
 */
export const union = <A>(E: Eq<A>): Semigroup<ReadonlyNonEmptyArray<A>>['combine'] => {
  const uniqE = uniq(E)
  return (second) => (first) => uniqE(concat(second)(first))
}

/**
 * Rotate a `ReadonlyNonEmptyArray` by `n` steps.
 *
 * @example
 * import { rotate } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(rotate(2)([1, 2, 3, 4, 5]), [4, 5, 1, 2, 3])
 * assert.deepStrictEqual(rotate(-2)([1, 2, 3, 4, 5]), [3, 4, 5, 1, 2])
 *
 * @category combinators
 * @since 3.0.0
 */
export const rotate =
  (n: number) =>
  <A>(as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<A> => {
    const len = as.length
    const m = Math.round(n) % len
    if (isOutOfBound(Math.abs(m), as) || m === 0) {
      return as
    }
    if (m < 0) {
      const [f, s] = splitAt(-m)(as)
      return concat(f)(s)
    } else {
      return rotate(m - len)(as)
    }
  }

/**
 * Apply a function to the head, creating a new `ReadonlyNonEmptyArray`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const modifyHead =
  <A>(f: Endomorphism<A>) =>
  (as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<A> =>
    [f(head(as)), ...tail(as)]

/**
 * Change the head, creating a new `ReadonlyNonEmptyArray`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const updateHead = <A>(a: A): ((as: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A>) => modifyHead(() => a)

/**
 * Apply a function to the last element, creating a new `ReadonlyNonEmptyArray`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const modifyLast =
  <A>(f: Endomorphism<A>) =>
  (as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<A> =>
    pipe(init(as), append(f(last(as))))

/**
 * Change the last element, creating a new `ReadonlyNonEmptyArray`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const updateLast = <A>(a: A): ((as: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A>) => modifyLast(() => a)

/**
 * Places an element in between members of a `ReadonlyNonEmptyArray`, then folds the results using the provided `Semigroup`.
 *
 * @example
 * import * as S from 'fp-ts/string'
 * import { intercalate } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(intercalate(S.Semigroup)('-')(['a', 'b', 'c']), 'a-b-c')
 *
 * @since 3.0.0
 */
export const intercalate = <A>(S: Semigroup<A>): ((middle: A) => (as: ReadonlyNonEmptyArray<A>) => A) => {
  const combineAllS = combineAll(S)
  return (middle) => flow(intersperse(middle), combineAllS)
}

/**
 * `ReadonlyNonEmptyArray` comprehension.
 *
 * ```
 * [ f(x, y, ...) | x ← xs, y ← ys, ... ]
 * ```
 *
 * @example
 * import { comprehension } from 'fp-ts/ReadonlyNonEmptyArray'
 * import { tuple } from 'fp-ts/tuple'
 *
 * assert.deepStrictEqual(comprehension([[1, 2, 3], ['a', 'b']], tuple), [
 *   [1, 'a'],
 *   [1, 'b'],
 *   [2, 'a'],
 *   [2, 'b'],
 *   [3, 'a'],
 *   [3, 'b']
 * ])
 *
 * @category combinators
 * @since 3.0.0
 */
export function comprehension<A, B, C, D, R>(
  input: readonly [
    ReadonlyNonEmptyArray<A>,
    ReadonlyNonEmptyArray<B>,
    ReadonlyNonEmptyArray<C>,
    ReadonlyNonEmptyArray<D>
  ],
  f: (a: A, b: B, c: C, d: D) => R
): ReadonlyNonEmptyArray<R>
export function comprehension<A, B, C, R>(
  input: readonly [ReadonlyNonEmptyArray<A>, ReadonlyNonEmptyArray<B>, ReadonlyNonEmptyArray<C>],
  f: (a: A, b: B, c: C) => R
): ReadonlyNonEmptyArray<R>
export function comprehension<A, B, R>(
  input: readonly [ReadonlyNonEmptyArray<A>, ReadonlyNonEmptyArray<B>],
  f: (a: A, b: B) => R
): ReadonlyNonEmptyArray<R>
export function comprehension<A, R>(
  input: readonly [ReadonlyNonEmptyArray<A>],
  f: (a: A) => R
): ReadonlyNonEmptyArray<R>
export function comprehension<A, R>(
  input: ReadonlyNonEmptyArray<ReadonlyNonEmptyArray<A>>,
  f: (...as: ReadonlyArray<A>) => R
): ReadonlyNonEmptyArray<R> {
  const go = (as: ReadonlyArray<A>, input: ReadonlyArray<ReadonlyNonEmptyArray<A>>): ReadonlyNonEmptyArray<R> =>
    isNonEmpty(input)
      ? pipe(
          head(input),
          flatMap((head) => go(append(head)(as), tail(input)))
        )
      : [f(...as)]
  return go(_.emptyReadonlyArray, input)
}

/**
 * @category combinators
 * @since 3.0.0
 */
export const reverse = <A>(as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<A> =>
  as.length === 1 ? as : [last(as), ...as.slice(0, -1).reverse()]

/**
 * Group equal, consecutive elements of an array into non empty arrays.
 *
 * @example
 * import { group } from 'fp-ts/ReadonlyNonEmptyArray'
 * import * as N from 'fp-ts/number'
 *
 * assert.deepStrictEqual(group(N.Eq)([1, 2, 1, 1]), [
 *   [1],
 *   [2],
 *   [1, 1]
 * ])
 *
 * @category combinators
 * @since 3.0.0
 */
export const group =
  <B>(E: Eq<B>) =>
  <A extends B>(as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<ReadonlyNonEmptyArray<A>> =>
    pipe(
      as,
      chop((as) => {
        const h = head(as)
        const out: _.NonEmptyArray<A> = [h]
        let i = 1
        for (; i < as.length; i++) {
          const a = as[i]
          if (E.equals(h)(a)) {
            out.push(a)
          } else {
            break
          }
        }
        return [out, as.slice(i)]
      })
    )

/**
 * Splits an array into sub-non-empty-arrays stored in an object, based on the result of calling a `string`-returning
 * function on each element, and grouping the results according to values returned
 *
 * @example
 * import { groupBy } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(groupBy((s: string) => String(s.length))(['foo', 'bar', 'foobar']), {
 *   '3': ['foo', 'bar'],
 *   '6': ['foobar']
 * })
 *
 * @category combinators
 * @since 3.0.0
 */
export const groupBy =
  <A>(f: (a: A) => string) =>
  (as: ReadonlyArray<A>): ReadonlyRecord<string, ReadonlyNonEmptyArray<A>> => {
    const out: Record<string, _.NonEmptyArray<A>> = {}
    for (const a of as) {
      const k = f(a)
      if (_.has.call(out, k)) {
        out[k].push(a)
      } else {
        out[k] = [a]
      }
    }
    return out
  }

/**
 * Sort the elements of a `ReadonlyNonEmptyArray` in increasing order, creating a new `ReadonlyNonEmptyArray`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const sort =
  <B>(O: Ord<B>) =>
  <A extends B>(as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<A> =>
    as.length === 1 ? as : (as.slice().sort((first, second) => O.compare(second)(first)) as any)

/**
 * @internal
 */
export const isOutOfBound = <A>(i: number, as: ReadonlyArray<A>): boolean => i < 0 || i >= as.length

/**
 * Change the element at the specified index, creating a new `ReadonlyNonEmptyArray`, or returning `None` if the index is out of bounds.
 *
 * @since 3.0.0
 */
export const updateAt = <A>(i: number, a: A): ((as: ReadonlyNonEmptyArray<A>) => Option<ReadonlyNonEmptyArray<A>>) =>
  modifyAt(i, () => a)

/**
 * Apply a function to the element at the specified index, creating a new `ReadonlyNonEmptyArray`, or returning `None` if the index is out
 * of bounds.
 *
 * @since 3.0.0
 */
export const modifyAt =
  <A>(i: number, f: (a: A) => A) =>
  (as: ReadonlyNonEmptyArray<A>): Option<ReadonlyNonEmptyArray<A>> => {
    if (isOutOfBound(i, as)) {
      return _.none
    }
    const prev = as[i]
    const next = f(prev)
    if (next === prev) {
      return _.some(as)
    }
    const out = _.fromReadonlyNonEmptyArray(as)
    out[i] = next
    return _.some(out)
  }

/**
 * @category combinators
 * @since 3.0.0
 */
export const zipWith =
  <B, A, C>(bs: ReadonlyNonEmptyArray<B>, f: (a: A, b: B) => C) =>
  (as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<C> => {
    const cs: _.NonEmptyArray<C> = [f(head(as), head(bs))]
    const len = Math.min(as.length, bs.length)
    for (let i = 1; i < len; i++) {
      cs[i] = f(as[i], bs[i])
    }
    return cs
  }

/**
 * @category combinators
 * @since 3.0.0
 */
export const zip =
  <B>(bs: ReadonlyNonEmptyArray<B>) =>
  <A>(as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<readonly [A, B]> =>
    pipe(as, zipWith(bs, tuple.tuple))

/**
 * @since 3.0.0
 */
export const unzip = <A, B>(
  abs: ReadonlyNonEmptyArray<readonly [A, B]>
): readonly [ReadonlyNonEmptyArray<A>, ReadonlyNonEmptyArray<B>] => {
  const fa: _.NonEmptyArray<A> = [abs[0][0]]
  const fb: _.NonEmptyArray<B> = [abs[0][1]]
  for (let i = 1; i < abs.length; i++) {
    fa[i] = abs[i][0]
    fb[i] = abs[i][1]
  }
  return [fa, fb]
}

/**
 * Prepend an element to every member of an array
 *
 * @example
 * import { prependAll } from 'fp-ts/ReadonlyNonEmptyArray'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe([1, 2, 3, 4], prependAll(9)), [9, 1, 9, 2, 9, 3, 9, 4])
 *
 * @category combinators
 * @since 3.0.0
 */
export const prependAll =
  <A>(middle: A) =>
  (as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<A> => {
    const out: _.NonEmptyArray<A> = [middle, head(as)]
    for (let i = 1; i < as.length; i++) {
      out.push(middle, as[i])
    }
    return out
  }

/**
 * Places an element in between members of an array
 *
 * @example
 * import { intersperse } from 'fp-ts/ReadonlyNonEmptyArray'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe([1, 2, 3, 4], intersperse(9)), [1, 9, 2, 9, 3, 9, 4])
 *
 * @category combinators
 * @since 3.0.0
 */
export const intersperse =
  <A>(middle: A) =>
  (as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<A> => {
    const rest = tail(as)
    return isNonEmpty(rest) ? prepend(head(as))(prependAll(middle)(rest)) : as
  }

/**
 * @category combinators
 * @since 3.0.0
 */
export const flatMapWithIndex =
  <A, B>(f: (i: number, a: A) => ReadonlyNonEmptyArray<B>) =>
  (as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<B> => {
    const out: _.NonEmptyArray<B> = _.fromReadonlyNonEmptyArray(f(0, head(as)))
    for (let i = 1; i < as.length; i++) {
      out.push(...f(i, as[i]))
    }
    return out
  }

/**
 * A useful recursion pattern for processing a `ReadonlyNonEmptyArray` to produce a new `ReadonlyNonEmptyArray`, often used for "chopping" up the input
 * `ReadonlyNonEmptyArray`. Typically `chop` is called with some function that will consume an initial prefix of the `ReadonlyNonEmptyArray` and produce a
 * value and the tail of the `ReadonlyNonEmptyArray`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const chop =
  <A, B>(f: (as: ReadonlyNonEmptyArray<A>) => readonly [B, ReadonlyArray<A>]) =>
  (as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<B> => {
    const [b, rest] = f(as)
    const out: _.NonEmptyArray<B> = [b]
    let next: ReadonlyArray<A> = rest
    while (isNonEmpty(next)) {
      const [b, rest] = f(next)
      out.push(b)
      next = rest
    }
    return out
  }

/**
 * Splits a `ReadonlyNonEmptyArray` into two pieces, the first piece has max `n` elements.
 *
 * @category combinators
 * @since 3.0.0
 */
export const splitAt =
  (n: number) =>
  <A>(as: ReadonlyNonEmptyArray<A>): readonly [ReadonlyNonEmptyArray<A>, ReadonlyArray<A>] => {
    const m = Math.max(1, n)
    return m >= as.length ? [as, _.emptyReadonlyArray] : [pipe(as.slice(1, m), prepend(head(as))), as.slice(m)]
  }

/**
 * Splits a `ReadonlyNonEmptyArray` into length-`n` pieces. The last piece will be shorter if `n` does not evenly divide the length of
 * the `ReadonlyNonEmptyArray`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const chunksOf = (
  n: number
): (<A>(as: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<ReadonlyNonEmptyArray<A>>) => chop(splitAt(n))

/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * In case of `ReadonlyNonEmptyArray` concatenates the inputs into a single array.
 *
 * @example
 * import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     [1, 2, 3] as const,
 *     RNEA.combineK(() => [4, 5])
 *   ),
 *   [1, 2, 3, 4, 5]
 * )
 *
 * @category SemigroupK
 * @since 3.0.2
 */
export const combineK = <B>(
  second: LazyArg<ReadonlyNonEmptyArray<B>>
): (<A>(self: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A | B>) => concat(second())

/**
 * @category Apply
 * @since 3.0.0
 */
export const ap: <A>(
  fa: ReadonlyNonEmptyArray<A>
) => <B>(fab: ReadonlyNonEmptyArray<(a: A) => B>) => ReadonlyNonEmptyArray<B> = (fa) => flatMap((f) => pipe(fa, map(f)))

/**
 * @category Pointed
 * @since 3.0.0
 */
export const of: <A>(a: A) => ReadonlyNonEmptyArray<A> = _.singleton

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @example
 * import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     [1, 2, 3],
 *     RNEA.flatMap((n) => [`a${n}`, `b${n}`])
 *   ),
 *   ['a1', 'b1', 'a2', 'b2', 'a3', 'b3']
 * )
 *
 * @category Flat
 * @since 3.0.0
 */
export const flatMap: <A, B>(
  f: (a: A) => ReadonlyNonEmptyArray<B>
) => (ma: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<B> = (f) => flatMapWithIndex((_, a) => f(a))

/**
 * @category Extendable
 * @since 3.0.0
 */
export const extend =
  <A, B>(f: (as: ReadonlyNonEmptyArray<A>) => B) =>
  (as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<B> => {
    let next: ReadonlyArray<A> = tail(as)
    const out: _.NonEmptyArray<B> = [f(as)]
    while (isNonEmpty(next)) {
      out.push(f(next))
      next = tail(next)
    }
    return out
  }

/**
 * Derivable from `Extendable`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const duplicate: <A>(ma: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<ReadonlyNonEmptyArray<A>> =
  /*#__PURE__*/ extend(identity)

/**
 * Derivable from `Flat`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const flatten: <A>(mma: ReadonlyNonEmptyArray<ReadonlyNonEmptyArray<A>>) => ReadonlyNonEmptyArray<A> =
  /*#__PURE__*/ flatMap(identity)

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 3.0.0
 */
export const map: <A, B>(f: (a: A) => B) => (fa: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<B> = (f) =>
  mapWithIndex((_, a) => f(a))

/**
 * @category FunctorWithIndex
 * @since 3.0.0
 */
export const mapWithIndex: <A, B>(
  f: (i: number, a: A) => B
) => (fa: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<B> =
  <A, B>(f: (i: number, a: A) => B) =>
  (as: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<B> => {
    const out: _.NonEmptyArray<B> = [f(0, head(as))]
    for (let i = 1; i < as.length; i++) {
      out.push(f(i, as[i]))
    }
    return out
  }

/**
 * @category Foldable
 * @since 3.0.0
 */
export const reduce: <B, A>(b: B, f: (b: B, a: A) => B) => (fa: ReadonlyNonEmptyArray<A>) => B = (b, f) =>
  reduceWithIndex(b, (_, b, a) => f(b, a))

/**
 * **Note**. The constraint is relaxed: a `Semigroup` instead of a `Monoid`.
 *
 * @category Foldable
 * @since 3.0.0
 */
export const foldMap =
  <S>(S: Semigroup<S>) =>
  <A>(f: (a: A) => S) =>
  (fa: ReadonlyNonEmptyArray<A>): S =>
    fa.slice(1).reduce((s, a) => S.combine(f(a))(s), f(fa[0]))

/**
 * @category FoldableWithIndex
 * @since 3.0.0
 */
export const reduceWithIndex: <B, A>(b: B, f: (i: number, b: B, a: A) => B) => (fa: ReadonlyNonEmptyArray<A>) => B =
  (b, f) => (as) =>
    as.reduce((b, a, i) => f(i, b, a), b)

/**
 * **Note**. The constraint is relaxed: a `Semigroup` instead of a `Monoid`.
 *
 * @category FoldableWithIndex
 * @since 3.0.0
 */
export const foldMapWithIndex =
  <S>(S: Semigroup<S>) =>
  <A>(f: (i: number, a: A) => S) =>
  (fa: ReadonlyNonEmptyArray<A>): S =>
    fa.slice(1).reduce((s, a, i) => S.combine(f(i + 1, a))(s), f(0, fa[0]))

/**
 * @category Foldable
 * @since 3.0.0
 */
export const reduceRight: <B, A>(b: B, f: (a: A, b: B) => B) => (fa: ReadonlyNonEmptyArray<A>) => B = (b, f) =>
  reduceRightWithIndex(b, (_, b, a) => f(b, a))

/**
 * @category FoldableWithIndex
 * @since 3.0.0
 */
export const reduceRightWithIndex: <B, A>(
  b: B,
  f: (i: number, a: A, b: B) => B
) => (fa: ReadonlyNonEmptyArray<A>) => B = (b, f) => (as) => as.reduceRight((b, a, i) => f(i, a, b), b)

/**
 * @category Traversable
 * @since 3.0.0
 */
export const traverse: <F extends HKT>(
  F: apply.Apply<F>
) => <A, S, R, W, E, B>(
  f: (a: A) => Kind<F, S, R, W, E, B>
) => (ta: ReadonlyNonEmptyArray<A>) => Kind<F, S, R, W, E, ReadonlyNonEmptyArray<B>> = (F) => {
  const traverseWithIndexF = traverseWithIndex(F)
  return (f) => traverseWithIndexF((_, a) => f(a))
}

/**
 * @since 3.0.0
 */
export const sequence: <F extends HKT>(
  F: apply.Apply<F>
) => <S, R, W, E, A>(
  fas: ReadonlyNonEmptyArray<Kind<F, S, R, W, E, A>>
) => Kind<F, S, R, W, E, ReadonlyNonEmptyArray<A>> = (F) => traverse(F)(identity)

/**
 * @since 3.0.0
 */
export const traverseWithIndex =
  <F extends HKT>(F: apply.Apply<F>) =>
  <A, S, R, W, E, B>(f: (i: number, a: A) => Kind<F, S, R, W, E, B>) =>
  (as: ReadonlyNonEmptyArray<A>): Kind<F, S, R, W, E, ReadonlyNonEmptyArray<B>> => {
    let out = pipe(f(0, head(as)), F.map(of))
    for (let i = 1; i < as.length; i++) {
      out = pipe(
        out,
        F.map((bs) => (b: B) => pipe(bs, append(b))),
        F.ap(f(i, as[i]))
      )
    }
    return out
  }

/**
 * @since 3.0.0
 */
export const extract: <A>(wa: ReadonlyNonEmptyArray<A>) => A = _.head

// -------------------------------------------------------------------------------------
// HKT
// -------------------------------------------------------------------------------------

/**
 * @category HKT
 * @since 3.0.0
 */
export interface ReadonlyNonEmptyArrayF extends HKT {
  readonly type: ReadonlyNonEmptyArray<this['Covariant1']>
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const getShow = <A>(S: Show<A>): Show<ReadonlyNonEmptyArray<A>> => ({
  show: (as) => `[${as.map(S.show).join(', ')}]`
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getSemigroup = <A = never>(): Semigroup<ReadonlyNonEmptyArray<A>> => ({
  combine: concat
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getEq = <A>(E: Eq<A>): Eq<ReadonlyNonEmptyArray<A>> =>
  eq.fromEquals((second) => (first) => first.length === second.length && first.every((a, i) => E.equals(second[i])(a)))

/**
 * @category combinators
 * @since 3.0.0
 */
export const getUnionSemigroup = <A>(E: Eq<A>): Semigroup<ReadonlyNonEmptyArray<A>> => ({
  combine: union(E)
})

/**
 * @category instances
 * @since 3.0.0
 */
export const Functor: functor.Functor<ReadonlyNonEmptyArrayF> = {
  map
}

/**
 * Derivable from `Functor`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const flap: <A>(a: A) => <B>(fab: ReadonlyNonEmptyArray<(a: A) => B>) => ReadonlyNonEmptyArray<B> =
  /*#__PURE__*/ functor.flap(Functor)

/**
 * @category instances
 * @since 3.0.0
 */
export const Pointed: pointed.Pointed<ReadonlyNonEmptyArrayF> = {
  of
}

/**
 * @category instances
 * @since 3.0.0
 */
export const FunctorWithIndex: functorWithIndex.FunctorWithIndex<ReadonlyNonEmptyArrayF, number> = {
  mapWithIndex
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Apply: apply.Apply<ReadonlyNonEmptyArrayF> = {
  map,
  ap
}

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category combinators
 * @since 3.0.0
 */
export const zipLeftPar: <B>(
  second: ReadonlyNonEmptyArray<B>
) => <A>(self: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A> = /*#__PURE__*/ apply.zipLeftPar(Apply)

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category combinators
 * @since 3.0.0
 */
export const zipRightPar: <B>(
  second: ReadonlyNonEmptyArray<B>
) => <A>(self: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<B> = /*#__PURE__*/ apply.zipRightPar(Apply)

/**
 * @category instances
 * @since 3.0.0
 */
export const Applicative: applicative.Applicative<ReadonlyNonEmptyArrayF> = {
  map,
  ap,
  of
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Flat: flat.Flat<ReadonlyNonEmptyArrayF> = {
  map,
  flatMap
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Monad: monad.Monad<ReadonlyNonEmptyArrayF> = {
  map,
  of,
  flatMap
}

/**
 * Returns an effect that effectfully "peeks" at the success of this effect.
 *
 * @example
 * import * as RA from 'fp-ts/ReadonlyArray'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     [1, 2, 3],
 *     RA.tap(() => ['a', 'b'])
 *   ),
 *   [1, 1, 2, 2, 3, 3]
 * )
 *
 * @category combinators
 * @since 3.0.0
 */
export const tap: <A, _>(
  f: (a: A) => ReadonlyNonEmptyArray<_>
) => (self: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<A> = /*#__PURE__*/ flat.tap(Flat)

/**
 * @category instances
 * @since 3.0.0
 */
export const Foldable: foldable.Foldable<ReadonlyNonEmptyArrayF> = {
  reduce,
  foldMap,
  reduceRight
}

/**
 * @category instances
 * @since 3.0.0
 */
export const FoldableWithIndex: foldableWithIndex.FoldableWithIndex<ReadonlyNonEmptyArrayF, number> = {
  reduceWithIndex,
  foldMapWithIndex,
  reduceRightWithIndex
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Traversable: traversable.Traversable<ReadonlyNonEmptyArrayF> = {
  traverse
}

/**
 * @category instances
 * @since 3.0.0
 */
export const TraversableWithIndex: traversableWithIndex.TraversableWithIndex<ReadonlyNonEmptyArrayF, number> = {
  traverseWithIndex
}

/**
 * @category instances
 * @since 3.0.0
 */
export const SemigroupK: semigroupK.SemigroupK<ReadonlyNonEmptyArrayF> = {
  combineK
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Comonad: comonad.Comonad<ReadonlyNonEmptyArrayF> = {
  map,
  extend,
  extract
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const Do: ReadonlyNonEmptyArray<{}> =
  /*#__PURE__*/
  of(_.emptyRecord)

/**
 * @since 3.0.0
 */
export const bindTo: <N extends string>(
  name: N
) => <A>(fa: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<{ readonly [K in N]: A }> =
  /*#__PURE__*/ functor.bindTo(Functor)

/**
 * @since 3.0.0
 */
export const bind: <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => ReadonlyNonEmptyArray<B>
) => (
  ma: ReadonlyNonEmptyArray<A>
) => ReadonlyNonEmptyArray<{ readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/ flat.bind(Flat)

// -------------------------------------------------------------------------------------
// sequence S
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const apS: <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  fb: ReadonlyNonEmptyArray<B>
) => (
  fa: ReadonlyNonEmptyArray<A>
) => ReadonlyNonEmptyArray<{ readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/ apply.apS(Apply)

// -------------------------------------------------------------------------------------
// sequence T
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const ApT: ReadonlyNonEmptyArray<readonly []> = /*#__PURE__*/ of(_.emptyReadonlyArray)

/**
 * @since 3.0.0
 */
export const tupled: <A>(fa: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<readonly [A]> =
  /*#__PURE__*/ functor.tupled(Functor)

/**
 * @since 3.0.0
 */
export const apT: <B>(
  fb: ReadonlyNonEmptyArray<B>
) => <A extends ReadonlyArray<unknown>>(fas: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<readonly [...A, B]> =
  /*#__PURE__*/ apply.apT(Apply)

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const head: <A>(as: ReadonlyNonEmptyArray<A>) => A = extract

/**
 * @since 3.0.0
 */
export const tail: <A>(as: ReadonlyNonEmptyArray<A>) => ReadonlyArray<A> = _.tail

/**
 * @since 3.0.0
 */
export const last = <A>(as: ReadonlyNonEmptyArray<A>): A => as[as.length - 1]

/**
 * Get all but the last element of a non empty array, creating a new array.
 *
 * @example
 * import { init } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(init([1, 2, 3]), [1, 2])
 * assert.deepStrictEqual(init([1]), [])
 *
 * @since 3.0.0
 */
export const init = <A>(as: ReadonlyNonEmptyArray<A>): ReadonlyArray<A> => as.slice(0, -1)

/**
 * @since 3.0.0
 */
export const min = <A>(O: Ord<A>): ((as: ReadonlyNonEmptyArray<A>) => A) => {
  const S = semigroup.min(O)
  return (nea) => nea.reduce((a, acc) => S.combine(acc)(a))
}

/**
 * @since 3.0.0
 */
export const max = <A>(O: Ord<A>): ((as: ReadonlyNonEmptyArray<A>) => A) => {
  const S = semigroup.max(O)
  return (nea) => nea.reduce((a, acc) => S.combine(acc)(a))
}

/**
 * @since 3.0.0
 */
export const combineAll =
  <A>(S: Semigroup<A>) =>
  (fa: ReadonlyNonEmptyArray<A>): A =>
    fa.reduce((a, acc) => S.combine(acc)(a))
