---
title: Effect Systems - Tracking and Controlling Side Effects
timestamp: 2025-11-16 00:00:00+00:00
description: Master effect systems to make side effects explicit, composable, and controllable through algebraic effects and effect handlers.
tags: [fp, effects, algebraic, advanced]
toc: true
---

# Effect Systems - Tracking and Controlling Side Effects

Effect systems make side effects explicit in function signatures, allowing you to track, compose, and handle effects separately from business logic. This separation enables powerful abstractions and easier testing.

## The Problem with Hidden Effects

```typescript
// What effects does this function have?
function processUser(id: number): User {
  const user = fetchFromDatabase(id);  // I/O!
  logActivity('User accessed');         // Logging!
  if (!user) {
    throw new Error('Not found');       // Exception!
  }
  return user;
}

// Type signature lies - claims to be pure
```

Effects are hidden:
- **Database access** - I/O dependency
- **Logging** - side effect
- **Exceptions** - control flow disruption

## Effect as Data

Represent effects as data structures:

```typescript
// Effect type - describes computation, doesn't execute
type Effect<E, A> = {
  tag: 'Pure';
  value: A;
} | {
  tag: 'Effectful';
  effect: E;
  continue: (result: any) => Effect<E, A>;
};

// Pure value (no effects)
function pure<A>(value: A): Effect<never, A> {
  return { tag: 'Pure', value };
}

// Effectful computation
function effectful<E, A>(
  effect: E,
  continue: (result: any) => Effect<E, A>
): Effect<E, A> {
  return { tag: 'Effectful', effect, continue };
}

// Map over effect
function map<E, A, B>(
  eff: Effect<E, A>,
  f: (a: A) => B
): Effect<E, B> {
  if (eff.tag === 'Pure') {
    return pure(f(eff.value));
  }

  return effectful(
    eff.effect,
    result => map(eff.continue(result), f)
  );
}

// Bind effects together
function flatMap<E, A, B>(
  eff: Effect<E, A>,
  f: (a: A) => Effect<E, B>
): Effect<E, B> {
  if (eff.tag === 'Pure') {
    return f(eff.value);
  }

  return effectful(
    eff.effect,
    result => flatMap(eff.continue(result), f)
  );
}
```

## Algebraic Effects

Define effects as operations:

```typescript
// Effect operations
type ConsoleEffect =
  | { type: 'Log'; message: string }
  | { type: 'Read' };

type HttpEffect = {
  type: 'Fetch';
  url: string;
};

type DatabaseEffect =
  | { type: 'Query'; sql: string }
  | { type: 'Execute'; sql: string };

// Combined effects
type AppEffect = ConsoleEffect | HttpEffect | DatabaseEffect;

// Perform an effect
function perform<E>(effect: E): Effect<E, any> {
  return effectful(effect, result => pure(result));
}

// Example: console logging
function log(message: string): Effect<ConsoleEffect, void> {
  return perform({ type: 'Log', message });
}

function readLine(): Effect<ConsoleEffect, string> {
  return perform({ type: 'Read' });
}

// Example: HTTP
function fetch(url: string): Effect<HttpEffect, Response> {
  return perform({ type: 'Fetch', url });
}

// Example: database
function query(sql: string): Effect<DatabaseEffect, any[]> {
  return perform({ type: 'Query', sql });
}
```

## Effect Handlers

Interpret effects by providing handlers:

