---
title: Transactional Programming - Managing State Changes Safely
timestamp: 2025-11-15 00:00:00+00:00
description: Learn how to manage complex state changes atomically using Software Transactional Memory and functional patterns for consistent, composable updates.
tags: [fp, stm, concurrency, advanced]
toc: true
---

# Transactional Programming - Managing State Changes Safely

Software Transactional Memory (STM) brings database-style transactions to programming. It allows multiple state changes to be composed atomically, consistently, and in isolation—fundamental for managing complex state in functional programs.

## The Problem with Shared Mutable State

```javascript
// Naive account transfer
class Account {
  constructor(public balance: number) {}

  withdraw(amount: number): void {
    if (this.balance >= amount) {
      this.balance -= amount;
    } else {
      throw new Error('Insufficient funds');
    }
  }

  deposit(amount: number): void {
    this.balance += amount;
  }
}

// Race condition!
function transfer(from: Account, to: Account, amount: number): void {
  from.withdraw(amount);  // What if this succeeds but...
  to.deposit(amount);     // ...this fails? Money disappears!
}
```

Problems:
- **Not atomic** - partial failures leave inconsistent state
- **Not composable** - can't safely combine transfers
- **Race conditions** - concurrent access corrupts state

## Transactional State

A transaction groups multiple state changes into an atomic unit:

```typescript
// Transactional variable
class TVar<A> {
  constructor(private value: A) {}

  // Only readable within transaction
  read(): A {
    return this.value;
  }

  // Only writable within transaction
  write(newValue: A): void {
    this.value = newValue;
  }
}

// Transaction monad
type STM<A> = {
  run: (onSuccess: (a: A) => void, onRetry: () => void) => void;
};

// Create a transaction
function pure<A>(a: A): STM<A> {
  return {
    run: (onSuccess) => onSuccess(a)
  };
}

// Read a transactional variable
function readTVar<A>(tvar: TVar<A>): STM<A> {
  return {
    run: (onSuccess) => onSuccess(tvar.read())
  };
}

// Write a transactional variable
function writeTVar<A>(tvar: TVar<A>, value: A): STM<void> {
  return {
    run: (onSuccess) => {
      tvar.write(value);
      onSuccess(undefined);
    }
  };
}

// Bind transactions together
function bind<A, B>(ma: STM<A>, f: (a: A) => STM<B>): STM<B> {
  return {
    run: (onSuccess, onRetry) => {
      ma.run(
        a => f(a).run(onSuccess, onRetry),
        onRetry
      );
    }
  };
}
```

## Atomic Account Transfer

```typescript
class AccountSTM {
  constructor(public balanceVar: TVar<number>) {}

  withdraw(amount: number): STM<void> {
    return bind(readTVar(this.balanceVar), balance => {
      if (balance >= amount) {
        return writeTVar(this.balanceVar, balance - amount);
      } else {
        // Retry transaction
        return {
          run: (_, onRetry) => onRetry()
        };
      }
    });
  }

  deposit(amount: number): STM<void> {
    return bind(readTVar(this.balanceVar), balance =>
      writeTVar(this.balanceVar, balance + amount)
    );
  }
}

// Atomic transfer - all or nothing!
function transfer(
  from: AccountSTM,
  to: AccountSTM,
  amount: number
): STM<void> {
  return bind(from.withdraw(amount), () =>
    to.deposit(amount)
  );
}

// Execute transaction
function atomically<A>(stm: STM<A>): A {
  let result: A | undefined;
  let retryCount = 0;
  const maxRetries = 100;

  while (result === undefined && retryCount < maxRetries) {
    try {
      stm.run(
        (a) => { result = a; },
        () => { retryCount++; }
      );
    } catch (e) {
      retryCount++;
    }
  }

  if (result === undefined) {
    throw new Error('Transaction failed after max retries');
  }

  return result;
}

// Usage
const alice = new AccountSTM(new TVar(100));
const bob = new AccountSTM(new TVar(50));

atomically(transfer(alice, bob, 30));
// Either both succeed or both fail - no partial state!
```

