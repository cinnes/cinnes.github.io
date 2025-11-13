---
title: Free Monads - Separating Description from Interpretation
timestamp: 2025-11-17 00:00:00+00:00
description: Build programs as data structures using free monads to completely separate program description from execution, enabling multiple interpreters and optimizations.
tags: [fp, monads, free, advanced]
toc: true
---

# Free Monads - Separating Description from Interpretation

Free monads let you build programs as pure data structures, completely separating *what* your program does from *how* it does it. This enables multiple interpreters, optimizations, and testing without changing business logic.

## The Concept

A free monad is the "freest" monad you can build from a functor—it has no behavior except what's required by monad laws. You define operations, build programs, then interpret them later.

```typescript
// Free monad structure
type Free<F, A> =
  | { tag: 'Pure'; value: A }
  | { tag: 'Free'; functor: F };

// Pure value
function pure<F, A>(value: A): Free<F, A> {
  return { tag: 'Pure', value };
}

// Wrap a functor
function liftF<F, A>(functor: F): Free<F, A> {
  return { tag: 'Free', functor };
}
```

## Building a DSL

Define operations as a functor:

```typescript
// Console operations
type ConsoleF<A> =
  | { type: 'Print'; message: string; next: A }
  | { type: 'Read'; continue: (input: string) => A };

// Functor instance for ConsoleF
function mapConsole<A, B>(
  fa: ConsoleF<A>,
  f: (a: A) => B
): ConsoleF<B> {
  switch (fa.type) {
    case 'Print':
      return { type: 'Print', message: fa.message, next: f(fa.next) };
    case 'Read':
      return { type: 'Read', continue: (input) => f(fa.continue(input)) };
  }
}

// Smart constructors
function print(message: string): Free<ConsoleF<any>, void> {
  return liftF({ type: 'Print', message, next: undefined });
}

function read(): Free<ConsoleF<any>, string> {
  return liftF({
    type: 'Read',
    continue: (input: string) => input
  });
}
```

## Monad Operations

```typescript
// Map over Free
function map<F, A, B>(
  fa: Free<F, A>,
  f: (a: A) => B
): Free<F, B> {
  if (fa.tag === 'Pure') {
    return pure(f(fa.value));
  }

  // Need to map the functor F
  return liftF(fa.functor);  // Simplified - see full version below
}

// FlatMap (bind)
function flatMap<F, A, B>(
  fa: Free<F, A>,
  f: (a: A) => Free<F, B>
): Free<F, B> {
  if (fa.tag === 'Pure') {
    return f(fa.value);
  }

  return liftF(fa.functor);  // Simplified
}
```

## Full Free Monad Implementation

```typescript
// Proper free monad with continuation
type Free<F, A> =
  | { tag: 'Pure'; value: A }
  | { tag: 'Free'; functor: F; continue: (a: any) => Free<F, A> };

function pure<F, A>(value: A): Free<F, A> {
  return { tag: 'Pure', value };
}

function liftF<F, A>(
  functor: F,
  continue: (a: any) => Free<F, A>
): Free<F, A> {
  return { tag: 'Free', functor, continue };
}

// Smart constructors for console
function print(message: string): Free<ConsoleF<any>, void> {
  return liftF<ConsoleF<any>, void>(
    { type: 'Print', message, next: undefined },
    () => pure(undefined)
  );
}

function read(): Free<ConsoleF<any>, string> {
  return liftF<ConsoleF<any>, string>(
    { type: 'Read', continue: (x) => x },
    (input: string) => pure(input)
  );
}

// FlatMap implementation
function flatMap<F, A, B>(
  fa: Free<F, A>,
  f: (a: A) => Free<F, B>
): Free<F, B> {
  if (fa.tag === 'Pure') {
    return f(fa.value);
  }

  return liftF(
    fa.functor,
    (a) => flatMap(fa.continue(a), f)
  );
}
```

## Building Programs

```typescript
// Helper for sequencing
function then<F, A, B>(
  fa: Free<F, A>,
  fb: Free<F, B>
): Free<F, B> {
  return flatMap(fa, () => fb);
}

// Example program
function greetUser(): Free<ConsoleF<any>, void> {
  return flatMap(
    print('What is your name?'),
    () => flatMap(
      read(),
      (name) => print(`Hello, ${name}!`)
    )
  );
}

// More complex program
function calculator(): Free<ConsoleF<any>, number> {
  return flatMap(
    print('Enter first number:'),
    () => flatMap(
      read(),
      (a) => flatMap(
        print('Enter second number:'),
        () => flatMap(
          read(),
          (b) => {
            const result = Number(a) + Number(b);
            return flatMap(
              print(`Result: ${result}`),
              () => pure(result)
            );
          }
        )
      )
    )
  );
}
```