```typescript
// Handler for an effect
type Handler<E, R> = (effect: E) => R;

// Run effect with handler
function handle<E, A, R>(
  eff: Effect<E, A>,
  handler: Handler<E, any>
): A {
  if (eff.tag === 'Pure') {
    return eff.value;
  }

  const result = handler(eff.effect);
  return handle(eff.continue(result), handler);
}

// Console handler (real implementation)
const consoleHandler: Handler<ConsoleEffect, any> = (effect) => {
  switch (effect.type) {
    case 'Log':
      console.log(effect.message);
      return undefined;
    case 'Read':
      // In real code, use readline or similar
      return 'user input';
  }
};

// Console handler (test mock)
const mockConsoleHandler = (() => {
  const logs: string[] = [];

  return {
    handler: (effect: ConsoleEffect) => {
      if (effect.type === 'Log') {
        logs.push(effect.message);
        return undefined;
      }
      return 'mocked input';
    },
    getLogs: () => logs
  };
})();

// HTTP handler
const httpHandler: Handler<HttpEffect, Promise<Response>> = (effect) => {
  return window.fetch(effect.url);
};

// Database handler
const dbHandler: Handler<DatabaseEffect, any> = (effect) => {
  switch (effect.type) {
    case 'Query':
      // Execute query
      return [{ id: 1, name: 'Alice' }];
    case 'Execute':
      // Execute command
      return { rowsAffected: 1 };
  }
};
```

## Composing Effects

```typescript
// User service with effects
function getUser(id: number): Effect<HttpEffect | ConsoleEffect, User> {
  return flatMap(
    log(`Fetching user ${id}`),
    () => flatMap(
      fetch(`/api/users/${id}`),
      response => flatMap(
        log('User fetched successfully'),
        () => pure(response.json())
      )
    )
  );
}

// Save user with multiple effects
function saveUser(
  user: User
): Effect<DatabaseEffect | ConsoleEffect, void> {
  return flatMap(
    log(`Saving user ${user.id}`),
    () => flatMap(
      query(`INSERT INTO users VALUES (${user.id}, '${user.name}')`),
      () => log('User saved')
    )
  );
}

// Compose different effects
function processUser(
  id: number
): Effect<HttpEffect | DatabaseEffect | ConsoleEffect, void> {
  return flatMap(
    getUser(id),
    user => saveUser(user)
  );
}

// Handle all effects
function handleAppEffect(effect: AppEffect): any {
  if ('type' in effect) {
    switch (effect.type) {
      case 'Log':
        return consoleHandler(effect);
      case 'Read':
        return consoleHandler(effect);
      case 'Fetch':
        return httpHandler(effect);
      case 'Query':
      case 'Execute':
        return dbHandler(effect);
    }
  }
}

// Run program
const program = processUser(1);
handle(program, handleAppEffect);
```

## Effect Polymorphism

```typescript
// Generic effect constraint
type HasLog = { type: 'Log'; message: string };

// Function polymorphic over effects
function logTwice<E extends HasLog>(
  message: string
): Effect<E, void> {
  return flatMap(
    perform<E>({ type: 'Log', message } as E),
    () => perform<E>({ type: 'Log', message } as E)
  );
}

// Works with any effect type that includes Log
const consoleEffect: Effect<ConsoleEffect, void> =
  logTwice('Hello');

type ExtendedEffect = ConsoleEffect | { type: 'Other' };
const extendedEffect: Effect<ExtendedEffect, void> =
  logTwice('Hello');
```

## Scoped Effects

```typescript
// Scoped resource management
type ResourceEffect<R> = {
  type: 'Acquire';
  resource: string;
  cleanup: (r: R) => void;
};

function acquire<R>(
  resource: string,
  cleanup: (r: R) => void
): Effect<ResourceEffect<R>, R> {
  return perform({ type: 'Acquire', resource, cleanup });
}

// Bracket pattern: acquire, use, release
function bracket<E, R, A>(
  acquire: Effect<E, R>,
  use: (r: R) => Effect<E, A>,
  release: (r: R) => Effect<E, void>
): Effect<E, A> {
  return flatMap(acquire, resource =>
    flatMap(
      use(resource),
      result => flatMap(
        release(resource),
        () => pure(result)
      )
    )
  );
}

// Example: file handling
type FileHandle = { path: string; handle: number };

function openFile(path: string): Effect<ResourceEffect<FileHandle>, FileHandle> {
  return acquire(
    path,
    (fh) => console.log(`Closing ${fh.path}`)
  );
}

function readFile(fh: FileHandle): Effect<never, string> {
  return pure(`Contents of ${fh.path}`);
}

function closeFile(fh: FileHandle): Effect<never, void> {
  return pure(undefined);
}

// Safe file reading with automatic cleanup
const safeRead = (path: string) =>
  bracket(
    openFile(path),
    fh => readFile(fh),
    fh => closeFile(fh)
  );
```

