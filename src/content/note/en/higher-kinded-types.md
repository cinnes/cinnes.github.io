---
title: Higher-Kinded Types - Abstracting Over Type Constructors
timestamp: 2025-11-14 00:00:00+00:00
description: Explore higher-kinded types to write generic abstractions that work across different container types like arrays, promises, and custom monads.
tags: [fp, hkt, types, advanced]
toc: true
---

# Higher-Kinded Types - Abstracting Over Type Constructors

Higher-kinded types (HKTs) allow you to abstract over type constructors—types that themselves take type parameters. While TypeScript doesn't natively support HKTs, we can simulate them to write highly generic, reusable code.

## The Problem

Consider writing a generic `map` function that works for any container:

```typescript
// Works for arrays
function mapArray<A, B>(fa: A[], f: (a: A) => B): B[] {
  return fa.map(f);
}

// Works for promises
function mapPromise<A, B>(fa: Promise<A>, f: (a: A) => B): Promise<B> {
  return fa.then(f);
}

// Works for Maybe
function mapMaybe<A, B>(fa: Maybe<A>, f: (a: A) => B): Maybe<B> {
  return fa.map(f);
}
```

We're duplicating the pattern. What we want is:

```typescript
function map<F, A, B>(fa: F<A>, f: (a: A) => B): F<B>
```

But TypeScript doesn't support `F<A>` where `F` is a variable type constructor. This is where HKT encoding comes in.

## HKT Encoding in TypeScript

We can simulate HKTs using a witness pattern:

```typescript
// URI registry for type constructors
interface URItoKind<A> {
  Array: A[];
  Promise: Promise<A>;
  Maybe: Maybe<A>;
}

// HKT type that maps URI to its kind
type Kind<F extends keyof URItoKind<any>, A> = URItoKind<A>[F];

// Now we can write generic abstractions
interface Functor<F extends keyof URItoKind<any>> {
  map<A, B>(fa: Kind<F, A>, f: (a: A) => B): Kind<F, B>;
}
```

## Implementing Functor Instances

```typescript
// Array functor instance
const ArrayFunctor: Functor<'Array'> = {
  map: (fa, f) => fa.map(f)
};

// Promise functor instance
const PromiseFunctor: Functor<'Promise'> = {
  map: (fa, f) => fa.then(f)
};

// Maybe type
class Maybe<A> {
  constructor(private value: A | null) {}

  static of<A>(value: A | null): Maybe<A> {
    return new Maybe(value);
  }

  isNothing(): boolean {
    return this.value === null;
  }

  map<B>(f: (a: A) => B): Maybe<B> {
    return this.isNothing()
      ? Maybe.of<B>(null)
      : Maybe.of(f(this.value!));
  }
}

// Register Maybe in URI registry
interface URItoKind<A> {
  Array: A[];
  Promise: Promise<A>;
  Maybe: Maybe<A>;
}

// Maybe functor instance
const MaybeFunctor: Functor<'Maybe'> = {
  map: (fa, f) => fa.map(f)
};
```

## Generic Functions Over HKTs

Now we can write truly generic functions:

```typescript
// Generic map that works for any functor
function genericMap<F extends keyof URItoKind<any>, A, B>(
  F: Functor<F>,
  fa: Kind<F, A>,
  f: (a: A) => B
): Kind<F, B> {
  return F.map(fa, f);
}

// Usage
const nums = [1, 2, 3];
const doubled = genericMap(ArrayFunctor, nums, x => x * 2);
// [2, 4, 6]

const promise = Promise.resolve(5);
const result = genericMap(PromiseFunctor, promise, x => x * 2);
// Promise<10>

const maybe = Maybe.of(10);
const maybeResult = genericMap(MaybeFunctor, maybe, x => x * 2);
// Maybe(20)
```

## Applicative HKT

Let's extend to Applicative, which adds `pure` and `ap`:

