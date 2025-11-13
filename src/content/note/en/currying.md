---
title: Currying - Transforming Functions for Better Composition
timestamp: 2025-11-09 00:00:00+00:00
description: Learn how currying transforms multi-argument functions into sequences of single-argument functions for improved flexibility and reusability.
tags: [fp, currying, partial]
toc: true
---

# Currying - Transforming Functions for Better Composition

Currying is the technique of converting a function that takes multiple arguments into a sequence of functions that each take a single argument. Named after mathematician Haskell Curry, it's a powerful tool for creating flexible, reusable code.

## Understanding Currying

### Before Currying

```javascript
// Regular function with multiple parameters
function add(a, b, c) {
  return a + b + c;
}

add(1, 2, 3);  // 6
```

### After Currying

```javascript
// Curried version
function add(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

add(1)(2)(3);  // 6

// Or with arrow functions
const add = a => b => c => a + b + c;
```

## Manual Currying

```javascript
// Two parameters
const multiply = a => b => a * b;

multiply(2)(3);  // 6

const double = multiply(2);
double(5);  // 10
double(10); // 20

// Three parameters
const greet = greeting => name => punctuation =>
  `${greeting}, ${name}${punctuation}`;

greet('Hello')('World')('!');  // "Hello, World!"

const sayHello = greet('Hello');
const sayHelloToJohn = sayHello('John');
sayHelloToJohn('!');  // "Hello, John!"
```

## Automatic Currying

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

// Usage
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

// All these work
curriedAdd(1)(2)(3);      // 6
curriedAdd(1, 2)(3);      // 6
curriedAdd(1)(2, 3);      // 6
curriedAdd(1, 2, 3);      // 6
```

## Currying vs Partial Application

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

// Fix first argument
const sayHello = partial(greet, 'Hello');
sayHello('John');  // "Hello, John!"
sayHello('Jane');  // "Hello, Jane!"
```

### Currying

```javascript
const greet = greeting => name =>
  `${greeting}, ${name}!`;

// Can partially apply at any level
const sayHello = greet('Hello');
const sayHi = greet('Hi');

sayHello('John');  // "Hello, John!"
sayHi('John');     // "Hi, John!"
```

## Practical Applications

### Reusable Validators

```javascript
const validateLength = min => max => value =>
  value.length >= min && value.length <= max;

const validateEmail = pattern => value =>
  pattern.test(value);

// Create specific validators
const isValidUsername = validateLength(3)(20);
const isValidPassword = validateLength(8)(100);
const isValidEmail = validateEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

isValidUsername('john');           // true
isValidPassword('short');          // false
isValidEmail('john@example.com');  // true
```

### Data Filtering

```javascript
const filterBy = property => predicate => array =>
  array.filter(item => predicate(item[property]));

const filterByAge = filterBy('age');
const filterByName = filterBy('name');

const olderThan = age => value => value > age;
const startsWith = prefix => value => value.startsWith(prefix);

const users = [
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 },
  { name: 'Bob', age: 35 }
];

const adults = filterByAge(olderThan(18));
const nameStartsWithJ = filterByName(startsWith('J'));

adults(users);          // All users
nameStartsWithJ(users); // [John, Jane]
```

### API Requests

```javascript
const request = method => url => data =>
  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined
  });

// Create specific request functions
const get = request('GET');
const post = request('POST');
const put = request('PUT');
const del = request('DELETE');

// Create endpoint-specific functions
const getUsers = get('/api/users');
const createUser = post('/api/users');
const updateUser = put('/api/users');

// Use them
getUsers();
createUser({ name: 'John' });
updateUser({ id: 1, name: 'Jane' });
```

### Event Handlers

```javascript
const on = eventType => element => handler =>
  element.addEventListener(eventType, handler);

const onClick = on('click');
const onInput = on('input');
const onSubmit = on('submit');

// Specific element handlers
const button = document.querySelector('#btn');
const input = document.querySelector('#input');

const handleButtonClick = onClick(button);
const handleInputChange = onInput(input);

handleButtonClick(() => console.log('Clicked!'));
handleInputChange(e => console.log(e.target.value));
```

## Currying with Multiple Strategies

### Left-to-Right Currying

