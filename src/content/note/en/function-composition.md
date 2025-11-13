---
title: Function Composition - Building Complex Logic from Simple Functions
timestamp: 2025-11-10 00:00:00+00:00
description: Learn how to combine simple functions into powerful pipelines using composition techniques.
tags: [functional-programming, composition, best-practices]
toc: true
---

# Function Composition - Building Complex Logic from Simple Functions

Function composition is the process of combining two or more functions to create a new function. It's like mathematical function composition: `(f ∘ g)(x) = f(g(x))`.

## The Basic Concept

```javascript
// Two simple functions
const double = x => x * 2;
const increment = x => x + 1;

// Manual composition
const doubleAndIncrement = x => increment(double(x));

doubleAndIncrement(3);  // 7
```

## Compose and Pipe

### Compose (Right to Left)

```javascript
function compose(...fns) {
  return function(value) {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };
}

const transform = compose(
  x => x.toString(),  // Applied last
  x => x + 1,
  x => x * 2          // Applied first
);

transform(3);  // "7"
// Flow: 3 -> 6 -> 7 -> "7"
```

### Pipe (Left to Right)

```javascript
function pipe(...fns) {
  return function(value) {
    return fns.reduce((acc, fn) => fn(acc), value);
  };
}

const process = pipe(
  x => x * 2,         // Applied first
  x => x + 1,
  x => x.toString()   // Applied last
);

process(3);  // "7"
// Flow: 3 -> 6 -> 7 -> "7"
```

## Why Composition Matters

### 1. Readability

```javascript
// Without composition
function processUserData(user) {
  const validated = validateUser(user);
  const normalized = normalizeData(validated);
  const enriched = enrichWithDefaults(normalized);
  return formatForDisplay(enriched);
}

// With composition
const processUserData = pipe(
  validateUser,
  normalizeData,
  enrichWithDefaults,
  formatForDisplay
);
```

### 2. Reusability

```javascript
// Build once, use many times
const toLowerCase = s => s.toLowerCase();
const trim = s => s.trim();
const removeSpaces = s => s.replace(/\s+/g, '-');

const slugify = pipe(
  toLowerCase,
  trim,
  removeSpaces
);

slugify('  Hello World  ');  // "hello-world"
slugify('  Functional Programming  ');  // "functional-programming"
```

### 3. Testability

```javascript
// Each function is simple and testable
const validateEmail = email => {
  if (!email.includes('@')) throw new Error('Invalid email');
  return email;
};

const normalizeEmail = email => email.toLowerCase().trim();

const hashEmail = email => {
  // Some hashing logic
  return `hash_${email}`;
};

// Composition is also testable
const processEmail = pipe(
  validateEmail,
  normalizeEmail,
  hashEmail
);

// Easy to test each step
test('validateEmail', () => {
  expect(() => validateEmail('invalid')).toThrow();
  expect(validateEmail('test@example.com')).toBe('test@example.com');
});
```

## Practical Examples

### Data Transformation

```javascript
const users = [
  { firstName: 'John', lastName: 'Doe', age: 30 },
  { firstName: 'Jane', lastName: 'Smith', age: 25 },
  { firstName: 'Bob', lastName: 'Johnson', age: 35 }
];

const getAdultNames = pipe(
  users => users.filter(u => u.age >= 18),
  users => users.map(u => `${u.firstName} ${u.lastName}`),
  names => names.sort()
);

getAdultNames(users);
// ['Bob Johnson', 'Jane Smith', 'John Doe']
```

### String Processing

```javascript
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
const addPrefix = prefix => s => `${prefix}${s}`;
const addSuffix = suffix => s => `${s}${suffix}`;

const formatTitle = pipe(
  s => s.trim(),
  s => s.toLowerCase(),
  capitalize,
  addPrefix('Title: '),
  addSuffix('!')
);

formatTitle('  hello world  ');
// "Title: Hello world!"
```

### API Response Handling

```javascript
const parseJSON = response => response.json();
const extractData = result => result.data;
const validateData = data => {
  if (!data) throw new Error('No data');
  return data;
};
const transformData = data => data.map(item => ({
  id: item.id,
  name: item.name.toUpperCase()
}));

const processAPIResponse = pipe(
  parseJSON,
  extractData,
  validateData,
  transformData
);

// Usage
fetch('/api/users')
  .then(processAPIResponse)
  .then(users => console.log(users));
```

