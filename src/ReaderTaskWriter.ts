/**
 * @since 3.0.0
 */
import type { Applicative } from './Applicative'
import type { Apply } from './Apply'
import type * as bifunctor from './Bifunctor'
import type { Flat } from './Flat'
import type { FromIO } from './FromIO'
import type { FromReader } from './FromReader'
import type { FromTask } from './FromTask'
import * as fromWriter_ from './FromWriter'
import { flow, identity } from './function'
import * as functor from './Functor'
import type { HKT } from './HKT'
import * as _ from './internal'
import type { IO } from './IO'
import type { Monad } from './Monad'
import type { Monoid } from './Monoid'
import type { Pointed } from './Pointed'
import type { Reader } from './Reader'
import * as reader from './Reader'
import * as readerTask from './ReaderTask'
import type { ReaderTask } from './ReaderTask'
import * as readonlyNonEmptyArray from './ReadonlyNonEmptyArray'
import type { ReadonlyNonEmptyArray } from './ReadonlyNonEmptyArray'
import type { Semigroup } from './Semigroup'
import type { Task } from './Task'
import * as task from './Task'
import type { Writer } from './Writer'
import * as writerT from './WriterT'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 3.0.0
 */
export interface ReaderTaskWriter<R, W, A> extends Reader<R, Task<Writer<W, A>>> {}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 3.0.0
 */
export const fromReader =
  <W>(w: W) =>
  <R, A>(fa: Reader<R, A>): ReaderTaskWriter<R, W, A> =>
    fromReaderTask(w)(readerTask.fromReader(fa))

/**
 * @category constructors
 * @since 3.0.0
 */
export const fromReaderTask: <W>(w: W) => <R, A>(a: ReaderTask<R, A>) => ReaderTaskWriter<R, W, A> =
  /*#__PURE__*/ writerT.fromF(readerTask.Functor)

/**
 * @category constructors
 * @since 3.0.0
 */
export const fromTaskWriter: <W, A, R = unknown>(a: Task<Writer<W, A>>) => ReaderTaskWriter<R, W, A> =
  /*#__PURE__*/ reader.of

/**
 * @category constructors
 * @since 3.0.0
 */
export const fromIO: <W>(w: W) => <A, R = unknown>(fa: IO<A>) => ReaderTaskWriter<R, W, A> =
  /*#__PURE__*/ writerT.fromIO(readerTask.Functor, readerTask.FromIO)

/**
 * @category constructors
 * @since 3.0.0
 */
export const fromTask: <W>(w: W) => <A, R = unknown>(fa: Task<A>) => ReaderTaskWriter<R, W, A> =
  /*#__PURE__*/ writerT.fromTask(readerTask.Functor, readerTask.FromTask)

/**
 * Appends a value to the accumulator
 *
 * @category constructors
 * @since 3.0.0
 */
export const tell: <W, R>(w: W) => ReaderTaskWriter<R, W, void> = /*#__PURE__*/ writerT.tell(readerTask.Pointed)

/**
 * @category constructors
 * @since 3.0.0
 */
export const asksReaderTaskWriter: <R1, R2, W, A>(
  f: (r1: R1) => ReaderTaskWriter<R2, W, A>
) => ReaderTaskWriter<R1 & R2, W, A> = reader.asksReader

// -------------------------------------------------------------------------------------
// natural transformations
// -------------------------------------------------------------------------------------

/**
 * @category natural transformations
 * @since 3.0.0
 */
export const fromWriter = <W, A, R = unknown>(w: Writer<W, A>): ReaderTaskWriter<R, W, A> => readerTask.of(w)

/**
 * @category natural transformations
 * @since 3.0.0
 */
export const fromReaderWriter = <R, W, A>(fa: Reader<R, Writer<W, A>>): ReaderTaskWriter<R, W, A> => flow(fa, task.of)

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const fst: <R, W, A>(t: ReaderTaskWriter<R, W, A>) => ReaderTask<R, A> = /*#__PURE__*/ writerT.fst(
  readerTask.Functor
)