## Extensible Effects

```typescript
// Open effect type - can be extended
type Open = any;

// Effect with open extension point
type ExtEffect<E, A> = Effect<E | Open, A>;

// Extend with new effects
type WithAuth<E, A> = Effect<E | { type: 'CheckAuth' }, A>;

function checkAuth<E>(): WithAuth<E, boolean> {
  return perform({ type: 'CheckAuth' });
}

// Compose with existing effects
function protectedFetch<E>(
  url: string
): WithAuth<E | HttpEffect, Response> {
  return flatMap(
    checkAuth<E | HttpEffect>(),
    authed => {
      if (!authed) {
        throw new Error('Unauthorized');
      }
      return fetch(url);
    }
  );
}
```

## Real-World: Dependency Injection

```typescript
// Service effects
type ServiceEffect =
  | { type: 'GetConfig'; key: string }
  | { type: 'GetLogger' }
  | { type: 'GetDatabase' };

// Access services through effects
function getConfig(key: string): Effect<ServiceEffect, any> {
  return perform({ type: 'GetConfig', key });
}

function getLogger(): Effect<ServiceEffect, Logger> {
  return perform({ type: 'GetLogger' });
}

function getDatabase(): Effect<ServiceEffect, Database> {
  return perform({ type: 'GetDatabase' });
}

// Business logic using services
function createUser(
  name: string
): Effect<ServiceEffect, User> {
  return flatMap(
    getDatabase(),
    db => flatMap(
      getLogger(),
      logger => {
        logger.info(`Creating user: ${name}`);
        const user = db.insert({ name });
        return pure(user);
      }
    )
  );
}

// Production handler
const productionServices: Handler<ServiceEffect, any> = (effect) => {
  switch (effect.type) {
    case 'GetConfig':
      return process.env[effect.key];
    case 'GetLogger':
      return console;
    case 'GetDatabase':
      return realDatabase;
  }
};

// Test handler
const testServices: Handler<ServiceEffect, any> = (effect) => {
  switch (effect.type) {
    case 'GetConfig':
      return 'test-value';
    case 'GetLogger':
      return { info: () => {}, error: () => {} };
    case 'GetDatabase':
      return mockDatabase;
  }
};

// Run with different handlers
const prodUser = handle(createUser('Alice'), productionServices);
const testUser = handle(createUser('Bob'), testServices);
```

## Effect Tracking at Type Level

```typescript
// Track effects in type signature
type Program<E extends string, A> = {
  effects: E[];
  run: () => Effect<any, A>;
};

// Construct program with effect tracking
function program<E extends string, A>(
  effects: E[],
  run: () => Effect<any, A>
): Program<E, A> {
  return { effects, run };
}

// Compose programs - union of effects
function composePrograms<E1 extends string, E2 extends string, A, B>(
  p1: Program<E1, A>,
  p2: Program<E2, B>
): Program<E1 | E2, B> {
  return program(
    [...p1.effects, ...p2.effects],
    () => flatMap(p1.run(), () => p2.run())
  );
}

// Example programs
const logProgram = program(
  ['Console'],
  () => log('Hello')
);

const httpProgram = program(
  ['Http'],
  () => fetch('/api/data')
);

// Combined: ['Console', 'Http']
const combined = composePrograms(logProgram, httpProgram);
```

## Key Takeaways

1. **Effects as data** - represent side effects as values
2. **Separation** - business logic separate from effect interpretation
3. **Handlers** - provide multiple interpretations (prod, test, etc.)
4. **Composition** - combine effects freely, handle uniformly
5. **Type safety** - track effects in type signatures

Effect systems make side effects explicit, testable, and composable. They bring the benefits of pure functional programming to real-world applications that need I/O, state, and other effects.
