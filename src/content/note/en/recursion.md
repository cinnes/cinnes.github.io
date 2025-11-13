---
title: Recursion - Solving Problems by Breaking Them Down
timestamp: 2025-11-08 00:00:00+00:00
description: Master recursion to solve complex problems elegantly by breaking them into smaller, similar subproblems.
tags: [functional-programming, recursion, algorithms]
toc: true
---

# Recursion - Solving Problems by Breaking Them Down

Recursion is when a function calls itself to solve a problem. It's particularly elegant in functional programming, where immutability makes iteration more complex. Understanding recursion opens up powerful problem-solving techniques.

## The Basic Pattern

Every recursive function needs two parts:

1. **Base case** - when to stop recursing
2. **Recursive case** - how to break down the problem

```javascript
function countdown(n) {
  // Base case
  if (n <= 0) {
    console.log('Done!');
    return;
  }

  // Recursive case
  console.log(n);
  countdown(n - 1);
}

countdown(3);
// 3
// 2
// 1
// Done!
```

## Classic Examples

### Factorial

```javascript
function factorial(n) {
  // Base case
  if (n <= 1) return 1;

  // Recursive case
  return n * factorial(n - 1);
}

factorial(5);  // 120
// 5 * factorial(4)
// 5 * 4 * factorial(3)
// 5 * 4 * 3 * factorial(2)
// 5 * 4 * 3 * 2 * factorial(1)
// 5 * 4 * 3 * 2 * 1
```

### Fibonacci

```javascript
function fibonacci(n) {
  // Base cases
  if (n <= 1) return n;

  // Recursive case
  return fibonacci(n - 1) + fibonacci(n - 2);
}

fibonacci(6);  // 8
// fibonacci(5) + fibonacci(4)
// (fibonacci(4) + fibonacci(3)) + (fibonacci(3) + fibonacci(2))
// ...
```

### Sum of Array

```javascript
function sum(arr) {
  // Base case
  if (arr.length === 0) return 0;

  // Recursive case
  const [first, ...rest] = arr;
  return first + sum(rest);
}

sum([1, 2, 3, 4, 5]);  // 15
```

## Tail Recursion

Tail recursion is when the recursive call is the last operation in the function. This enables **tail call optimization** in some JavaScript engines.

### Not Tail Recursive

```javascript
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);  // Multiplication happens after
}
```

### Tail Recursive

```javascript
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc);  // Nothing happens after
}

factorial(5);  // 120
```

### Converting to Tail Recursive Form

```javascript
// Regular recursion
function sum(arr) {
  if (arr.length === 0) return 0;
  return arr[0] + sum(arr.slice(1));
}

// Tail recursive
function sum(arr, acc = 0) {
  if (arr.length === 0) return acc;
  return sum(arr.slice(1), acc + arr[0]);
}
```

## Recursion vs Iteration

### Iterative

```javascript
function sumIterative(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}
```

### Recursive

```javascript
function sumRecursive(arr) {
  if (arr.length === 0) return 0;
  return arr[0] + sumRecursive(arr.slice(1));
}
```

### When to Choose

**Use Recursion:**
- Tree/graph traversal
- Divide and conquer algorithms
- When problem naturally decomposes
- Working with recursive data structures

**Use Iteration:**
- Simple loops
- Performance-critical code
- When stack depth is a concern
- State machines

## Tree and Graph Traversal

### Tree Structure

```javascript
const tree = {
  value: 1,
  children: [
    {
      value: 2,
      children: [
        { value: 4, children: [] },
        { value: 5, children: [] }
      ]
    },
    {
      value: 3,
      children: [
        { value: 6, children: [] }
      ]
    }
  ]
};
```

### Depth-First Search

```javascript
function dfs(node, target) {
  if (node.value === target) return node;

  for (const child of node.children) {
    const result = dfs(child, target);
    if (result) return result;
  }

  return null;
}

dfs(tree, 5);  // Returns node with value 5
```

### Breadth-First Search (Using Recursion)

```javascript
function bfs(queue, target) {
  if (queue.length === 0) return null;

  const [node, ...rest] = queue;

  if (node.value === target) return node;

  return bfs([...rest, ...node.children], target);
}

bfs([tree], 6);  // Returns node with value 6
```

### Flatten Tree

```javascript
function flatten(node) {
  const values = [node.value];

  for (const child of node.children) {
    values.push(...flatten(child));
  }

  return values;
}

flatten(tree);  // [1, 2, 4, 5, 3, 6]
```

## Working with Nested Structures

### Deep Clone

