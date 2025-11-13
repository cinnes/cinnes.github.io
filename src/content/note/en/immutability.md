---
title: Immutability - Why Never Changing Data Changes Everything
timestamp: 2025-11-12 00:00:00+00:00
description: Learn why immutability is crucial in functional programming and how it prevents bugs and simplifies reasoning about code.
tags: [functional-programming, immutability, best-practices]
toc: true
---

# Immutability - Why Never Changing Data Changes Everything

Immutability means that once created, data cannot be changed. Instead of modifying data, we create new copies with the desired changes. This simple concept has profound implications for code quality.

## The Problem with Mutation

### Hidden Changes

```javascript
function addDiscount(cart) {
  cart.total = cart.total * 0.9;  // Mutates original!
  return cart;
}

const myCart = { items: [...], total: 100 };
const discountedCart = addDiscount(myCart);

console.log(myCart.total);  // 90 - original was changed!
```

### Unexpected Behavior

```javascript
const numbers = [1, 2, 3];
const sortedNumbers = numbers.sort();

console.log(numbers);        // [1, 2, 3] - mutated!
console.log(sortedNumbers);  // [1, 2, 3] - same reference
```

## Immutable Alternatives

### Arrays

```javascript
const original = [1, 2, 3];

// ❌ Mutable operations
original.push(4);      // Modifies original
original.sort();       // Modifies original
original.reverse();    // Modifies original

// ✅ Immutable operations
const withFour = [...original, 4];           // New array
const sorted = [...original].sort();         // New array
const reversed = [...original].reverse();    // New array

// Or using methods that return new arrays
const doubled = original.map(x => x * 2);    // New array
const evens = original.filter(x => x % 2 === 0); // New array
```

### Objects

```javascript
const user = {
  name: 'John',
  email: 'john@example.com',
  age: 30
};

// ❌ Mutable
user.age = 31;  // Modifies original

// ✅ Immutable
const olderUser = {
  ...user,
  age: 31
};

// For nested objects
const updatedUser = {
  ...user,
  address: {
    ...user.address,
    city: 'New York'
  }
};
```

## Benefits of Immutability

### 1. Predictability

```javascript
function processUser(user) {
  // Can't accidentally modify user
  return {
    ...user,
    processed: true
  };
}

const user = { name: 'John' };
const processed = processUser(user);

// user is guaranteed unchanged
console.log(user);  // { name: 'John' }
```

### 2. Time Travel and Undo

```javascript
class StateHistory {
  constructor(initialState) {
    this.history = [initialState];
    this.currentIndex = 0;
  }

  setState(newState) {
    // Keep immutable history
    this.history = [
      ...this.history.slice(0, this.currentIndex + 1),
      newState
    ];
    this.currentIndex++;
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
    return this.history[this.currentIndex];
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
    }
    return this.history[this.currentIndex];
  }
}
```

### 3. Safe Sharing

```javascript
// Can safely share data between functions
const config = { apiUrl: 'https://api.example.com' };

function fetchUsers(config) {
  // config can't be modified
  return fetch(config.apiUrl + '/users');
}

function fetchPosts(config) {
  // config is still unchanged
  return fetch(config.apiUrl + '/posts');
}
```

### 4. Easier Testing

```javascript
// No need to reset state between tests
const initialState = { count: 0 };

test('increment', () => {
  const newState = increment(initialState);
  expect(newState.count).toBe(1);
  expect(initialState.count).toBe(0); // Original unchanged
});

test('decrement', () => {
  const newState = decrement(initialState);
  expect(newState.count).toBe(-1);
  // initialState is still { count: 0 }
});
```

## Immutable Update Patterns

### Adding to Arrays

```javascript
const items = [1, 2, 3];

// Add to end
const withFour = [...items, 4];

// Add to beginning
const withZero = [0, ...items];

// Add at index
const index = 2;
const withTwo = [
  ...items.slice(0, index),
  2.5,
  ...items.slice(index)
];
```