## Composable Transactions

```typescript
// Helper: modify a TVar with a function
function modifyTVar<A>(
  tvar: TVar<A>,
  f: (a: A) => A
): STM<void> {
  return bind(readTVar(tvar), value =>
    writeTVar(tvar, f(value))
  );
}

// Increment counter
function increment(counter: TVar<number>): STM<void> {
  return modifyTVar(counter, n => n + 1);
}

// Decrement counter
function decrement(counter: TVar<number>): STM<void> {
  return modifyTVar(counter, n => n - 1);
}

// Compose transactions
function compose<A, B, C>(
  f: (a: A) => STM<B>,
  g: (b: B) => STM<C>
): (a: A) => STM<C> {
  return a => bind(f(a), g);
}

// Sequence multiple transactions
function sequence<A>(stms: STM<A>[]): STM<A[]> {
  if (stms.length === 0) {
    return pure([]);
  }

  const [head, ...tail] = stms;

  return bind(head, a =>
    bind(sequence(tail), as =>
      pure([a, ...as])
    )
  );
}

// Example: atomic multi-transfer
function multiTransfer(
  transfers: Array<[AccountSTM, AccountSTM, number]>
): STM<void> {
  const stms = transfers.map(([from, to, amount]) =>
    transfer(from, to, amount)
  );

  return bind(sequence(stms), () => pure(undefined));
}
```

## Retry and OrElse

```typescript
// Retry transaction until condition is met
function retry<A>(): STM<A> {
  return {
    run: (_, onRetry) => onRetry()
  };
}

// Try first transaction, fallback to second on retry
function orElse<A>(first: STM<A>, second: STM<A>): STM<A> {
  return {
    run: (onSuccess, onRetry) => {
      let firstRetried = false;

      first.run(
        onSuccess,
        () => {
          firstRetried = true;
          second.run(onSuccess, onRetry);
        }
      );
    }
  };
}

// Example: withdraw from either account
function withdrawEither(
  acc1: AccountSTM,
  acc2: AccountSTM,
  amount: number
): STM<void> {
  return orElse(
    acc1.withdraw(amount),
    acc2.withdraw(amount)
  );
}

// Check and wait pattern
function check(condition: boolean): STM<void> {
  return condition ? pure(undefined) : retry();
}

// Wait until balance is sufficient
function waitForFunds(
  account: AccountSTM,
  minAmount: number
): STM<void> {
  return bind(readTVar(account.balanceVar), balance =>
    check(balance >= minAmount)
  );
}
```

## Advanced: Transaction Log

```typescript
// Track reads and writes for optimistic concurrency
class TransactionLog {
  private reads = new Map<TVar<any>, any>();
  private writes = new Map<TVar<any>, any>();

  readVar<A>(tvar: TVar<A>): A {
    // Check if we've written to it in this transaction
    if (this.writes.has(tvar)) {
      return this.writes.get(tvar);
    }

    // Otherwise read and log
    const value = tvar.read();
    if (!this.reads.has(tvar)) {
      this.reads.set(tvar, value);
    }
    return value;
  }

  writeVar<A>(tvar: TVar<A>, value: A): void {
    this.writes.set(tvar, value);
  }

  validate(): boolean {
    // Check all reads are still valid
    for (const [tvar, oldValue] of this.reads) {
      if (tvar.read() !== oldValue) {
        return false;
      }
    }
    return true;
  }

  commit(): void {
    // Write all pending writes
    for (const [tvar, value] of this.writes) {
      tvar.write(value);
    }
  }

  clear(): void {
    this.reads.clear();
    this.writes.clear();
  }
}

// STM with transaction log
function runSTM<A>(stm: STM<A>): A {
  const maxRetries = 100;

  for (let i = 0; i < maxRetries; i++) {
    const log = new TransactionLog();
    let result: A | undefined;
    let shouldRetry = false;

    stm.run(
      (a) => { result = a; },
      () => { shouldRetry = true; }
    );

    if (shouldRetry) {
      log.clear();
      continue;
    }

    // Optimistic check: did any reads change?
    if (log.validate()) {
      log.commit();
      return result!;
    }

    // Conflict detected, retry
    log.clear();
  }

  throw new Error('Transaction failed: too many conflicts');
}
```