```javascript
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClone);
  }

  return Object.keys(obj).reduce((acc, key) => ({
    ...acc,
    [key]: deepClone(obj[key])
  }), {});
}

const original = {
  name: 'John',
  address: {
    city: 'NYC',
    coords: { lat: 40, lng: -74 }
  }
};

const copy = deepClone(original);
```

### Path Finding

```javascript
function findPath(obj, target, path = []) {
  if (obj === target) return path;

  if (typeof obj !== 'object' || obj === null) {
    return null;
  }

  for (const [key, value] of Object.entries(obj)) {
    const result = findPath(value, target, [...path, key]);
    if (result) return result;
  }

  return null;
}

const data = {
  users: {
    john: { age: 30 }
  }
};

findPath(data, 30);  // ['users', 'john', 'age']
```

## Divide and Conquer Algorithms

### Quick Sort

```javascript
function quickSort(arr) {
  // Base case
  if (arr.length <= 1) return arr;

  // Divide
  const pivot = arr[0];
  const less = arr.slice(1).filter(x => x <= pivot);
  const greater = arr.slice(1).filter(x => x > pivot);

  // Conquer and combine
  return [...quickSort(less), pivot, ...quickSort(greater)];
}

quickSort([3, 1, 4, 1, 5, 9, 2, 6]);
// [1, 1, 2, 3, 4, 5, 6, 9]
```

### Merge Sort

```javascript
function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  return [...result, ...left.slice(i), ...right.slice(j)];
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

mergeSort([3, 1, 4, 1, 5, 9, 2, 6]);
```

### Binary Search

```javascript
function binarySearch(arr, target, start = 0, end = arr.length - 1) {
  // Base case
  if (start > end) return -1;

  const mid = Math.floor((start + end) / 2);

  if (arr[mid] === target) {
    return mid;
  }

  if (arr[mid] > target) {
    return binarySearch(arr, target, start, mid - 1);
  } else {
    return binarySearch(arr, target, mid + 1, end);
  }
}

binarySearch([1, 2, 3, 4, 5], 3);  // 2
```

## Memoization for Recursion

### Without Memoization

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

fibonacci(40);  // Very slow! Recalculates same values
```

### With Memoization

```javascript
function memoize(fn) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache[key]) return cache[key];
    cache[key] = fn(...args);
    return cache[key];
  };
}

const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(40);  // Much faster!
```

### Inline Cache

```javascript
function fibonacci(n, cache = {}) {
  if (n <= 1) return n;
  if (cache[n]) return cache[n];

  cache[n] = fibonacci(n - 1, cache) + fibonacci(n - 2, cache);
  return cache[n];
}
```

## Trampolining (Avoiding Stack Overflow)

### The Problem

```javascript
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

factorial(10000);  // Stack overflow!
```

### Solution: Trampoline

```javascript
function trampoline(fn) {
  while (typeof fn === 'function') {
    fn = fn();
  }
  return fn;
}

function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return () => factorial(n - 1, n * acc);
}

trampoline(() => factorial(10000));  // Works!
```

## Practical Examples

### Permissions Check

```javascript
function hasPermission(user, permission, visited = new Set()) {
  // Prevent infinite loops
  if (visited.has(user.id)) return false;
  visited.add(user.id);

  // Direct permission
  if (user.permissions.includes(permission)) {
    return true;
  }

  // Check inherited permissions from groups
  for (const group of user.groups) {
    if (hasPermission(group, permission, visited)) {
      return true;
    }
  }

  return false;
}
```

### File System Walker

```javascript
async function walkDirectory(dir, callback) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);

    await callback(path, entry);

    if (entry.isDirectory()) {
      await walkDirectory(path, callback);
    }
  }
}

// Usage
await walkDirectory('./src', (path, entry) => {
  if (entry.isFile()) {
    console.log(path);
  }
});
```

### JSON Schema Validator

```javascript
function validate(schema, data) {
  if (schema.type === 'string') {
    return typeof data === 'string';
  }

  if (schema.type === 'number') {
    return typeof data === 'number';
  }

  if (schema.type === 'object') {
    if (typeof data !== 'object') return false;

    return Object.entries(schema.properties).every(([key, propSchema]) =>
      validate(propSchema, data[key])
    );
  }

  if (schema.type === 'array') {
    if (!Array.isArray(data)) return false;

    return data.every(item =>
      validate(schema.items, item)
    );
  }

  return false;
}
```

## Key Takeaways

1. **Base case is crucial** - always define when to stop
2. **Trust the recursion** - don't try to trace all levels
3. **Tail recursion** - enables optimization in some engines
4. **Memoization** - cache results to avoid recalculation
5. **Trampoline** - prevents stack overflow for deep recursion

Recursion is a powerful tool that enables elegant solutions to complex problems. With practice, recognizing recursive patterns becomes natural.
