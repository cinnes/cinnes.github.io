---
title: Pure Functions - The Foundation of Functional Programming
timestamp: 2025-11-13 00:00:00+00:00
description: Understanding pure functions and why they're essential for writing predictable, testable code.
tags: [functional-programming, fundamentals, best-practices]
toc: true
---

# Pure Functions - The Foundation of Functional Programming

Pure functions are the cornerstone of functional programming. Understanding them is essential for writing predictable, testable, and maintainable code.

## What is a Pure Function?

A pure function is a function that satisfies two key properties:

1. **Deterministic**: Given the same inputs, it always returns the same output
2. **No Side Effects**: It doesn't modify anything outside its scope

```javascript
// Pure function
function add(a, b) {
  return a + b;
}

add(2, 3); // Always returns 5
add(2, 3); // Always returns 5
```

## Impure vs Pure

### Impure Function Example

```javascript
let counter = 0;

// Impure: depends on external state
function incrementCounter() {
  counter++;
  return counter;
}

incrementCounter(); // Returns 1
incrementCounter(); // Returns 2 (different output!)
```

### Pure Function Alternative

```javascript
// Pure: takes state as input, returns new state
function increment(counter) {
  return counter + 1;
}

increment(0); // Always returns 1
increment(0); // Always returns 1
```

## Common Side Effects to Avoid

Pure functions must avoid:

- **Modifying global variables**
- **Mutating input parameters**
- **Making API calls**
- **Reading/writing files**
- **Logging to console**
- **Getting current time/random numbers**

```javascript
// Impure: modifies input
function addItemImpure(array, item) {
  array.push(item); // Mutates original array
  return array;
}

// Pure: returns new array
function addItemPure(array, item) {
  return [...array, item]; // Creates new array
}
```

## Benefits of Pure Functions

### 1. Predictability

```javascript
// You can always predict the output
const result = add(2, 3);
// No need to check global state or worry about timing
```

### 2. Testability

```javascript
// Easy to test - no setup or mocking needed
test('add function', () => {
  expect(add(2, 3)).toBe(5);
  expect(add(-1, 1)).toBe(0);
  expect(add(0, 0)).toBe(0);
});
```

### 3. Composability

```javascript
// Pure functions are easy to combine
const double = x => x * 2;
const square = x => x * x;

const doubleAndSquare = x => square(double(x));

doubleAndSquare(3); // 36
```

### 4. Parallelization

```javascript
// Safe to run in parallel - no race conditions
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(double); // Can run concurrently
```

### 5. Memoization

```javascript
// Can cache results for performance
function memoize(fn) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache[key]) return cache[key];
    cache[key] = fn(...args);
    return cache[key];
  };
}

const expensiveCalc = memoize((n) => {
  console.log('Computing...');
  return n * n;
});

expensiveCalc(5); // "Computing..." -> 25
expensiveCalc(5); // 25 (cached, no console.log)
```

## Practical Examples

### Data Transformation

```javascript
// Pure function for transforming user data
function formatUser(user) {
  return {
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email.toLowerCase(),
    age: new Date().getFullYear() - user.birthYear
  };
}

const user = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'JOHN@EXAMPLE.COM',
  birthYear: 1990
};

const formatted = formatUser(user);
// Original user object unchanged
```

### Array Operations

```javascript
// Pure array filtering
function filterEvenNumbers(numbers) {
  return numbers.filter(n => n % 2 === 0);
}

// Pure array mapping
function doubleNumbers(numbers) {
  return numbers.map(n => n * 2);
}

// Pure array reduction
function sum(numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

const nums = [1, 2, 3, 4, 5];
filterEvenNumbers(nums); // [2, 4]
doubleNumbers(nums);      // [2, 4, 6, 8, 10]
sum(nums);                // 15
// nums is still [1, 2, 3, 4, 5]
```

### Working with Objects

```javascript
// Pure object update
function updateUserEmail(user, newEmail) {
  return {
    ...user,
    email: newEmail
  };
}

// Pure nested object update
function updateAddress(user, newAddress) {
  return {
    ...user,
    address: {
      ...user.address,
      ...newAddress
    }
  };
}
```

## Handling Necessary Side Effects

Real applications need side effects. The key is to isolate them:

```javascript
// Separate pure logic from side effects
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

function displayTotal(items) {
  const total = calculateTotal(items); // Pure
  console.log(`Total: $${total}`);     // Side effect
}

// Or use a functional approach
function logTotal(total) {
  console.log(`Total: $${total}`);
  return total; // Return value for chaining
}

const items = [{ price: 10 }, { price: 20 }];
const total = calculateTotal(items);
logTotal(total); // Side effect at the edge
```

## Common Patterns

### Pure Getters

```javascript
function getFullName(user) {
  return `${user.firstName} ${user.lastName}`;
}

function getAge(user) {
  return new Date().getFullYear() - user.birthYear;
}
```

### Pure Validators

```javascript
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isAdult(age) {
  return age >= 18;
}

function validateUser(user) {
  return {
    isValid: isValidEmail(user.email) && isAdult(user.age),
    errors: [
      !isValidEmail(user.email) && 'Invalid email',
      !isAdult(user.age) && 'Must be 18 or older'
    ].filter(Boolean)
  };
}
```

## Key Takeaways

1. **Pure functions are predictable** - same input always produces same output
2. **No side effects** - don't modify external state or rely on it
3. **Easier to test** - no setup, mocking, or complex test scenarios needed
4. **Composable** - easy to combine into larger operations
5. **Isolate side effects** - push them to the edges of your application

Pure functions make code easier to understand, test, and maintain. Start by making your utility functions pure, then gradually expand this principle to more of your codebase.
