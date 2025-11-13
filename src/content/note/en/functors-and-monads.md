---
title: Functors and Monads - Containers for Safer Code
timestamp: 2025-11-07 00:00:00+00:00
description: Understand functors and monads to write safer code that handles nulls, errors, and async operations elegantly.
tags: [fp, functors, monads, maybe]
toc: true
---

# Functors and Monads - Containers for Safer Code

Functors and monads are patterns for wrapping values in containers that provide a consistent interface for transformation. They help handle null values, errors, and async operations safely and elegantly.

## Functors - Mappable Containers

A functor is any object that implements a `map` method, allowing you to transform the value inside without unwrapping it.

### Array as a Functor

```javascript
// Arrays are functors
const numbers = [1, 2, 3];

numbers.map(x => x * 2);     // [2, 4, 6]
numbers.map(x => x.toString()); // ['1', '2', '3']
```

### Custom Functor

```javascript
class Box {
  constructor(value) {
    this.value = value;
  }

  map(fn) {
    return new Box(fn(this.value));
  }

  inspect() {
    return `Box(${this.value})`;
  }
}

// Usage
Box(2)
  .map(x => x + 1)
  .map(x => x * 2);  // Box(6)
```

## The Maybe Functor

Maybe handles null/undefined values safely, preventing null reference errors.

### Implementation

```javascript
class Maybe {
  constructor(value) {
    this.value = value;
  }

  static of(value) {
    return new Maybe(value);
  }

  isNothing() {
    return this.value === null || this.value === undefined;
  }

  map(fn) {
    return this.isNothing()
      ? Maybe.of(null)
      : Maybe.of(fn(this.value));
  }

  getOrElse(defaultValue) {
    return this.isNothing() ? defaultValue : this.value;
  }

  inspect() {
    return this.isNothing()
      ? 'Maybe(Nothing)'
      : `Maybe(${this.value})`;
  }
}
```

### Usage

```javascript
// Without Maybe
function getStreetName(user) {
  if (user && user.address && user.address.street) {
    return user.address.street.toUpperCase();
  }
  return 'UNKNOWN';
}

// With Maybe
function getStreetName(user) {
  return Maybe.of(user)
    .map(u => u.address)
    .map(a => a.street)
    .map(s => s.toUpperCase())
    .getOrElse('UNKNOWN');
}

const user = {
  address: {
    street: 'Main St'
  }
};

getStreetName(user);  // 'MAIN ST'
getStreetName(null);  // 'UNKNOWN'
```

## The Either Functor

Either represents a value that can be one of two types: Right (success) or Left (failure). It's perfect for error handling.

### Implementation

```javascript
class Left {
  constructor(value) {
    this.value = value;
  }

  map() {
    return this;  // Doesn't transform, passes error through
  }

  flatMap() {
    return this;
  }

  getOrElse(defaultValue) {
    return defaultValue;
  }

  fold(leftFn, rightFn) {
    return leftFn(this.value);
  }

  inspect() {
    return `Left(${this.value})`;
  }
}

class Right {
  constructor(value) {
    this.value = value;
  }

  map(fn) {
    return new Right(fn(this.value));
  }

  flatMap(fn) {
    return fn(this.value);
  }

  getOrElse() {
    return this.value;
  }

  fold(leftFn, rightFn) {
    return rightFn(this.value);
  }

  inspect() {
    return `Right(${this.value})`;
  }
}
```

### Usage

```javascript
function parseJSON(str) {
  try {
    return new Right(JSON.parse(str));
  } catch (error) {
    return new Left(error.message);
  }
}

// Success path
parseJSON('{"name":"John"}')
  .map(obj => obj.name)
  .map(name => name.toUpperCase())
  .getOrElse('DEFAULT');  // 'JOHN'

// Error path
parseJSON('invalid json')
  .map(obj => obj.name)
  .map(name => name.toUpperCase())
  .getOrElse('DEFAULT');  // 'DEFAULT'
```

## Monads - Flattenable Functors

A monad is a functor that also implements `flatMap` (also called `chain` or `bind`). This prevents nested containers.

### The Problem

```javascript
// Nested containers
Maybe.of(Maybe.of(2))  // Maybe(Maybe(2))
```

### The Solution: flatMap

```javascript
class Maybe {
  // ... previous implementation

  flatMap(fn) {
    return this.isNothing()
      ? Maybe.of(null)
      : fn(this.value);
  }

  // Alias for flatMap
  chain(fn) {
    return this.flatMap(fn);
  }
}

// Usage
function findUser(id) {
  return Maybe.of(users.find(u => u.id === id));
}

function getAddress(user) {
  return Maybe.of(user.address);
}

// Without flatMap - nested Maybes
findUser(1)
  .map(getAddress);  // Maybe(Maybe(address))

// With flatMap - flat structure
findUser(1)
  .flatMap(getAddress);  // Maybe(address)
```

## Practical Examples

### Safe Property Access

```javascript
function prop(key) {
  return obj => Maybe.of(obj).map(o => o[key]);
}

function path(keys) {
  return obj => keys.reduce(
    (maybe, key) => maybe.flatMap(prop(key)),
    Maybe.of(obj)
  );
}

const user = {
  profile: {
    address: {
      city: 'NYC'
    }
  }
};

path(['profile', 'address', 'city'])(user)
  .getOrElse('Unknown');  // 'NYC'

path(['profile', 'phone'])(user)
  .getOrElse('Unknown');  // 'Unknown'
```

