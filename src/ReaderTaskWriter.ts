/**
 * @since 3.0.0
 */
import type { Applicative } from './Applicative'
import type { Apply } from './Apply'
import type * as bifunctor from './Bifunctor'
import type { Flattenable } from './Flattenable'
import type { FromSync } from './FromSync'
import type { FromReader } from './FromReader'
import type { FromAsync } from './FromAsync'
import * as fromWriter_ from './FromWriter'
import { flow, identity, SK } from './Function'
import * as functor from './Functor'
import type { TypeLambda } from './HKT'
import * as _ from './internal'
import type { Sync } from './Sync'
import type { Monad } from './Monad'
import type { Monoid } from './Monoid'
import type { FromIdentity } from './FromIdentity'
import type { Reader } from './Reader'
import * as reader from './Reader'
import * as readerTask from './ReaderTask'
import type { ReaderTask } from './ReaderTask'
import * as readonlyNonEmptyArray from './ReadonlyNonEmptyArray'
import type { ReadonlyNonEmptyArray } from './ReadonlyNonEmptyArray'
import type { Semigroup } from './Semigroup'
import type { Async } from './Async'
import * as task from './Async'
import type { Writer } from './Writer'
import * as writerT from './WriterT'

/**
 * @category model
 * @since 3.0.0
 */
export interface ReaderTaskWriter<R, W, A> extends Reader<R, Async<Writer<W, A>>> {}

// -------------------------------------------------------------------------------------
// type lambdas
// -------------------------------------------------------------------------------------

/**
 * @category type lambdas
 * @since 3.0.0
 */
export interface ReaderTaskWriterTypeLambda extends TypeLambda {
  readonly type: ReaderTaskWriter<this['In1'], this['Out2'], this['Out1']>
}

/**
 * @category type lambdas
 * @since 3.0.0
 */
export interface ReaderTaskWriterFFix<W> extends TypeLambda {
  readonly type: ReaderTaskWriter<this['In1'], W, this['Out1']>
}

/**
 * @category conversions
 * @since 3.0.0
 */
export const fromReader =
  <W>(w: W) =>
  <R, A>(fa: Reader<R, A>): ReaderTaskWriter<R, W, A> =>
    fromReaderTask(w)(readerTask.fromReader(fa))

/**
 * @category conversions
 * @since 3.0.0
 */
export const fromReaderTask: <W>(w: W) => <R, A>(a: ReaderTask<R, A>) => ReaderTaskWriter<R, W, A> =
  /*#__PURE__*/ writerT.fromKind(readerTask.Functor)

/**
 * @category conversions
 * @since 3.0.0
 */
export const fromAsyncWriter: <W, A>(a: Async<Writer<W, A>>) => ReaderTaskWriter<unknown, W, A> =
  /*#__PURE__*/ reader.succeed

/**
 * @category conversions
 * @since 3.0.0
 */
export const fromSync: <W>(w: W) => <A>(fa: Sync<A>) => ReaderTaskWriter<unknown, W, A> =
  /*#__PURE__*/ writerT.fromSync(readerTask.Functor, readerTask.FromSync)

/**
 * @category conversions
 * @since 3.0.0
 */
export const fromAsync: <W>(w: W) => <A>(fa: Async<A>) => ReaderTaskWriter<unknown, W, A> =
  /*#__PURE__*/ writerT.fromAsync(readerTask.Functor, readerTask.FromAsync)

/**
 * Appends a value to the accumulator
 *
 * @category constructors
 * @since 3.0.0
 */
export const tell: <W, R>(w: W) => ReaderTaskWriter<R, W, void> = /*#__PURE__*/ writerT.tell(readerTask.FromIdentity)

/**
 * @category constructors
 * @since 3.0.0
 */
export const asksReaderTaskWriter: <R1, R2, W, A>(
  f: (r1: R1) => ReaderTaskWriter<R2, W, A>
) => ReaderTaskWriter<R1 & R2, W, A> = reader.asksReader

/**
 * @category conversions
 * @since 3.0.0
 */
