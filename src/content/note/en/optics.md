---
title: Optics - Composable Getters and Setters
timestamp: 2025-11-18 00:00:00+00:00
description: Master lenses, prisms, and other optics to elegantly read and update deeply nested immutable data structures with composable, reusable operations.
tags: [fp, optics, lenses, advanced]
toc: true
---

# Optics - Composable Getters and Setters

Optics provide a composable way to focus on parts of immutable data structures. They let you read, update, and traverse nested data elegantly without verbose spread syntax or mutation.

## The Problem

Updating nested immutable data is painful:

```typescript
// Update nested field
const user = {
  name: 'Alice',
  address: {
    street: {
      name: 'Main St',
      number: 123
    },
    city: 'NYC'
  }
};

// Update street number
const updated = {
  ...user,
  address: {
    ...user.address,
    street: {
      ...user.address.street,
      number: 456
    }
  }
};
```

This doesn't scale. Optics solve this.

## Lenses - Focus on a Field

A lens is a pair of get/set functions:

```typescript
// Lens type
type Lens<S, A> = {
  get: (s: S) => A;
  set: (a: A) => (s: S) => S;
};

// Create a lens
function lens<S, A>(
  get: (s: S) => A,
  set: (a: A) => (s: S) => S
): Lens<S, A> {
  return { get, set };
}

// Lens for accessing a field
function prop<S, K extends keyof S>(key: K): Lens<S, S[K]> {
  return lens(
    (s) => s[key],
    (a) => (s) => ({ ...s, [key]: a })
  );
}

// Example lenses
type User = {
  name: string;
  age: number;
};

const nameLens: Lens<User, string> = prop('name');
const ageLens: Lens<User, number> = prop('age');

const user: User = { name: 'Alice', age: 30 };

nameLens.get(user);           // 'Alice'
nameLens.set('Bob')(user);    // { name: 'Bob', age: 30 }
```

## Lens Composition

The power of lenses: composition!

```typescript
// Compose two lenses
function compose<A, B, C>(
  outer: Lens<A, B>,
  inner: Lens<B, C>
): Lens<A, C> {
  return lens(
    (a) => inner.get(outer.get(a)),
    (c) => (a) => outer.set(inner.set(c)(outer.get(a)))(a)
  );
}

// Example: nested access
type Address = {
  street: string;
  city: string;
};

type Person = {
  name: string;
  address: Address;
};

const addressLens: Lens<Person, Address> = prop('address');
const streetLens: Lens<Address, string> = prop('street');

// Compose to access nested field
const personStreetLens = compose(addressLens, streetLens);

const person: Person = {
  name: 'Alice',
  address: { street: 'Main St', city: 'NYC' }
};

personStreetLens.get(person);              // 'Main St'
personStreetLens.set('Oak Ave')(person);   // { ..., address: { street: 'Oak Ave', ... } }
```

## Lens Operations

```typescript
// Modify through a lens
function modify<S, A>(
  lens: Lens<S, A>,
  f: (a: A) => A
): (s: S) => S {
  return (s) => lens.set(f(lens.get(s)))(s);
}

// Example: increment age
const incrementAge = modify(ageLens, (age) => age + 1);

incrementAge(user);  // { name: 'Alice', age: 31 }

// Uppercase name
const uppercaseName = modify(nameLens, (name) => name.toUpperCase());

uppercaseName(user);  // { name: 'ALICE', age: 30 }
```

## Array Lenses

```typescript
// Lens for array index
function index<A>(i: number): Lens<A[], A | undefined> {
  return lens(
    (arr) => arr[i],
    (a) => (arr) => {
      if (a === undefined) return arr;
      const copy = [...arr];
      copy[i] = a;
      return copy;
    }
  );
}

const numbers = [1, 2, 3, 4, 5];
const secondLens = index<number>(1);

secondLens.get(numbers);       // 2
secondLens.set(10)(numbers);   // [1, 10, 3, 4, 5]
```

## Prisms - Focus on a Case

Prisms handle sum types (unions) where the focus might not exist:

```typescript
// Prism type
type Prism<S, A> = {
  preview: (s: S) => A | undefined;
  review: (a: A) => S;
};

function prism<S, A>(
  preview: (s: S) => A | undefined,
  review: (a: A) => S
): Prism<S, A> {
  return { preview, review };
}

// Example: Either type
type Either<L, R> =
  | { tag: 'Left'; value: L }
  | { tag: 'Right'; value: R };

// Prism for Right case
function rightPrism<L, R>(): Prism<Either<L, R>, R> {
  return prism(
    (either) => either.tag === 'Right' ? either.value : undefined,
    (value) => ({ tag: 'Right', value })
  );
}

// Prism for Left case
function leftPrism<L, R>(): Prism<Either<L, R>, L> {
  return prism(
    (either) => either.tag === 'Left' ? either.value : undefined,
    (value) => ({ tag: 'Left', value })
  );
}

// Usage
const right: Either<string, number> = { tag: 'Right', value: 42 };
const left: Either<string, number> = { tag: 'Left', value: 'error' };

const rightP = rightPrism<string, number>();

rightP.preview(right);   // 42
rightP.preview(left);    // undefined
rightP.review(100);      // { tag: 'Right', value: 100 }
```

## Optional - Lens + Prism

An Optional combines lens and prism—accessing fields that might not exist:

```typescript
// Optional type
type Optional<S, A> = {
  getOption: (s: S) => A | undefined;
  set: (a: A) => (s: S) => S;
};

function optional<S, A>(
  getOption: (s: S) => A | undefined,
  set: (a: A) => (s: S) => S
): Optional<S, A> {
  return { getOption, set };
}

// Optional for nullable field
function nullable<S, K extends keyof S>(
  key: K
): Optional<S, NonNullable<S[K]>> {
  return optional(
    (s) => {
      const value = s[key];
      return value === null || value === undefined ? undefined : value;
    },
    (a) => (s) => ({ ...s, [key]: a })
  );
}

// Example
type Profile = {
  bio?: string;
  avatar?: string;
};

const bioOptional = nullable<Profile, 'bio'>('bio');

const profile1: Profile = { bio: 'Hello' };
const profile2: Profile = {};

bioOptional.getOption(profile1);         // 'Hello'
bioOptional.getOption(profile2);         // undefined
bioOptional.set('New bio')(profile2);    // { bio: 'New bio' }
```

## Traversals - Focus on Multiple Elements

Traversals let you operate on multiple values at once:

```typescript
// Traversal type
type Traversal<S, A> = {
  toList: (s: S) => A[];
  modify: (f: (a: A) => A) => (s: S) => S;
};

function traversal<S, A>(
  toList: (s: S) => A[],
  modify: (f: (a: A) => A) => (s: S) => S
): Traversal<S, A> {
  return { toList, modify };
}

// Traversal for array elements
function each<A>(): Traversal<A[], A> {
  return traversal(
    (arr) => arr,
    (f) => (arr) => arr.map(f)
  );
}

// Usage
const nums = [1, 2, 3, 4, 5];
const eachNumber = each<number>();

eachNumber.toList(nums);                    // [1, 2, 3, 4, 5]
eachNumber.modify((n) => n * 2)(nums);      // [2, 4, 6, 8, 10]
```

## Filtered Traversal

```typescript
// Filter traversal
function filtered<A>(
  predicate: (a: A) => boolean
): Traversal<A[], A> {
  return traversal(
    (arr) => arr.filter(predicate),
    (f) => (arr) => arr.map(a => predicate(a) ? f(a) : a)
  );
}

// Example: even numbers
const evens = filtered<number>((n) => n % 2 === 0);

evens.toList([1, 2, 3, 4, 5]);              // [2, 4]
evens.modify((n) => n * 10)([1, 2, 3, 4]);  // [1, 20, 3, 40]
```

## Iso - Bidirectional Conversion

An Iso represents an isomorphism—lossless conversion between types:

```typescript
// Iso type
type Iso<S, A> = {
  to: (s: S) => A;
  from: (a: A) => S;
};

function iso<S, A>(
  to: (s: S) => A,
  from: (a: A) => S
): Iso<S, A> {
  return { to, from };
}

// String <-> Array<char>
const stringArray: Iso<string, string[]> = iso(
  (s) => s.split(''),
  (arr) => arr.join('')
);

stringArray.to('hello');           // ['h', 'e', 'l', 'l', 'o']
stringArray.from(['h', 'i']);      // 'hi'

// Celsius <-> Fahrenheit
const celsiusFahrenheit: Iso<number, number> = iso(
  (c) => c * 9 / 5 + 32,
  (f) => (f - 32) * 5 / 9
);

celsiusFahrenheit.to(0);     // 32
celsiusFahrenheit.from(32);  // 0
```

## Practical Example: Deeply Nested Update