## Advanced Composition Patterns

### Pointfree Style

```javascript
// With explicit parameters
const getNames = users => users.map(u => u.name);

// Pointfree - no explicit parameters
const prop = key => obj => obj[key];
const map = fn => arr => arr.map(fn);

const getNames = map(prop('name'));

// More complex pointfree
const getActiveUserNames = pipe(
  filter(prop('active')),
  map(prop('name')),
  sort()
);
```

### Composing with Multiple Arguments

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

const add = curry((a, b) => a + b);
const multiply = curry((a, b) => a * b);

const addFive = add(5);
const double = multiply(2);

const transform = pipe(
  addFive,   // Can use partially applied
  double
);

transform(3);  // 16
```

### Async Composition

```javascript
const asyncPipe = (...fns) => {
  return async function(value) {
    let result = value;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
};

const fetchUser = async id =>
  fetch(`/api/users/${id}`).then(r => r.json());

const enrichUser = async user => ({
  ...user,
  posts: await fetch(`/api/posts?userId=${user.id}`).then(r => r.json())
});

const formatUser = user => ({
  fullName: `${user.firstName} ${user.lastName}`,
  postsCount: user.posts.length
});

const getUserProfile = asyncPipe(
  fetchUser,
  enrichUser,
  formatUser
);

await getUserProfile(123);
```

### Error Handling in Pipelines

```javascript
const tryCatch = fn => {
  return function(value) {
    try {
      return { success: true, value: fn(value) };
    } catch (error) {
      return { success: false, error };
    }
  };
};

const safePipe = (...fns) => {
  return function(value) {
    let result = { success: true, value };

    for (const fn of fns) {
      if (!result.success) break;

      try {
        result = { success: true, value: fn(result.value) };
      } catch (error) {
        result = { success: false, error };
      }
    }

    return result;
  };
};

const processData = safePipe(
  JSON.parse,
  data => data.users,
  users => users.map(u => u.name)
);

processData('{"users":[{"name":"John"}]}');
// { success: true, value: ['John'] }

processData('invalid json');
// { success: false, error: SyntaxError... }
```

## Debugging Composed Functions

### Trace Function

```javascript
const trace = label => value => {
  console.log(`${label}:`, value);
  return value;
};

const transform = pipe(
  x => x * 2,
  trace('After double'),
  x => x + 1,
  trace('After increment'),
  x => x.toString()
);

transform(3);
// Logs: "After double: 6"
// Logs: "After increment: 7"
// Returns: "7"
```

### Tap Function

```javascript
const tap = fn => value => {
  fn(value);
  return value;
};

const process = pipe(
  x => x * 2,
  tap(x => console.log('Doubled:', x)),
  x => x + 1,
  tap(x => console.log('Incremented:', x)),
  x => x.toString()
);
```

## Real-World Example: Form Validation

```javascript
const required = field => value => {
  if (!value) throw new Error(`${field} is required`);
  return value;
};

const minLength = (field, min) => value => {
  if (value.length < min) {
    throw new Error(`${field} must be at least ${min} characters`);
  }
  return value;
};

const matches = (field, pattern) => value => {
  if (!pattern.test(value)) {
    throw new Error(`${field} format is invalid`);
  }
  return value;
};

const validateEmail = pipe(
  required('Email'),
  value => value.trim(),
  value => value.toLowerCase(),
  matches('Email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/)
);

const validatePassword = pipe(
  required('Password'),
  minLength('Password', 8),
  matches('Password', /[A-Z]/),
  matches('Password', /[0-9]/)
);

// Usage
try {
  validateEmail('  JOHN@EXAMPLE.COM  ');  // Valid
  validatePassword('SecurePass123');       // Valid
} catch (error) {
  console.error(error.message);
}
```

## Performance Considerations

### Memoized Composition

```javascript
const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const expensiveTransform = memoize(
  pipe(
    x => { /* expensive operation */ return x * 2; },
    x => { /* another expensive operation */ return x + 1; }
  )
);
```

## Key Takeaways

1. **Small, focused functions** - each does one thing well
2. **Pipe for readability** - left-to-right matches how we think
3. **Compose for math** - right-to-left matches mathematical notation
4. **Pointfree when clear** - reduces noise but don't sacrifice clarity
5. **Debug with trace/tap** - inspect values in the pipeline

Function composition enables building complex behavior from simple, testable, reusable pieces. It's the cornerstone of functional programming.