export const fromWriter = <W, A>(fa: Writer<W, A>): ReaderTaskWriter<unknown, W, A> => readerTask.succeed(fa)

/**
 * @category conversions
 * @since 3.0.0
 */
export const fromReaderWriter = <R, W, A>(fa: Reader<R, Writer<W, A>>): ReaderTaskWriter<R, W, A> =>
  flow(fa, task.succeed)

/**
 * @since 3.0.0
 */
export const fst: <R, W, A>(self: ReaderTaskWriter<R, W, A>) => ReaderTask<R, W> = /*#__PURE__*/ writerT.fst(
  readerTask.Functor
)

/**
 * @since 3.0.0
 */
export const snd: <R, W, A>(self: ReaderTaskWriter<R, W, A>) => ReaderTask<R, A> = /*#__PURE__*/ writerT.snd(
  readerTask.Functor
)

/**
 * Changes the value of the local context during the execution of the action `ma` (similar to `Contravariant`'s
 * `contramap`).
 *
 * @since 3.0.0
 */
export const local: <R2, R1>(
  f: (r2: R2) => R1
) => <W, A>(self: ReaderTaskWriter<R1, W, A>) => ReaderTaskWriter<R2, W, A> = reader.local

/**
 * @since 3.0.0
 */
export const swap: <R, W, A>(self: ReaderTaskWriter<R, W, A>) => ReaderTaskWriter<R, A, W> = /*#__PURE__*/ writerT.swap(
  readerTask.Functor
)

/**
 * @category lifting
 * @since 3.0.0
 */
export const liftTaskWriter =
  <A extends ReadonlyArray<unknown>, W, B>(
    f: (...a: A) => Async<Writer<W, B>>
  ): ((...a: A) => ReaderTaskWriter<unknown, W, B>) =>
  (...a) =>
    fromAsyncWriter(f(...a))

/**
 * @category lifting
 * @since 3.0.0
 */
export const liftReaderWriter = <A extends ReadonlyArray<unknown>, R, W, B>(
  f: (...a: A) => Reader<R, Writer<W, B>>
): ((...a: A) => ReaderTaskWriter<R, W, B>) => flow(f, fromReaderWriter)

/**
 * @since 3.0.0
 */
export const listen: <R, W, A>(self: ReaderTaskWriter<R, W, A>) => ReaderTaskWriter<R, W, readonly [W, A]> =
  /*#__PURE__*/ writerT.listen(readerTask.Functor)

/**
 * @since 3.0.0
 */
export const pass: <R, W, A>(self: ReaderTaskWriter<R, W, readonly [A, (w: W) => W]>) => ReaderTaskWriter<R, W, A> =
  /*#__PURE__*/ writerT.pass(readerTask.Functor)

/**
 * @since 3.0.0
 */
export const listens: <W, B>(
  f: (w: W) => B
) => <R, A>(self: ReaderTaskWriter<R, W, A>) => ReaderTaskWriter<R, W, readonly [A, B]> = /*#__PURE__*/ writerT.listens(
  readerTask.Functor
)

/**
 * @since 3.0.0
 */
export const censor: <W>(f: (w: W) => W) => <R, A>(self: ReaderTaskWriter<R, W, A>) => ReaderTaskWriter<R, W, A> =
  /*#__PURE__*/ writerT.censor(readerTask.Functor)

/**
 * @since 3.0.0
 */
export const map: <A, B>(f: (a: A) => B) => <R, E>(self: ReaderTaskWriter<R, E, A>) => ReaderTaskWriter<R, E, B> =
  /*#__PURE__*/ writerT.map(readerTask.Functor)

/**
 * Returns an effect with its error channel mapped using the specified
 * function. This can be used to lift a "smaller" error into a "larger" error.
 *
 * @category error handling
 * @since 3.0.0
 */
export const mapError: <E, G>(f: (e: E) => G) => <R, A>(self: ReaderTaskWriter<R, E, A>) => ReaderTaskWriter<R, G, A> =
  /*#__PURE__*/ writerT.mapLeft(readerTask.Functor)