```javascript
const divide = a => b => a / b;

const half = divide(10);  // divides 10 by...
half(2);  // 5

const divideByTwo = a => divide(a)(2);
divideByTwo(10);  // 5
```

### Right-to-Left Currying

```javascript
// Helper for right-currying
const rcurry = fn =>
  function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args.reverse());
    }
    return (...nextArgs) =>
      curried.apply(this, nextArgs.concat(args));
  };

const divide = rcurry((a, b) => a / b);
const divideByTwo = divide(2);  // divides by 2
divideByTwo(10);  // 5
```

## Combining Currying with Composition

```javascript
const map = fn => arr => arr.map(fn);
const filter = predicate => arr => arr.filter(predicate);
const reduce = (fn, init) => arr => arr.reduce(fn, init);

const pipe = (...fns) => value =>
  fns.reduce((acc, fn) => fn(acc), value);

const users = [
  { name: 'John', age: 30, active: true },
  { name: 'Jane', age: 25, active: false },
  { name: 'Bob', age: 35, active: true }
];

const getActiveUserNames = pipe(
  filter(u => u.active),
  map(u => u.name),
  reduce((acc, name) => [...acc, name], [])
);

getActiveUserNames(users);  // ['John', 'Bob']
```

## Advanced Patterns

### Placeholder Arguments

```javascript
const _ = Symbol('placeholder');

function curry(fn) {
  return function curried(...args) {
    const hasPlaceholder = args.includes(_);

    if (!hasPlaceholder && args.length >= fn.length) {
      return fn.apply(this, args);
    }

    return function(...nextArgs) {
      const newArgs = args.map(arg =>
        arg === _ && nextArgs.length ? nextArgs.shift() : arg
      );
      return curried(...newArgs, ...nextArgs);
    };
  };
}

const divide = curry((a, b, c) => a / b / c);

// Skip arguments with placeholder
const divideBy2 = divide(_, 2);
divideBy2(10, 5);  // 1

const divideTenBy = divide(10);
divideTenBy(2, 5);  // 1
```

### Auto-Currying Object Methods

```javascript
const autoCurry = obj => {
  const curried = {};

  Object.keys(obj).forEach(key => {
    const fn = obj[key];
    if (typeof fn === 'function') {
      curried[key] = curry(fn);
    } else {
      curried[key] = fn;
    }
  });

  return curried;
};

const math = autoCurry({
  add: (a, b) => a + b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b
});

const add5 = math.add(5);
const double = math.multiply(2);

add5(3);    // 8
double(4);  // 8
```

## Real-World Example: Form Builder

```javascript
const createField = type => name => label => validation => ({
  type,
  name,
  label,
  validation
});

const textField = createField('text');
const emailField = createField('email');
const numberField = createField('number');

const required = message => value =>
  value ? null : message;

const minLength = min => message => value =>
  value.length >= min ? null : message;

const isEmail = message => value =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : message;

// Build form fields
const usernameField = textField('username')('Username')(
  minLength(3)('Must be at least 3 characters')
);

const emailInput = emailField('email')('Email Address')(
  isEmail('Invalid email format')
);

const ageField = numberField('age')('Age')(
  required('Age is required')
);

const form = [usernameField, emailInput, ageField];
```

## Performance Considerations

### Memoization with Currying

```javascript
const memoizeCurried = fn => {
  const cache = new Map();

  return function curried(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    if (args.length >= fn.length) {
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    }

    return (...nextArgs) =>
      curried(...args, ...nextArgs);
  };
};
```

## When to Use Currying

### Good Use Cases

✅ Creating specialized versions of generic functions
✅ Building reusable validators and transformers
✅ Composing functions in pipelines
✅ Partial application of configuration
✅ Creating DSLs (Domain Specific Languages)

### When to Avoid

❌ Simple functions that don't benefit from partial application
❌ Functions that are only called once
❌ When it reduces code clarity
❌ Performance-critical hot paths (extra function calls)

## Key Takeaways

1. **Currying enables partial application** - fix some arguments, leave others for later
2. **Improved reusability** - create specialized functions from generic ones
3. **Better composition** - curried functions compose more naturally
4. **Pointfree style** - write cleaner code without explicit parameters
5. **Configuration separation** - separate config from data

Currying is a powerful technique that enables more flexible and reusable function design. Used appropriately, it leads to cleaner, more maintainable code.