```typescript
interface Applicative<F extends keyof URItoKind<any>> extends Functor<F> {
  pure<A>(a: A): Kind<F, A>;
  ap<A, B>(fab: Kind<F, (a: A) => B>, fa: Kind<F, A>): Kind<F, B>;
}

// Array applicative
const ArrayApplicative: Applicative<'Array'> = {
  ...ArrayFunctor,
  pure: <A>(a: A) => [a],
  ap: <A, B>(fab: ((a: A) => B)[], fa: A[]): B[] =>
    fab.flatMap(f => fa.map(f))
};

// Promise applicative
const PromiseApplicative: Applicative<'Promise'> = {
  ...PromiseFunctor,
  pure: <A>(a: A) => Promise.resolve(a),
  ap: async <A, B>(
    fab: Promise<(a: A) => B>,
    fa: Promise<A>
  ): Promise<B> => {
    const [f, a] = await Promise.all([fab, fa]);
    return f(a);
  }
};

// Maybe applicative
const MaybeApplicative: Applicative<'Maybe'> = {
  ...MaybeFunctor,
  pure: <A>(a: A) => Maybe.of(a),
  ap: <A, B>(fab: Maybe<(a: A) => B>, fa: Maybe<A>): Maybe<B> => {
    if (fab.isNothing() || fa.isNothing()) {
      return Maybe.of<B>(null);
    }
    return fa.map((fab as any).value);
  }
};
```

## Monad HKT

Monads add `flatMap`:

```typescript
interface Monad<F extends keyof URItoKind<any>> extends Applicative<F> {
  flatMap<A, B>(fa: Kind<F, A>, f: (a: A) => Kind<F, B>): Kind<F, B>;
}

// Array monad
const ArrayMonad: Monad<'Array'> = {
  ...ArrayApplicative,
  flatMap: <A, B>(fa: A[], f: (a: A) => B[]): B[] =>
    fa.flatMap(f)
};

// Promise monad
const PromiseMonad: Monad<'Promise'> = {
  ...PromiseApplicative,
  flatMap: <A, B>(fa: Promise<A>, f: (a: A) => Promise<B>): Promise<B> =>
    fa.then(f)
};

// Maybe monad
const MaybeMonad: Monad<'Maybe'> = {
  ...MaybeApplicative,
  flatMap: <A, B>(fa: Maybe<A>, f: (a: A) => Maybe<B>): Maybe<B> => {
    if (fa.isNothing()) return Maybe.of<B>(null);
    return f((fa as any).value);
  }
};
```

## Practical Example: Validation

```typescript
// Either type for error handling
class Either<E, A> {
  constructor(
    private readonly value: E | A,
    private readonly isLeft: boolean
  ) {}

  static left<E, A>(e: E): Either<E, A> {
    return new Either(e, true);
  }

  static right<E, A>(a: A): Either<E, A> {
    return new Either(a, false);
  }

  fold<B>(onLeft: (e: E) => B, onRight: (a: A) => B): B {
    return this.isLeft ? onLeft(this.value as E) : onRight(this.value as A);
  }
}

// Register Either (need to handle two type params)
interface URItoKind2<E, A> {
  Either: Either<E, A>;
}

type Kind2<F extends keyof URItoKind2<any, any>, E, A> = URItoKind2<E, A>[F];

// Either monad (fixed error type)
interface Monad2<F extends keyof URItoKind2<any, any>, E> {
  pure<A>(a: A): Kind2<F, E, A>;
  map<A, B>(fa: Kind2<F, E, A>, f: (a: A) => B): Kind2<F, E, B>;
  flatMap<A, B>(
    fa: Kind2<F, E, A>,
    f: (a: A) => Kind2<F, E, B>
  ): Kind2<F, E, B>;
}

const EitherMonad = <E>(): Monad2<'Either', E> => ({
  pure: <A>(a: A) => Either.right<E, A>(a),

  map: <A, B>(fa: Either<E, A>, f: (a: A) => B): Either<E, B> =>
    fa.fold(
      e => Either.left(e),
      a => Either.right(f(a))
    ),

  flatMap: <A, B>(
    fa: Either<E, A>,
    f: (a: A) => Either<E, B>
  ): Either<E, B> =>
    fa.fold(
      e => Either.left(e),
      a => f(a)
    )
});

// Validation functions
type ValidationError = string;

function validateEmail(email: string): Either<ValidationError, string> {
  return email.includes('@')
    ? Either.right(email)
    : Either.left('Invalid email');
}

function validateAge(age: number): Either<ValidationError, number> {
  return age >= 18
    ? Either.right(age)
    : Either.left('Must be 18 or older');
}

// Generic validation pipeline
function validate<E, A, B, C>(
  M: Monad2<'Either', E>,
  fa: Kind2<'Either', E, A>,
  f: (a: A) => Kind2<'Either', E, B>
): Kind2<'Either', E, B> {
  return M.flatMap(fa, f);
}

// Usage
const emailResult = validateEmail('test@example.com');
const validationMonad = EitherMonad<ValidationError>();

const result = validationMonad.flatMap(
  emailResult,
  email => Either.right(email.toLowerCase())
);
```