/**
 * @since 3.0.0
 */
export const snd: <R, W, A>(t: ReaderTaskWriter<R, W, A>) => ReaderTask<R, W> = /*#__PURE__*/ writerT.snd(
  readerTask.Functor
)

/**
 * Alias of [`fst`](#fst).
 *
 * @since 3.0.0
 */
export const evaluate = fst

/**
 * Alias of [`snd`](#snd).
 *
 * @since 3.0.0
 */
export const execute = snd

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
export const local: <R2, R1>(
  f: (r2: R2) => R1
) => <W, A>(ma: ReaderTaskWriter<R1, W, A>) => ReaderTaskWriter<R2, W, A> = reader.local

/**
 * @since 3.0.0
 */
export const swap: <R, W, A>(t: ReaderTaskWriter<R, W, A>) => ReaderTaskWriter<R, A, W> = /*#__PURE__*/ writerT.swap(
  readerTask.Functor
)

/**
 * @category combinators
 * @since 3.0.0
 */
export const fromTaskWriterK =
  <A extends ReadonlyArray<unknown>, W, B>(
    f: (...a: A) => Task<Writer<W, B>>
  ): (<R = unknown>(...a: A) => ReaderTaskWriter<R, W, B>) =>
  (...a) =>
    fromTaskWriter(f(...a))

/**
 * @category combinators
 * @since 3.0.0
 */
export const fromReaderWriterK = <A extends ReadonlyArray<unknown>, R, W, B>(
  f: (...a: A) => Reader<R, Writer<W, B>>
): ((...a: A) => ReaderTaskWriter<R, W, B>) => flow(f, fromReaderWriter)

/**
 * @since 3.0.0
 */
export const listen: <R, W, A>(fwa: ReaderTaskWriter<R, W, A>) => ReaderTaskWriter<R, W, readonly [A, W]> =
  /*#__PURE__*/ writerT.listen(readerTask.Functor)

/**
 * @since 3.0.0
 */
export const pass: <R, W, A>(fwa: ReaderTaskWriter<R, W, readonly [A, (w: W) => W]>) => ReaderTaskWriter<R, W, A> =
  /*#__PURE__*/ writerT.pass(readerTask.Functor)

/**
 * @since 3.0.0
 */
export const listens: <W, B>(
  f: (w: W) => B
) => <R, A>(fwa: ReaderTaskWriter<R, W, A>) => ReaderTaskWriter<R, W, readonly [A, B]> = /*#__PURE__*/ writerT.listens(
  readerTask.Functor
)

/**
 * @since 3.0.0
 */
export const censor: <W>(f: (w: W) => W) => <R, A>(fwa: ReaderTaskWriter<R, W, A>) => ReaderTaskWriter<R, W, A> =
  /*#__PURE__*/ writerT.censor(readerTask.Functor)

// -------------------------------------------------------------------------------------
// type class operations
// -------------------------------------------------------------------------------------

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category type class operations
 * @since 3.0.0
 */
export const map: <A, B>(f: (a: A) => B) => <R, E>(fa: ReaderTaskWriter<R, E, A>) => ReaderTaskWriter<R, E, B> =
  /*#__PURE__*/ writerT.map(readerTask.Functor)

/**
 * @category type class operations
 * @since 3.0.0
 */
export const mapLeft: <E, G>(f: (e: E) => G) => <R, A>(fea: ReaderTaskWriter<R, E, A>) => ReaderTaskWriter<R, G, A> =
  /*#__PURE__*/ writerT.mapLeft(readerTask.Functor)

/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category type class operations
 * @since 3.0.0
 */
export const bimap: <E, G, A, B>(
  f: (e: E) => G,
  g: (a: A) => B
) => <R>(fea: ReaderTaskWriter<R, E, A>) => ReaderTaskWriter<R, G, B> = /*#__PURE__*/ writerT.bimap(readerTask.Functor)

