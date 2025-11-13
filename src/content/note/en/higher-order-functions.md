---
title: Higher-Order Functions - Functions as First-Class Citizens
timestamp: 2025-11-11 00:00:00+00:00
description: Master higher-order functions to write more expressive and reusable code by treating functions as values.
tags: [functional-programming, higher-order-functions, javascript]
toc: true
---

# Higher-Order Functions - Functions as First-Class Citizens

In functional programming, functions are first-class citizens. This means they can be passed as arguments, returned from other functions, and assigned to variables. Higher-order functions leverage this to create powerful abstractions.

## What is a Higher-Order Function?

A higher-order function is a function that:

1. Takes one or more functions as arguments, OR
2. Returns a function as its result

```javascript
// Takes a function as argument
function twice(fn, value) {
  return fn(fn(value));
}

// Returns a function
function multiplier(factor) {
  return function(number) {
    return number * factor;
  };
}
```

## Built-in Higher-Order Functions

### Array Methods

```javascript
const numbers = [1, 2, 3, 4, 5];

// map - transforms each element
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10]

// filter - selects elements
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4]

// reduce - accumulates values
const sum = numbers.reduce((acc, n) => acc + n, 0);
// 15

// find - returns first match
const firstEven = numbers.find(n => n % 2 === 0);
// 2

// some - tests if any element matches
const hasEven = numbers.some(n => n % 2 === 0);
// true

// every - tests if all elements match
const allPositive = numbers.every(n => n > 0);
// true
```

### Chaining Operations

```javascript
const users = [
  { name: 'John', age: 30, active: true },
  { name: 'Jane', age: 25, active: false },
  { name: 'Bob', age: 35, active: true }
];

const activeUserNames = users
  .filter(user => user.active)
  .map(user => user.name)
  .sort();
// ['Bob', 'John']
```

## Creating Higher-Order Functions

### Functions that Take Functions

```javascript
// Retry function
function retry(fn, times) {
  return async function(...args) {
    for (let i = 0; i < times; i++) {
      try {
        return await fn(...args);
      } catch (error) {
        if (i === times - 1) throw error;
      }
    }
  };
}

const fetchWithRetry = retry(fetch, 3);
await fetchWithRetry('https://api.example.com');
```

```javascript
// Timing function
function measure(fn, label) {
  return function(...args) {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    console.log(`${label}: ${end - start}ms`);
    return result;
  };
}

const timedSort = measure(arr => arr.sort(), 'Sort');
timedSort([3, 1, 2]);  // Logs: "Sort: 0.123ms"
```

### Functions that Return Functions

```javascript
// Configuration function
function greeter(greeting) {
  return function(name) {
    return `${greeting}, ${name}!`;
  };
}

const sayHello = greeter('Hello');
const sayHi = greeter('Hi');

sayHello('John');  // "Hello, John!"
sayHi('Jane');     // "Hi, Jane!"
```

```javascript
// Validation factory
function validator(predicate, message) {
  return function(value) {
    if (!predicate(value)) {
      throw new Error(message);
    }
    return value;
  };
}

const validateEmail = validator(
  email => email.includes('@'),
  'Invalid email'
);

const validateAge = validator(
  age => age >= 18,
  'Must be 18 or older'
);

validateEmail('john@example.com');  // OK
validateAge(25);                    // OK
```

## Common Patterns

### Partial Application

```javascript
function partial(fn, ...fixedArgs) {
  return function(...remainingArgs) {
    return fn(...fixedArgs, ...remainingArgs);
  };
}

function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

const sayHello = partial(greet, 'Hello');
sayHello('John');  // "Hello, John!"
sayHello('Jane');  // "Hello, Jane!"
```

### Debounce

```javascript
function debounce(fn, delay) {
  let timeoutId;

  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Usage with input handling
const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);

input.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});
```

### Throttle

```javascript
function throttle(fn, limit) {
  let inThrottle;

  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage with scroll handling
const handleScroll = throttle(() => {
  console.log('Scrolling...');
}, 100);

window.addEventListener('scroll', handleScroll);
```

### Memoization

```javascript
function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Expensive fibonacci calculation
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(40);  // Computed
fibonacci(40);  // Cached - instant
```

## Practical Examples

### Array Operations

```javascript
// Custom map implementation
function map(array, fn) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(fn(array[i], i, array));
  }
  return result;
}

// Custom filter implementation
function filter(array, predicate) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      result.push(array[i]);
    }
  }
  return result;
}

// Custom reduce implementation
function reduce(array, reducer, initial) {
  let accumulator = initial;
  for (let i = 0; i < array.length; i++) {
    accumulator = reducer(accumulator, array[i], i, array);
  }
  return accumulator;
}
```

### Function Composition Helpers

```javascript
// Pipe - left to right
function pipe(...fns) {
  return function(value) {
    return fns.reduce((acc, fn) => fn(acc), value);
  };
}

const transform = pipe(
  n => n * 2,
  n => n + 1,
  n => n.toString()
);

transform(3);  // "7"
```

```javascript
// Compose - right to left
function compose(...fns) {
  return function(value) {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };
}

const process = compose(
  n => n.toString(),
  n => n + 1,
  n => n * 2
);

process(3);  // "7"
```

### Predicate Functions

```javascript
function not(predicate) {
  return function(...args) {
    return !predicate(...args);
  };
}

function and(...predicates) {
  return function(value) {
    return predicates.every(p => p(value));
  };
}

function or(...predicates) {
  return function(value) {
    return predicates.some(p => p(value));
  };
}

// Usage
const isEven = n => n % 2 === 0;
const isPositive = n => n > 0;

const isOdd = not(isEven);
const isPositiveEven = and(isPositive, isEven);
const isEvenOrNegative = or(isEven, not(isPositive));

isOdd(3);              // true
isPositiveEven(4);     // true
isEvenOrNegative(-1);  // true
```

### Event Handling

```javascript
function once(fn) {
  let called = false;
  let result;

  return function(...args) {
    if (!called) {
      result = fn.apply(this, args);
      called = true;
    }
    return result;
  };
}

const initialize = once(() => {
  console.log('Initializing...');
  return { initialized: true };
});

initialize();  // Logs: "Initializing..."
initialize();  // No log - returns cached result
```

### Async Operations

```javascript
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  };
}

// Convert callback-based function to promise
const readFileAsync = promisify(fs.readFile);
await readFileAsync('file.txt', 'utf8');
```

## Combining Higher-Order Functions

```javascript
const users = [
  { name: 'John', age: 30, score: 85 },
  { name: 'Jane', age: 25, score: 92 },
  { name: 'Bob', age: 35, score: 78 }
];

// Complex data transformation
const topActiveAdults = users
  .filter(u => u.age >= 18)      // Only adults
  .filter(u => u.score >= 80)    // Only high scores
  .map(u => u.name)               // Extract names
  .sort()                         // Sort alphabetically
  .slice(0, 5);                   // Top 5

// ['Jane', 'John']
```

## Key Takeaways

1. **Functions as values** - treat functions like any other data
2. **Abstraction** - hide complexity behind clean interfaces
3. **Reusability** - create general-purpose utilities
4. **Composition** - build complex behavior from simple functions
5. **Declarative** - focus on what, not how

Higher-order functions enable you to write code that's more expressive, reusable, and easier to test. They're a fundamental tool in functional programming.