## Interpreters

The power of free monads: multiple interpreters for the same program.

```typescript
// Interpreter: run in console
function interpretConsole<A>(
  program: Free<ConsoleF<any>, A>
): A {
  if (program.tag === 'Pure') {
    return program.value;
  }

  const { functor, continue: cont } = program;

  switch (functor.type) {
    case 'Print':
      console.log(functor.message);
      return interpretConsole(cont(functor.next));

    case 'Read':
      const input = prompt('Input:') || '';
      const next = functor.continue(input);
      return interpretConsole(cont(next));
  }
}

// Interpreter: collect trace (for testing)
function interpretTrace<A>(
  program: Free<ConsoleF<any>, A>,
  inputs: string[] = []
): [A, string[]] {
  const trace: string[] = [];

  function run(prog: Free<ConsoleF<any>, A>): A {
    if (prog.tag === 'Pure') {
      return prog.value;
    }

    const { functor, continue: cont } = prog;

    switch (functor.type) {
      case 'Print':
        trace.push(`Print: ${functor.message}`);
        return run(cont(functor.next));

      case 'Read':
        const input = inputs.shift() || '';
        trace.push(`Read: ${input}`);
        const next = functor.continue(input);
        return run(cont(next));
    }
  }

  const result = run(program);
  return [result, trace];
}

// Test program without I/O!
const program = greetUser();
const [_, trace] = interpretTrace(program, ['Alice']);
// trace: ['Print: What is your name?', 'Read: Alice', 'Print: Hello, Alice!']
```

## HTTP Client DSL

```typescript
// HTTP operations
type HttpF<A> =
  | { type: 'Get'; url: string; continue: (data: any) => A }
  | { type: 'Post'; url: string; body: any; continue: (data: any) => A }
  | { type: 'Delete'; url: string; continue: () => A };

// Smart constructors
function get(url: string): Free<HttpF<any>, any> {
  return liftF(
    { type: 'Get', url, continue: (x) => x },
    (data) => pure(data)
  );
}

function post(url: string, body: any): Free<HttpF<any>, any> {
  return liftF(
    { type: 'Post', url, body, continue: (x) => x },
    (data) => pure(data)
  );
}

function del(url: string): Free<HttpF<any>, void> {
  return liftF(
    { type: 'Delete', url, continue: () => undefined },
    () => pure(undefined)
  );
}

// Build API client
function createUser(name: string): Free<HttpF<any>, User> {
  return post('/api/users', { name });
}

function getUser(id: number): Free<HttpF<any>, User> {
  return get(`/api/users/${id}`);
}

function deleteUser(id: number): Free<HttpF<any>, void> {
  return del(`/api/users/${id}`);
}

// Compose operations
function updateUserName(
  id: number,
  newName: string
): Free<HttpF<any>, User> {
  return flatMap(
    getUser(id),
    (user) => post(`/api/users/${id}`, { ...user, name: newName })
  );
}

// Production interpreter
async function interpretHttp<A>(
  program: Free<HttpF<any>, A>
): Promise<A> {
  if (program.tag === 'Pure') {
    return program.value;
  }

  const { functor, continue: cont } = program;

  switch (functor.type) {
    case 'Get':
      const getResp = await fetch(functor.url);
      const getData = await getResp.json();
      const getNext = functor.continue(getData);
      return interpretHttp(cont(getNext));

    case 'Post':
      const postResp = await fetch(functor.url, {
        method: 'POST',
        body: JSON.stringify(functor.body)
      });
      const postData = await postResp.json();
      const postNext = functor.continue(postData);
      return interpretHttp(cont(postNext));

    case 'Delete':
      await fetch(functor.url, { method: 'DELETE' });
      const delNext = functor.continue();
      return interpretHttp(cont(delNext));
  }
}

// Mock interpreter for testing
function interpretHttpMock<A>(
  program: Free<HttpF<any>, A>,
  mock: Record<string, any>
): A {
  if (program.tag === 'Pure') {
    return program.value;
  }

  const { functor, continue: cont } = program;

  switch (functor.type) {
    case 'Get':
      const getData = mock[functor.url] || null;
      const getNext = functor.continue(getData);
      return interpretHttpMock(cont(getNext), mock);

    case 'Post':
      const postData = { id: 1, ...functor.body };
      const postNext = functor.continue(postData);
      return interpretHttpMock(cont(postNext), mock);

    case 'Delete':
      const delNext = functor.continue();
      return interpretHttpMock(cont(delNext), mock);
  }
}
```

## Combining DSLs