### Removing from Arrays

```javascript
const items = [1, 2, 3, 4, 5];

// Remove by index
const index = 2;
const removed = [
  ...items.slice(0, index),
  ...items.slice(index + 1)
];

// Remove by value
const filtered = items.filter(item => item !== 3);

// Remove first/last
const withoutFirst = items.slice(1);
const withoutLast = items.slice(0, -1);
```

### Updating Arrays

```javascript
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Bob' }
];

// Update by index
const updated = users.map((user, i) =>
  i === 1 ? { ...user, name: 'Janet' } : user
);

// Update by condition
const activated = users.map(user =>
  user.id === 2 ? { ...user, active: true } : user
);
```

### Nested Object Updates

```javascript
const state = {
  user: {
    profile: {
      name: 'John',
      email: 'john@example.com'
    },
    settings: {
      theme: 'dark'
    }
  }
};

// Deep update
const updated = {
  ...state,
  user: {
    ...state.user,
    profile: {
      ...state.user.profile,
      name: 'John Doe'
    }
  }
};
```

## Helper Functions

### Generic Update

```javascript
function updateIn(obj, path, updater) {
  const [first, ...rest] = path;

  if (rest.length === 0) {
    return {
      ...obj,
      [first]: updater(obj[first])
    };
  }

  return {
    ...obj,
    [first]: updateIn(obj[first], rest, updater)
  };
}

// Usage
const state = {
  users: {
    john: { age: 30 }
  }
};

const updated = updateIn(
  state,
  ['users', 'john', 'age'],
  age => age + 1
);
```

### Array Replace

```javascript
function replaceAt(array, index, value) {
  return [
    ...array.slice(0, index),
    value,
    ...array.slice(index + 1)
  ];
}

function replaceWhere(array, predicate, value) {
  return array.map(item =>
    predicate(item) ? value : item
  );
}
```

## Performance Considerations

### Structural Sharing

```javascript
// Libraries like Immer use structural sharing
import produce from 'immer';

const state = {
  users: [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ]
};

const newState = produce(state, draft => {
  draft.users[0].name = 'John Doe';
});

// users array is shared where unchanged
state.users[1] === newState.users[1];  // true
```

### When to Copy

```javascript
// Only copy what changes
function updateUser(users, id, changes) {
  return users.map(user =>
    user.id === id
      ? { ...user, ...changes }  // Only copy this user
      : user                      // Reuse existing object
  );
}
```

## Practical Examples

### Form State

```javascript
function updateFormField(form, field, value) {
  return {
    ...form,
    values: {
      ...form.values,
      [field]: value
    },
    errors: {
      ...form.errors,
      [field]: null
    }
  };
}

const form = {
  values: { email: '', password: '' },
  errors: {}
};

const updated = updateFormField(form, 'email', 'john@example.com');
```

### Shopping Cart

```javascript
const cart = {
  items: [],
  total: 0
};

function addItem(cart, item) {
  const items = [...cart.items, item];
  return {
    ...cart,
    items,
    total: items.reduce((sum, i) => sum + i.price, 0)
  };
}

function removeItem(cart, itemId) {
  const items = cart.items.filter(i => i.id !== itemId);
  return {
    ...cart,
    items,
    total: items.reduce((sum, i) => sum + i.price, 0)
  };
}
```

### State Machine

```javascript
const initialState = {
  status: 'idle',
  data: null,
  error: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        status: 'loading'
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        status: 'success',
        data: action.payload
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error
      };

    default:
      return state;
  }
}
```

## Key Takeaways

1. **Never mutate** - always create new copies when changes are needed
2. **Spread operator is your friend** - use `...` for shallow copies
3. **Immutability enables time travel** - keep history of all states
4. **Safe to share** - no worries about unexpected changes
5. **Use libraries for deep updates** - Immer, Immutable.js for complex cases

Immutability makes code more predictable and easier to reason about. The slight performance overhead is usually worth the benefits in code quality and bug prevention.