```typescript
type Company = {
  name: string;
  departments: Department[];
};

type Department = {
  name: string;
  employees: Employee[];
};

type Employee = {
  name: string;
  salary: number;
};

// Lenses
const departmentsL: Lens<Company, Department[]> = prop('departments');
const employeesL: Lens<Department, Employee[]> = prop('employees');
const salaryL: Lens<Employee, number> = prop('salary');

// Traversals
const eachDepartment = each<Department>();
const eachEmployee = each<Employee>();

// Compose: focus on all employee salaries
function composeTraversals<A, B, C>(
  t1: Traversal<A, B>,
  t2: Traversal<B, C>
): Traversal<A, C> {
  return traversal(
    (a) => t1.toList(a).flatMap(t2.toList),
    (f) => t1.modify(t2.modify(f))
  );
}

// Build complex optic
const allSalaries = compose(
  departmentsL,
  {
    get: (deps) => deps,
    set: (deps) => () => deps
  } as any  // Simplified
);

// Give everyone a 10% raise
function giveRaise(company: Company): Company {
  return modify(
    departmentsL,
    (deps) =>
      deps.map(dep =>
        modify(
          employeesL,
          (emps) =>
            emps.map(emp =>
              modify(salaryL, (sal) => sal * 1.1)(emp)
            )
        )(dep)
      )
  )(company);
}
```

## Optics Library Pattern

```typescript
// Fluent API for optics
class OpticBuilder<S, A> {
  constructor(
    private getF: (s: S) => A,
    private setF: (a: A) => (s: S) => S
  ) {}

  get(s: S): A {
    return this.getF(s);
  }

  set(a: A): (s: S) => S {
    return this.setF(a);
  }

  modify(f: (a: A) => A): (s: S) => S {
    return (s) => this.setF(f(this.getF(s)))(s);
  }

  compose<B>(other: OpticBuilder<A, B>): OpticBuilder<S, B> {
    return new OpticBuilder(
      (s) => other.getF(this.getF(s)),
      (b) => (s) => this.setF(other.setF(b)(this.getF(s)))(s)
    );
  }

  at<K extends keyof A>(key: K): OpticBuilder<S, A[K]> {
    return this.compose(
      new OpticBuilder(
        (a) => a[key],
        (v) => (a) => ({ ...a, [key]: v })
      )
    );
  }
}

// Create optic from root
function fromRoot<S>(): OpticBuilder<S, S> {
  return new OpticBuilder(
    (s) => s,
    (a) => () => a
  );
}

// Usage
type App = {
  user: {
    profile: {
      name: string;
      age: number;
    };
  };
};

const app: App = {
  user: {
    profile: {
      name: 'Alice',
      age: 30
    }
  }
};

const userNameOptic = fromRoot<App>()
  .at('user')
  .at('profile')
  .at('name');

userNameOptic.get(app);                    // 'Alice'
userNameOptic.set('Bob')(app);             // { user: { profile: { name: 'Bob', ... } } }
userNameOptic.modify(s => s.toUpperCase())(app);  // 'ALICE'
```

## Real-World: Form State Management

```typescript
type FormState = {
  fields: {
    email: { value: string; error?: string };
    password: { value: string; error?: string };
  };
  submitting: boolean;
};

// Field lens helper
function field<K extends keyof FormState['fields']>(
  key: K
): Lens<FormState, FormState['fields'][K]> {
  return compose(
    prop('fields'),
    prop(key)
  );
}

const emailField = field('email');
const passwordField = field('password');

// Update field value
function updateFieldValue<K extends keyof FormState['fields']>(
  key: K,
  value: string
): (state: FormState) => FormState {
  return modify(
    compose(field(key), prop('value')),
    () => value
  );
}

// Set field error
function setFieldError<K extends keyof FormState['fields']>(
  key: K,
  error: string
): (state: FormState) => FormState {
  return modify(
    field(key),
    (f) => ({ ...f, error })
  );
}

// Usage
let formState: FormState = {
  fields: {
    email: { value: '' },
    password: { value: '' }
  },
  submitting: false
};

formState = updateFieldValue('email', 'test@example.com')(formState);
formState = setFieldError('email', 'Invalid email')(formState);
```

## Key Takeaways

1. **Lenses** - composable getters/setters for product types
2. **Prisms** - getters/setters for sum types (might not exist)
3. **Optionals** - combination of lens and prism
4. **Traversals** - operate on multiple values at once
5. **Composition** - combine optics to access deeply nested data

Optics eliminate boilerplate for immutable updates. They're composable, type-safe, and make working with complex data structures elegant.