```typescript
// Combined operations
type AppF<A> = ConsoleF<A> | HttpF<A>;

// Lift operations
function liftConsole<A>(fa: ConsoleF<A>): Free<AppF<A>, any> {
  return liftF(fa, (a) => pure(a));
}

function liftHttp<A>(fa: HttpF<A>): Free<AppF<A>, any> {
  return liftF(fa, (a) => pure(a));
}

// Combined program
function fetchAndDisplay(id: number): Free<AppF<any>, void> {
  return flatMap(
    print('Fetching user...'),
    () => flatMap(
      get(`/api/users/${id}`),
      (user) => print(`User: ${user.name}`)
    )
  );
}

// Combined interpreter
async function interpretApp<A>(
  program: Free<AppF<any>, A>
): Promise<A> {
  if (program.tag === 'Pure') {
    return program.value;
  }

  const { functor, continue: cont } = program;

  if ('type' in functor) {
    switch (functor.type) {
      case 'Print':
        console.log(functor.message);
        return interpretApp(cont(functor.next));

      case 'Read':
        const input = prompt('Input:') || '';
        const next = functor.continue(input);
        return interpretApp(cont(next));

      case 'Get':
        const resp = await fetch(functor.url);
        const data = await resp.json();
        const getNext = functor.continue(data);
        return interpretApp(cont(getNext));

      // ... other cases
    }
  }

  throw new Error('Unknown functor');
}
```

## Optimization: Inspect Before Running

```typescript
// Optimize: batch HTTP requests
function optimize<A>(program: Free<HttpF<any>, A>): Free<HttpF<any>, A> {
  const requests: Array<{ type: 'Get' | 'Post'; url: string }> = [];

  function collectRequests(prog: Free<HttpF<any>, any>): void {
    if (prog.tag === 'Free') {
      const { functor } = prog;
      if (functor.type === 'Get' || functor.type === 'Post') {
        requests.push({ type: functor.type, url: functor.url });
      }
    }
  }

  collectRequests(program);

  // Could batch these, reorder for caching, etc.
  console.log('Requests to execute:', requests);

  return program;
}

// Test optimized execution
const prog = flatMap(
  get('/api/users/1'),
  () => get('/api/users/2')
);

const optimized = optimize(prog);
// Logs: Requests to execute: [{ type: 'Get', url: '/api/users/1' }, ...]
```

## Real-World: Database DSL

```typescript
// Database operations
type DbF<A> =
  | { type: 'Query'; sql: string; continue: (rows: any[]) => A }
  | { type: 'Execute'; sql: string; continue: (result: any) => A }
  | { type: 'Transaction'; operations: Free<DbF<any>, any>[]; continue: (results: any[]) => A };

function query(sql: string): Free<DbF<any>, any[]> {
  return liftF(
    { type: 'Query', sql, continue: (x) => x },
    (rows) => pure(rows)
  );
}

function execute(sql: string): Free<DbF<any>, any> {
  return liftF(
    { type: 'Execute', sql, continue: (x) => x },
    (result) => pure(result)
  );
}

function transaction(
  operations: Free<DbF<any>, any>[]
): Free<DbF<any>, any[]> {
  return liftF(
    { type: 'Transaction', operations, continue: (x) => x },
    (results) => pure(results)
  );
}

// Business logic
function transferFunds(
  fromId: number,
  toId: number,
  amount: number
): Free<DbF<any>, void> {
  return flatMap(
    transaction([
      execute(`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${fromId}`),
      execute(`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${toId}`)
    ]),
    () => pure(undefined)
  );
}

// Interpreter: real database
async function interpretDb<A>(program: Free<DbF<any>, A>): Promise<A> {
  if (program.tag === 'Pure') {
    return program.value;
  }

  const { functor, continue: cont } = program;

  switch (functor.type) {
    case 'Query':
      const rows = await db.query(functor.sql);
      const queryNext = functor.continue(rows);
      return interpretDb(cont(queryNext));

    case 'Execute':
      const result = await db.execute(functor.sql);
      const execNext = functor.continue(result);
      return interpretDb(cont(execNext));

    case 'Transaction':
      await db.beginTransaction();
      try {
        const results = await Promise.all(
          functor.operations.map(interpretDb)
        );
        await db.commit();
        const txNext = functor.continue(results);
        return interpretDb(cont(txNext));
      } catch (e) {
        await db.rollback();
        throw e;
      }
  }
}
```

## Key Takeaways

1. **Separation of concerns** - program description vs execution
2. **Multiple interpreters** - prod, test, mock, optimize
3. **Inspection** - analyze programs before running
4. **Type safety** - operations are well-typed data
5. **Composition** - build complex programs from simple operations

Free monads enable truly declarative programming. Build programs as pure data, interpret them however you need. This is the foundation of libraries like Cats Effect and ZIO.