/**
 * Maps a function over the first component of a `Writer`.
 *
 * Alias of [`map`](#map)
 *
 * @since 3.0.0
 */
export const mapFst = map

/**
 * Maps a function over the second component of a `Writer`.
 *
 * Alias of [`mapLeft`](#mapleft)
 *
 * @since 3.0.0
 */
export const mapSnd = mapLeft

// -------------------------------------------------------------------------------------
// HKT
// -------------------------------------------------------------------------------------

/**
 * @category HKT
 * @since 3.0.0
 */
export interface ReaderTaskWriterF extends HKT {
  readonly type: ReaderTaskWriter<this['Contravariant1'], this['Covariant2'], this['Covariant1']>
}

/**
 * @category HKT
 * @since 3.0.0
 */
export interface ReaderTaskWriterFFixedW<W> extends HKT {
  readonly type: ReaderTaskWriter<this['Contravariant1'], W, this['Covariant1']>
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const Bifunctor: bifunctor.Bifunctor<ReaderTaskWriterF> = {
  bimap,
  mapLeft: mapSnd
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Functor: functor.Functor<ReaderTaskWriterF> = {
  map
}

/**
 * Derivable from `Functor`.
 *
 * @category combinators
 * @since 3.0.0
 */
export const flap: <A>(a: A) => <R, E, B>(fab: ReaderTaskWriter<R, E, (a: A) => B>) => ReaderTaskWriter<R, E, B> =
  /*#__PURE__*/ functor.flap(Functor)

/**
 * @category instances
 * @since 3.0.0
 */
export const getPointed = <W>(M: Monoid<W>): Pointed<ReaderTaskWriterFFixedW<W>> => ({
  of: writerT.of(readerTask.Pointed, M)
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getApply = <W>(A: Apply<readerTask.ReaderTaskF>, S: Semigroup<W>): Apply<ReaderTaskWriterFFixedW<W>> => ({
  map,
  ap: writerT.ap(A, S)
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getApplicative = <W>(
  A: Apply<readerTask.ReaderTaskF>,
  M: Monoid<W>
): Applicative<ReaderTaskWriterFFixedW<W>> => {
  const { ap } = getApply(A, M)
  const P = getPointed(M)
  return {
    map,
    ap,
    of: P.of
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export const getFlat = <W>(S: Semigroup<W>): Flat<ReaderTaskWriterFFixedW<W>> => {
  return {
    map,
    flatMap: writerT.flatMap(readerTask.Flat, S)
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export const getMonad = <W>(M: Monoid<W>): Monad<ReaderTaskWriterFFixedW<W>> => {
  const P = getPointed(M)
  const C = getFlat(M)
  return {
    map,
    of: P.of,
    flatMap: C.flatMap
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export const FromWriter: fromWriter_.FromWriter<ReaderTaskWriterF> = {
  fromWriter
}

/**
 * @category combinators
 * @since 3.0.0
 */
export const fromWriterK: <A extends ReadonlyArray<unknown>, E, B>(
  f: (...a: A) => Writer<E, B>
) => <R = unknown>(...a: A) => ReaderTaskWriter<R, E, B> = /*#__PURE__*/ fromWriter_.fromWriterK(FromWriter)

/**
 * @category instances
 * @since 3.0.0
 */
export const getFromReader = <W>(M: Monoid<W>): FromReader<ReaderTaskWriterFFixedW<W>> => ({
  fromReader: fromReader(M.empty)
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getFromIO = <W>(M: Monoid<W>): FromIO<ReaderTaskWriterFFixedW<W>> => ({
  fromIO: fromIO(M.empty)
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getFromTask = <W>(M: Monoid<W>): FromTask<ReaderTaskWriterFFixedW<W>> => ({
  fromIO: fromIO(M.empty),
  fromTask: fromTask(M.empty)
})

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const bindTo: <N extends string>(
  name: N
) => <R, E, A>(fa: ReaderTaskWriter<R, E, A>) => ReaderTaskWriter<R, E, { readonly [K in N]: A }> =
  /*#__PURE__*/ functor.bindTo(Functor)

const let_: <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => B
) => <R, E>(
  fa: ReaderTaskWriter<R, E, A>
) => ReaderTaskWriter<R, E, { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/ functor.let(Functor)

export {
  /**
   * @since 3.0.0
   */
  let_ as let
}

// -------------------------------------------------------------------------------------
// sequence T
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const tupled: <R, E, A>(fa: ReaderTaskWriter<R, E, A>) => ReaderTaskWriter<R, E, readonly [A]> =
  /*#__PURE__*/ functor.tupled(Functor)

// -------------------------------------------------------------------------------------
// array utils
// -------------------------------------------------------------------------------------

/**
 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(getApply(A, M))`.
 *
 * @since 3.0.0
 */
export const traverseReadonlyNonEmptyArrayWithIndex =
  <W>(A: Apply<readerTask.ReaderTaskF>, S: Semigroup<W>) =>
  <A, R, B>(f: (index: number, a: A) => ReaderTaskWriter<R, W, B>) =>
  (as: ReadonlyNonEmptyArray<A>): ReaderTaskWriter<R, W, ReadonlyNonEmptyArray<B>> => {
    // TODO
    return readonlyNonEmptyArray.traverseWithIndex(getApply(A, S))(f)(as)
  }

/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(getApplicative(A, M))`.
 *
 * @since 3.0.0
 */
export const traverseReadonlyArrayWithIndex =
  <W>(A: Apply<readerTask.ReaderTaskF>, M: Monoid<W>) =>
  <A, R, B>(
    f: (index: number, a: A) => ReaderTaskWriter<R, W, B>
  ): ((as: ReadonlyArray<A>) => ReaderTaskWriter<R, W, ReadonlyArray<B>>) => {
    const g = traverseReadonlyNonEmptyArrayWithIndex(A, M)(f)
    const P = getPointed(M)
    return (as) => (_.isNonEmpty(as) ? g(as) : P.of(_.emptyReadonlyArray))
  }

/**
 * Equivalent to `ReadonlyNonEmptyArray#traverse(getApply(A, M))`.
 *
 * @since 3.0.0
 */
export const traverseReadonlyNonEmptyArray = <W>(A: Apply<readerTask.ReaderTaskF>, S: Semigroup<W>) => {
  const traverseReadonlyNonEmptyArrayWithIndexAM = traverseReadonlyNonEmptyArrayWithIndex(A, S)
  return <A, R, B>(
    f: (a: A) => ReaderTaskWriter<R, W, B>
  ): ((as: ReadonlyNonEmptyArray<A>) => ReaderTaskWriter<R, W, ReadonlyNonEmptyArray<B>>) => {
    return traverseReadonlyNonEmptyArrayWithIndexAM((_, a) => f(a))
  }
}

/**
 * Equivalent to `ReadonlyArray#traverse(getApplicative(A, M))`.
 *
 * @since 3.0.0
 */
export const traverseReadonlyArray = <W>(A: Apply<readerTask.ReaderTaskF>, M: Monoid<W>) => {
  const traverseReadonlyArrayWithIndexAM = traverseReadonlyArrayWithIndex(A, M)
  return <A, R, B>(
    f: (a: A) => ReaderTaskWriter<R, W, B>
  ): ((as: ReadonlyArray<A>) => ReaderTaskWriter<R, W, ReadonlyArray<B>>) => {
    return traverseReadonlyArrayWithIndexAM((_, a) => f(a))
  }
}

/**
 * Equivalent to `ReadonlyArray#sequence(getApplicative(A, M))`.
 *
 * @since 3.0.0
 */
export const sequenceReadonlyArray = <W>(
  A: Apply<readerTask.ReaderTaskF>,
  M: Monoid<W>
): (<R, A>(arr: ReadonlyArray<ReaderTaskWriter<R, W, A>>) => ReaderTaskWriter<R, W, ReadonlyArray<A>>) =>
  traverseReadonlyArray(A, M)(identity)