## Real-World: Task Queue

```typescript
// Concurrent task queue with STM
class TaskQueue<T> {
  private queueVar: TVar<T[]>;
  private workersVar: TVar<number>;

  constructor(maxWorkers: number) {
    this.queueVar = new TVar([]);
    this.workersVar = new TVar(maxWorkers);
  }

  // Add task to queue
  enqueue(task: T): STM<void> {
    return modifyTVar(this.queueVar, queue => [...queue, task]);
  }

  // Take task from queue (wait if empty or no workers)
  dequeue(): STM<T> {
    return bind(readTVar(this.queueVar), queue =>
      bind(readTVar(this.workersVar), workers => {
        if (queue.length === 0) {
          return retry();  // Wait for tasks
        }

        if (workers === 0) {
          return retry();  // Wait for available worker
        }

        const [task, ...rest] = queue;

        return bind(writeTVar(this.queueVar, rest), () =>
          bind(writeTVar(this.workersVar, workers - 1), () =>
            pure(task)
          )
        );
      })
    );
  }

  // Release worker back to pool
  releaseWorker(): STM<void> {
    return modifyTVar(this.workersVar, n => n + 1);
  }

  // Batch enqueue
  enqueueBatch(tasks: T[]): STM<void> {
    return modifyTVar(this.queueVar, queue => [...queue, ...tasks]);
  }
}

// Process tasks with automatic worker management
async function processTasks<T>(
  queue: TaskQueue<T>,
  process: (task: T) => Promise<void>
): Promise<void> {
  const task = atomically(queue.dequeue());

  try {
    await process(task);
  } finally {
    atomically(queue.releaseWorker());
  }
}
```

## Snapshot Isolation

```typescript
// Versioned value for snapshot isolation
class VersionedValue<A> {
  constructor(
    private value: A,
    private version: number = 0
  ) {}

  read(): [A, number] {
    return [this.value, this.version];
  }

  write(newValue: A): void {
    this.value = newValue;
    this.version++;
  }

  getVersion(): number {
    return this.version;
  }
}

// Transaction with snapshot isolation
class IsolatedTransaction {
  private snapshot = new Map<VersionedValue<any>, number>();
  private writes = new Map<VersionedValue<any>, any>();

  read<A>(vv: VersionedValue<A>): A {
    // Use written value if exists
    if (this.writes.has(vv)) {
      return this.writes.get(vv);
    }

    // Read and record version
    const [value, version] = vv.read();
    if (!this.snapshot.has(vv)) {
      this.snapshot.set(vv, version);
    }

    return value;
  }

  write<A>(vv: VersionedValue<A>, value: A): void {
    this.writes.set(vv, value);
  }

  commit(): boolean {
    // Check for conflicts
    for (const [vv, version] of this.snapshot) {
      if (vv.getVersion() !== version) {
        return false;  // Conflict!
      }
    }

    // Commit writes
    for (const [vv, value] of this.writes) {
      vv.write(value);
    }

    return true;
  }
}

// Example: concurrent counter with snapshot isolation
const counter = new VersionedValue(0);

function incrementIsolated(): boolean {
  const txn = new IsolatedTransaction();
  const current = txn.read(counter);
  txn.write(counter, current + 1);
  return txn.commit();
}

// Retry until commit succeeds
function incrementWithRetry(): void {
  while (!incrementIsolated()) {
    // Conflict detected, retry
  }
}
```

## Key Takeaways

1. **Atomicity** - transactions execute all-or-nothing
2. **Composability** - combine transactions like pure functions
3. **Retry semantics** - automatic retries on conflicts or conditions
4. **OrElse** - fallback transactions for flexible control flow
5. **Isolation** - snapshot isolation prevents interference

STM brings principled state management to functional programming. It eliminates race conditions while maintaining composability—essential for building reliable concurrent systems.