### Validation Chain

```javascript
function validateEmail(email) {
  return email.includes('@')
    ? new Right(email)
    : new Left('Invalid email');
}

function validateLength(str) {
  return str.length >= 3
    ? new Right(str)
    : new Left('Too short');
}

function normalizeEmail(email) {
  return new Right(email.toLowerCase().trim());
}

// Chain validations
function processEmail(email) {
  return Maybe.of(email)
    .map(e => e.trim())
    .flatMap(e =>
      validateEmail(e)
        .flatMap(validateLength)
        .flatMap(normalizeEmail)
    );
}

processEmail('  JOHN@EXAMPLE.COM  ')
  .fold(
    error => `Error: ${error}`,
    email => `Valid: ${email}`
  );
```

### Async Operations

```javascript
class Task {
  constructor(fork) {
    this.fork = fork;
  }

  static of(value) {
    return new Task((reject, resolve) => resolve(value));
  }

  map(fn) {
    return new Task((reject, resolve) =>
      this.fork(reject, value => resolve(fn(value)))
    );
  }

  flatMap(fn) {
    return new Task((reject, resolve) =>
      this.fork(reject, value =>
        fn(value).fork(reject, resolve)
      )
    );
  }
}

// Usage
function getUser(id) {
  return new Task((reject, resolve) => {
    fetch(`/api/users/${id}`)
      .then(r => r.json())
      .then(resolve)
      .catch(reject);
  });
}

function getPosts(userId) {
  return new Task((reject, resolve) => {
    fetch(`/api/posts?userId=${userId}`)
      .then(r => r.json())
      .then(resolve)
      .catch(reject);
  });
}

// Chain async operations
getUser(1)
  .flatMap(user => getPosts(user.id))
  .map(posts => posts.map(p => p.title))
  .fork(
    error => console.error(error),
    titles => console.log(titles)
  );
```

## List Monad

```javascript
class List {
  constructor(values) {
    this.values = values;
  }

  static of(value) {
    return new List([value]);
  }

  map(fn) {
    return new List(this.values.map(fn));
  }

  flatMap(fn) {
    return new List(
      this.values.flatMap(v => fn(v).values)
    );
  }
}

// Cartesian product using flatMap
List.of(1)
  .flatMap(x =>
    List.of(x * 2).flatMap(y =>
      List.of([x, y])
    )
  );  // List([[1, 2]])

// Multiple combinations
new List([1, 2, 3])
  .flatMap(x =>
    new List(['a', 'b']).map(y =>
      [x, y]
    )
  );
// List([[1,'a'], [1,'b'], [2,'a'], [2,'b'], [3,'a'], [3,'b']])
```

## IO Monad (Lazy Effects)

```javascript
class IO {
  constructor(effect) {
    this.effect = effect;
  }

  static of(value) {
    return new IO(() => value);
  }

  map(fn) {
    return new IO(() => fn(this.effect()));
  }

  flatMap(fn) {
    return new IO(() => fn(this.effect()).effect());
  }

  run() {
    return this.effect();
  }
}

// Lazy console.log
const log = msg => new IO(() => console.log(msg));

// Lazy random
const random = () => new IO(() => Math.random());

// Compose effects without executing
const program = random()
  .map(n => n * 10)
  .flatMap(n => log(`Random: ${n}`))
  .map(() => 'done');

// Execute when ready
program.run();  // Logs: "Random: 7.234..."
```

## Real-World: API Client

```javascript
class ApiResult {
  constructor(fork) {
    this.fork = fork;
  }

  static success(value) {
    return new ApiResult((onError, onSuccess) => onSuccess(value));
  }

  static failure(error) {
    return new ApiResult((onError, onSuccess) => onError(error));
  }

  static fromPromise(promise) {
    return new ApiResult((onError, onSuccess) =>
      promise.then(onSuccess).catch(onError)
    );
  }

  map(fn) {
    return new ApiResult((onError, onSuccess) =>
      this.fork(onError, value => onSuccess(fn(value)))
    );
  }

  flatMap(fn) {
    return new ApiResult((onError, onSuccess) =>
      this.fork(onError, value =>
        fn(value).fork(onError, onSuccess)
      )
    );
  }

  mapError(fn) {
    return new ApiResult((onError, onSuccess) =>
      this.fork(error => onError(fn(error)), onSuccess)
    );
  }
}

// Usage
function fetchUser(id) {
  return ApiResult.fromPromise(
    fetch(`/api/users/${id}`).then(r => r.json())
  );
}

function fetchPosts(userId) {
  return ApiResult.fromPromise(
    fetch(`/api/posts?userId=${userId}`).then(r => r.json())
  );
}

fetchUser(1)
  .flatMap(user => fetchPosts(user.id))
  .map(posts => posts.map(p => p.title))
  .mapError(error => `Failed: ${error.message}`)
  .fork(
    error => showError(error),
    titles => showTitles(titles)
  );
```

## Key Takeaways

1. **Functors provide map** - transform values without unwrapping
2. **Maybe handles nulls** - eliminates null reference errors
3. **Either handles errors** - functional error handling
4. **Monads provide flatMap** - prevents nesting, enables chaining
5. **Compose effects** - build complex operations from simple ones

Functors and monads may seem abstract, but they solve real problems: null safety, error handling, and async composition. Start with Maybe for null handling, then explore other patterns as needed.