## Traversable HKT

Traversable lets us flip container nesting:

```typescript
interface Traversable<T extends keyof URItoKind<any>> extends Functor<T> {
  traverse<F extends keyof URItoKind<any>, A, B>(
    A: Applicative<F>,
    ta: Kind<T, A>,
    f: (a: A) => Kind<F, B>
  ): Kind<F, Kind<T, B>>;
}

// Array traversable
const ArrayTraversable: Traversable<'Array'> = {
  ...ArrayFunctor,

  traverse: <F extends keyof URItoKind<any>, A, B>(
    A: Applicative<F>,
    ta: A[],
    f: (a: A) => Kind<F, B>
  ): Kind<F, B[]> => {
    if (ta.length === 0) {
      return A.pure([]);
    }

    const [head, ...tail] = ta;
    const fb = f(head);
    const fbs = ArrayTraversable.traverse(A, tail, f);

    return A.ap(
      A.map(fb, (b: B) => (bs: B[]) => [b, ...bs]),
      fbs
    );
  }
};

// Example: validate array of values
function validateAll(
  emails: string[]
): Either<ValidationError, string[]> {
  const M = EitherMonad<ValidationError>();

  return ArrayTraversable.traverse(
    {
      ...M,
      ap: (fab, fa) => M.flatMap(fab, f => M.map(fa, a => f(a)))
    } as any,
    emails,
    validateEmail
  ) as any;
}

const emails = ['a@b.com', 'test@example.com'];
const validated = validateAll(emails);
// Right(['a@b.com', 'test@example.com'])

const invalidEmails = ['a@b.com', 'invalid'];
const failed = validateAll(invalidEmails);
// Left('Invalid email')
```

## Real-World: Effect System

```typescript
// IO effect type
class IO<A> {
  constructor(private readonly effect: () => A) {}

  static of<A>(a: A): IO<A> {
    return new IO(() => a);
  }

  run(): A {
    return this.effect();
  }

  map<B>(f: (a: A) => B): IO<B> {
    return new IO(() => f(this.effect()));
  }

  flatMap<B>(f: (a: A) => IO<B>): IO<B> {
    return new IO(() => f(this.effect()).run());
  }
}

// Register IO
interface URItoKind<A> {
  Array: A[];
  Promise: Promise<A>;
  Maybe: Maybe<A>;
  IO: IO<A>;
}

// IO monad instance
const IOMonad: Monad<'IO'> = {
  pure: <A>(a: A) => IO.of(a),

  map: <A, B>(fa: IO<A>, f: (a: A) => B): IO<B> =>
    fa.map(f),

  ap: <A, B>(fab: IO<(a: A) => B>, fa: IO<A>): IO<B> =>
    fab.flatMap(f => fa.map(f)),

  flatMap: <A, B>(fa: IO<A>, f: (a: A) => IO<B>): IO<B> =>
    fa.flatMap(f)
};

// Generic effect composition
function sequence<F extends keyof URItoKind<any>, A>(
  M: Monad<F>,
  effects: Kind<F, A>[]
): Kind<F, A[]> {
  if (effects.length === 0) {
    return M.pure([]);
  }

  const [head, ...tail] = effects;

  return M.flatMap(head, a =>
    M.map(sequence(M, tail), as => [a, ...as])
  );
}

// Example: compose IO effects
const readFile = (path: string): IO<string> =>
  new IO(() => {
    // Imagine actual file reading
    return `contents of ${path}`;
  });

const writeFile = (path: string, content: string): IO<void> =>
  new IO(() => {
    console.log(`Writing to ${path}: ${content}`);
  });

// Compose effects
const program = IOMonad.flatMap(
  readFile('input.txt'),
  content => IOMonad.flatMap(
    writeFile('output.txt', content.toUpperCase()),
    () => IO.of(content)
  )
);

// Effects are lazy until run
program.run();
```

## Key Takeaways

1. **HKTs abstract over type constructors** - write code generic over `F<_>`
2. **TypeScript simulation** - use URI registry pattern for HKT encoding
3. **Type classes** - Functor, Applicative, Monad become reusable interfaces
4. **Generic abstractions** - write functions that work across any container
5. **Effect systems** - compose and sequence effects generically

Higher-kinded types enable powerful abstractions found in languages like Haskell and Scala. While TypeScript requires encoding tricks, the patterns unlock highly reusable, type-safe code.