/**
 * Returns an effect whose failure and success channels have been mapped by
 * the specified pair of functions, `f` and `g`.
 *
 * @category mapping
 * @since 3.0.0
 */
export const mapBoth: <E, G, A, B>(
  f: (e: E) => G,
  g: (a: A) => B
) => <R>(self: ReaderTaskWriter<R, E, A>) => ReaderTaskWriter<R, G, B> = /*#__PURE__*/ writerT.mapBoth(
  readerTask.Functor
)

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const Bifunctor: bifunctor.Bifunctor<ReaderTaskWriterTypeLambda> = {
  mapBoth
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Functor: functor.Functor<ReaderTaskWriterTypeLambda> = {
  map
}

/**
 * @category mapping
 * @since 3.0.0
 */
export const flap: <A>(a: A) => <R, E, B>(self: ReaderTaskWriter<R, E, (a: A) => B>) => ReaderTaskWriter<R, E, B> =
  /*#__PURE__*/ functor.flap(Functor)

/**
 * @category instances
 * @since 3.0.0
 */
export const getFromIdentity = <W>(M: Monoid<W>): FromIdentity<ReaderTaskWriterFFix<W>> => ({
  succeed: writerT.succeed(readerTask.FromIdentity, M)
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getApply = <W>(
  Apply: Apply<readerTask.ReaderTaskTypeLambda>,
  Semigroup: Semigroup<W>
): Apply<ReaderTaskWriterFFix<W>> => ({
  map,
  ap: writerT.ap(Apply, Semigroup)
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getApplicative = <W>(
  Apply: Apply<readerTask.ReaderTaskTypeLambda>,
  Monoid: Monoid<W>
): Applicative<ReaderTaskWriterFFix<W>> => {
  const { ap } = getApply(Apply, Monoid)
  const P = getFromIdentity(Monoid)
  return {
    map,
    ap,
    succeed: P.succeed
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export const getFlattenable = <W>(S: Semigroup<W>): Flattenable<ReaderTaskWriterFFix<W>> => {
  return {
    map,
    flatMap: writerT.flatMap(readerTask.Flattenable, S)
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export const getMonad = <W>(M: Monoid<W>): Monad<ReaderTaskWriterFFix<W>> => {
  const P = getFromIdentity(M)
  const C = getFlattenable(M)
  return {
    map,
    succeed: P.succeed,
    flatMap: C.flatMap
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export const FromWriter: fromWriter_.FromWriter<ReaderTaskWriterTypeLambda> = {
  fromWriter
}

/**
 * @category lifting
 * @since 3.0.0
 */
export const liftWriter: <A extends ReadonlyArray<unknown>, E, B>(
  f: (...a: A) => Writer<E, B>
) => (...a: A) => ReaderTaskWriter<unknown, E, B> = /*#__PURE__*/ fromWriter_.liftWriter(FromWriter)

/**
 * @category instances
 * @since 3.0.0
 */
export const getFromReader = <W>(M: Monoid<W>): FromReader<ReaderTaskWriterFFix<W>> => ({
  fromReader: fromReader(M.empty)
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getFromSync = <W>(M: Monoid<W>): FromSync<ReaderTaskWriterFFix<W>> => ({
  fromSync: fromSync(M.empty)
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getFromAsync = <W>(M: Monoid<W>): FromAsync<ReaderTaskWriterFFix<W>> => ({
  fromSync: fromSync(M.empty),
  fromAsync: fromAsync(M.empty)
})

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @category do notation
 * @since 3.0.0
 */
export const bindTo: <N extends string>(
  name: N
) => <R, E, A>(self: ReaderTaskWriter<R, E, A>) => ReaderTaskWriter<R, E, { readonly [K in N]: A }> =
  /*#__PURE__*/ functor.bindTo(Functor)

const let_: <N extends string, A extends object, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => B
) => <R, E>(
  self: ReaderTaskWriter<R, E, A>
) => ReaderTaskWriter<R, E, { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/ functor.let(Functor)

export {
  /**
   * @category do notation
   * @since 3.0.0
   */
  let_ as let
}

// -------------------------------------------------------------------------------------
// tuple sequencing
// -------------------------------------------------------------------------------------

/**
 * @category tuple sequencing
 * @since 3.0.0
 */
export const tupled: <R, E, A>(self: ReaderTaskWriter<R, E, A>) => ReaderTaskWriter<R, E, readonly [A]> =
  /*#__PURE__*/ functor.tupled(Functor)

// -------------------------------------------------------------------------------------
// array utils
// -------------------------------------------------------------------------------------

/**
 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(getApply(Apply, Semigroup))`.
 *
 * @category traversing
 * @since 3.0.0
 */
export const traverseReadonlyNonEmptyArrayWithIndex =
  <W>(Apply: Apply<readerTask.ReaderTaskTypeLambda>, Semigroup: Semigroup<W>) =>
  <A, R, B>(f: (index: number, a: A) => ReaderTaskWriter<R, W, B>) =>
  (as: ReadonlyNonEmptyArray<A>): ReaderTaskWriter<R, W, ReadonlyNonEmptyArray<B>> => {
    // TODO
    return readonlyNonEmptyArray.traverseWithIndex(getApply(Apply, Semigroup))(f)(as)
  }

/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(getApplicative(Apply, Monoid))`.
 *
 * @category traversing
 * @since 3.0.0
 */
export const traverseReadonlyArrayWithIndex =
  <W>(Apply: Apply<readerTask.ReaderTaskTypeLambda>, Monoid: Monoid<W>) =>
  <A, R, B>(
    f: (index: number, a: A) => ReaderTaskWriter<R, W, B>
  ): ((as: ReadonlyArray<A>) => ReaderTaskWriter<R, W, ReadonlyArray<B>>) => {
    const g = traverseReadonlyNonEmptyArrayWithIndex(Apply, Monoid)(f)
    const P = getFromIdentity(Monoid)
    return (as) => (_.isNonEmpty(as) ? g(as) : P.succeed(_.Zip))
  }

/**
 * Equivalent to `ReadonlyNonEmptyArray#traverse(getApply(Apply, Semigroup))`.
 *
 * @category traversing
 * @since 3.0.0
 */
export const traverseReadonlyNonEmptyArray = <W>(
  Apply: Apply<readerTask.ReaderTaskTypeLambda>,
  Semigroup: Semigroup<W>
) => {
  const traverseReadonlyNonEmptyArrayWithIndexAM = traverseReadonlyNonEmptyArrayWithIndex(Apply, Semigroup)
  return <A, R, B>(
    f: (a: A) => ReaderTaskWriter<R, W, B>
  ): ((as: ReadonlyNonEmptyArray<A>) => ReaderTaskWriter<R, W, ReadonlyNonEmptyArray<B>>) => {
    return traverseReadonlyNonEmptyArrayWithIndexAM(flow(SK, f))
  }
}

/**
 * Equivalent to `ReadonlyArray#traverse(getApplicative(A, M))`.
 *
 * @category traversing
 * @since 3.0.0
 */
export const traverseReadonlyArray = <W>(A: Apply<readerTask.ReaderTaskTypeLambda>, M: Monoid<W>) => {
  const traverseReadonlyArrayWithIndexAM = traverseReadonlyArrayWithIndex(A, M)
  return <A, R, B>(
    f: (a: A) => ReaderTaskWriter<R, W, B>
  ): ((as: ReadonlyArray<A>) => ReaderTaskWriter<R, W, ReadonlyArray<B>>) => {
    return traverseReadonlyArrayWithIndexAM(flow(SK, f))
  }
}

/**
 * Equivalent to `ReadonlyArray#sequence(getApplicative(A, M))`.
 *
 * @category traversing
 * @since 3.0.0
 */
export const sequenceReadonlyArray = <W>(
  A: Apply<readerTask.ReaderTaskTypeLambda>,
  M: Monoid<W>
): (<R, A>(arr: ReadonlyArray<ReaderTaskWriter<R, W, A>>) => ReaderTaskWriter<R, W, ReadonlyArray<A>>) =>
  traverseReadonlyArray(A, M)(identity)