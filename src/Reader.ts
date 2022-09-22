/**
 * @since 3.0.0
 */
import type * as applicative from './Applicative'
import * as apply from './Apply'
import type * as category from './Category'
import * as flat from './Flat'
import type * as fromReader_ from './FromReader'
import { constant, flow, identity } from './function'
import * as functor from './Functor'
import type { HKT } from './HKT'
import * as _ from './internal'
import type * as monad from './Monad'
import type * as pointed from './Pointed'
import type * as profunctor from './Profunctor'
import type { ReadonlyNonEmptyArray } from './ReadonlyNonEmptyArray'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 3.0.0
 */
export interface Reader<R, A> {
  (r: R): A
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * Reads the current context.
 *
 * @category constructors
 * @since 3.0.0
 */
export const ask: <R>() => Reader<R, R> = _.ask

/**
 * Projects a value from the global context in a `Reader`.
 *
 * @category constructors
 * @since 3.0.0
 */
export const asks: <R, A>(f: (r: R) => A) => Reader<R, A> = identity

/**
 * @category constructors
 * @since 3.0.0
 */
export const asksReader =
  <R1, R2, A>(f: (r1: R1) => Reader<R2, A>): Reader<R1 & R2, A> =>
  (r) =>
    f(r)(r)

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * Changes the value of the local context during the execution of the action `ma` (similar to `Contravariant`'s
 * `contramap`).
 *
 * @category combinators
 * @since 3.0.0
 */
export const local =
  <R2, R1>(f: (r2: R2) => R1) =>
  <A>(ma: Reader<R1, A>): Reader<R2, A> =>
  (r2) =>
    ma(f(r2))

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 3.0.0
 */
export const map: <A, B>(f: (a: A) => B) => <R>(fa: Reader<R, A>) => Reader<R, B> = (f) => (fa) => flow(fa, f)

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 3.0.0
 */
export const ap: <R2, A>(fa: Reader<R2, A>) => <R1, B>(fab: Reader<R1, (a: A) => B>) => Reader<R1 & R2, B> =
  (fa) => (fab) => (r) =>
    fab(r)(fa(r))

/**
 * @category Pointed
 * @since 3.0.0
 */
export const of: <A, R = unknown>(a: A) => Reader<R, A> = constant

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Flat
 * @since 3.0.0
 */
export const flatMap: <A, R2, B>(f: (a: A) => Reader<R2, B>) => <R1>(ma: Reader<R1, A>) => Reader<R1 & R2, B> =
  (f) => (fa) => (r) =>
    f(fa(r))(r)

/**
 * Derivable from `Flat`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const flatten: <R1, R2, A>(mma: Reader<R1, Reader<R2, A>>) => Reader<R1 & R2, A> =
  /*#__PURE__*/ flatMap(identity)

/**
 * @category Composable
 * @since 3.0.0
 */
export const compose: <B, C>(bc: Reader<B, C>) => <A>(ab: Reader<A, B>) => Reader<A, C> = (bc) => (ab) => flow(ab, bc)

/**
 * @category Profunctor
 * @since 3.0.0
 */
export const promap: <Q, R, A, B>(f: (d: Q) => R, g: (a: A) => B) => (pea: Reader<R, A>) => Reader<Q, B> =
  (f, g) => (fea) => (a) =>
    g(fea(f(a)))

/**
 * @category Category
 * @since 3.0.0
 */
export const id: <A>() => Reader<A, A> = () => identity

// -------------------------------------------------------------------------------------
// HKT
// -------------------------------------------------------------------------------------

/**
 * @category HKT
 * @since 3.0.0
 */
export interface ReaderF extends HKT {
  readonly type: Reader<this['Contravariant1'], this['Covariant1']>
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const FromReader: fromReader_.FromReader<ReaderF> = {
  fromReader: identity
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Functor: functor.Functor<ReaderF> = {
  map
}

/**
 * Derivable from `Functor`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const flap: <A>(a: A) => <R, B>(fab: Reader<R, (a: A) => B>) => Reader<R, B> =
  /*#__PURE__*/ functor.flap(Functor)

/**
 * @category instances
 * @since 3.0.0
 */
export const Pointed: pointed.Pointed<ReaderF> = {
  of
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Apply: apply.Apply<ReaderF> = {
  map,
  ap
}

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category combinators
 * @since 3.0.0
 */
export const zipLeftPar: <R2, B>(second: Reader<R2, B>) => <R1, A>(self: Reader<R1, A>) => Reader<R1 & R2, A> =
  /*#__PURE__*/ apply.zipLeftPar(Apply)

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category combinators
 * @since 3.0.0
 */
export const zipRightPar: <R2, B>(second: Reader<R2, B>) => <R1, A>(self: Reader<R1, A>) => Reader<R1 & R2, B> =
  /*#__PURE__*/ apply.zipRightPar(Apply)

/**
 * @category instances
 * @since 3.0.0
 */
export const Applicative: applicative.Applicative<ReaderF> = {
  map,
  ap,
  of
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Flat: flat.Flat<ReaderF> = {
  map,
  flatMap
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Monad: monad.Monad<ReaderF> = {
  map,
  of,
  flatMap
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Profunctor: profunctor.Profunctor<ReaderF> = {
  map,
  promap
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Category: category.Category<ReaderF> = {
  compose,
  id
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const bindTo: <N extends string>(name: N) => <R, A>(fa: Reader<R, A>) => Reader<R, { readonly [K in N]: A }> =
  /*#__PURE__*/ functor.bindTo(Functor)

const let_: <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => B
) => <R>(fa: Reader<R, A>) => Reader<R, { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/ functor.let(Functor)

export {
  /**
   * @since 3.0.0
   */
  let_ as let
}

/**
 * @since 3.0.0
 */
export const bind: <N extends string, A, R2, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => Reader<R2, B>
) => <R1>(fa: Reader<R1, A>) => Reader<R1 & R2, { readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/ flat.bind(Flat)

// -------------------------------------------------------------------------------------
// sequence S
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const Do: Reader<unknown, {}> = /*#__PURE__*/ of(_.emptyRecord)

/**
 * @since 3.0.0
 */
export const apS: <N extends string, A, R2, B>(
  name: Exclude<N, keyof A>,
  fb: Reader<R2, B>
) => <R1>(fa: Reader<R1, A>) => Reader<R1 & R2, { readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/ apply.apS(Apply)

// -------------------------------------------------------------------------------------
// sequence T
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const ApT: Reader<unknown, readonly []> = /*#__PURE__*/ of(_.emptyReadonlyArray)

/**
 * @since 3.0.0
 */
export const tupled: <R, A>(fa: Reader<R, A>) => Reader<R, readonly [A]> = /*#__PURE__*/ functor.tupled(Functor)

/**
 * @since 3.0.0
 */
export const apT: <R2, B>(
  fb: Reader<R2, B>
) => <R1, A extends ReadonlyArray<unknown>>(fas: Reader<R1, A>) => Reader<R1 & R2, readonly [...A, B]> =
  /*#__PURE__*/ apply.apT(Apply)

// -------------------------------------------------------------------------------------
// array utils
// -------------------------------------------------------------------------------------

/**
 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(Apply)`.
 *
 * @since 3.0.0
 */
export const traverseReadonlyNonEmptyArrayWithIndex =
  <A, R, B>(f: (index: number, a: A) => Reader<R, B>) =>
  (as: ReadonlyNonEmptyArray<A>): Reader<R, ReadonlyNonEmptyArray<B>> =>
  (r) => {
    const out: _.NonEmptyArray<B> = [f(0, _.head(as))(r)]
    for (let i = 1; i < as.length; i++) {
      out.push(f(i, as[i])(r))
    }
    return out
  }

/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
 *
 * @since 3.0.0
 */
export const traverseReadonlyArrayWithIndex = <A, R, B>(
  f: (index: number, a: A) => Reader<R, B>
): ((as: ReadonlyArray<A>) => Reader<R, ReadonlyArray<B>>) => {
  const g = traverseReadonlyNonEmptyArrayWithIndex(f)
  return (as) => (_.isNonEmpty(as) ? g(as) : ApT)
}

/**
 * Equivalent to `ReadonlyNonEmptyArray#traverse(Apply)`.
 *
 * @since 3.0.0
 */
export const traverseReadonlyNonEmptyArray = <A, R, B>(
  f: (a: A) => Reader<R, B>
): ((as: ReadonlyNonEmptyArray<A>) => Reader<R, ReadonlyNonEmptyArray<B>>) => {
  return traverseReadonlyNonEmptyArrayWithIndex((_, a) => f(a))
}

/**
 * Equivalent to `ReadonlyArray#traverse(Applicative)`.
 *
 * @since 3.0.0
 */
export const traverseReadonlyArray = <A, R, B>(
  f: (a: A) => Reader<R, B>
): ((as: ReadonlyArray<A>) => Reader<R, ReadonlyArray<B>>) => {
  return traverseReadonlyArrayWithIndex((_, a) => f(a))
}

/**
 * Equivalent to `ReadonlyArray#sequence(Applicative)`.
 *
 * @since 3.0.0
 */
export const sequenceReadonlyArray: <R, A>(arr: ReadonlyArray<Reader<R, A>>) => Reader<R, ReadonlyArray<A>> =
  /*#__PURE__*/ traverseReadonlyArray(identity)
