---
title: Transactional Programming - Managing State Changes Safely
timestamp: 2025-11-15 00:00:00+00:00
description: Learn how to manage complex state changes atomically using Haskell's Software Transactional Memory for consistent, composable updates.
tags: [fp, stm, concurrency, haskell]
toc: true
---

# Transactional Programming - Managing State Changes Safely

Software Transactional Memory (STM) brings database-style ACID transactions to concurrent programming. Haskell's STM is built into the language, providing composable atomic state changes without locks.

## The Problem with Locks

```haskell
-- Naive account transfer with IORefs
transfer :: IORef Int -> IORef Int -> Int -> IO ()
transfer fromRef toRef amount = do
  fromBalance <- readIORef fromRef
  when (fromBalance >= amount) $ do
    writeIORef fromRef (fromBalance - amount)
    -- What if program crashes here?
    toBalance <- readIORef toRef
    writeIORef toRef (toBalance + amount)
-- Not atomic! Race conditions! Partial failures!
```

Problems:
- **Not atomic** - can see partial state
- **Not composable** - combining operations is error-prone
- **Deadlocks** - locks can create circular dependencies

## STM - Atomic Transactions

STM provides composable atomic operations:

```haskell
import Control.Concurrent.STM
import Control.Monad

-- TVar: transactional variable
-- STM: transactional monad

-- Atomic account transfer
transfer :: TVar Int -> TVar Int -> Int -> STM ()
transfer fromVar toVar amount = do
  fromBalance <- readTVar fromVar
  when (fromBalance >= amount) $ do
    writeTVar fromVar (fromBalance - amount)
    toBalance <- readTVar toVar
    writeTVar toVar (toBalance + amount)

-- Execute atomically
atomically :: STM a -> IO a

-- Usage
main :: IO ()
main = do
  alice <- newTVarIO 100
  bob <- newTVarIO 50

  -- Run atomically: all or nothing!
  atomically $ transfer alice bob 30

  aliceBalance <- readTVarIO alice
  bobBalance <- readTVarIO bob
  print (aliceBalance, bobBalance)
  -- (70, 80)
```

## Composing Transactions

STM transactions compose like pure functions:

```haskell
-- Individual operations
withdraw :: TVar Int -> Int -> STM ()
withdraw account amount = do
  balance <- readTVar account
  if balance >= amount
    then writeTVar account (balance - amount)
    else retry  -- Block until balance sufficient

deposit :: TVar Int -> Int -> STM ()
deposit account amount = do
  balance <- readTVar account
  writeTVar account (balance + amount)

-- Compose into transfer
transfer' :: TVar Int -> TVar Int -> Int -> STM ()
transfer' from to amount = do
  withdraw from amount
  deposit to amount

-- Execute
atomically $ transfer' alice bob 30
```

## retry - Blocking Transactions

`retry` blocks until a transaction can succeed:

```haskell
-- Wait until balance is sufficient
withdrawBlocking :: TVar Int -> Int -> STM ()
withdrawBlocking account amount = do
  balance <- readTVar account
  if balance >= amount
    then writeTVar account (balance - amount)
    else retry  -- Automatically retries when account changes

-- Will block if insufficient funds
atomically $ withdrawBlocking alice 1000
-- Blocks until alice has >= 1000
```

## orElse - Alternative Transactions

Try one transaction, fall back to another:

```haskell
-- orElse :: STM a -> STM a -> STM a

-- Withdraw from either account
withdrawEither :: TVar Int -> TVar Int -> Int -> STM ()
withdrawEither acc1 acc2 amount =
  withdraw acc1 amount `orElse` withdraw acc2 amount

-- Try alice, fall back to bob
atomically $ withdrawEither alice bob 30
```

## check - Conditional Blocking

Block until a condition is met:

```haskell
-- check :: Bool -> STM ()
-- check False = retry
-- check True = return ()

waitForBalance :: TVar Int -> Int -> STM ()
waitForBalance account minAmount = do
  balance <- readTVar account
  check (balance >= minAmount)

-- Block until alice has at least 100
atomically $ waitForBalance alice 100
```

## Practical Example: Bank

```haskell
data Account = Account
  { accountBalance :: TVar Int
  , accountName :: String
  } deriving (Eq)

newAccount :: String -> Int -> IO Account
newAccount name balance = do
  balanceVar <- newTVarIO balance
  return $ Account balanceVar name

-- Get balance (in STM)
getBalance :: Account -> STM Int
getBalance = readTVar . accountBalance

-- Transfer with validation
safeTransfer :: Account -> Account -> Int -> STM ()
safeTransfer from to amount = do
  when (from == to) $
    error "Cannot transfer to same account"
  when (amount <= 0) $
    error "Amount must be positive"

  fromBalance <- getBalance from
  when (fromBalance < amount) retry

  withdraw (accountBalance from) amount
  deposit (accountBalance to) amount

-- Concurrent transfers - all atomic!
main :: IO ()
main = do
  alice <- newAccount "Alice" 1000
  bob <- newAccount "Bob" 500
  charlie <- newAccount "Charlie" 200

  -- Run concurrently
  concurrently_
    (atomically $ safeTransfer alice bob 100)
    (atomically $ safeTransfer bob charlie 50)

  balances <- atomically $ do
    a <- getBalance alice
    b <- getBalance bob
    c <- getBalance charlie
    return (a, b, c)

  print balances
  -- (900, 550, 250) - always consistent!
```

## TQueue - Transactional Queue

STM provides composable concurrent data structures:

```haskell
import Control.Concurrent.STM.TQueue

-- Create a queue
queue <- newTQueueIO :: IO (TQueue Int)

-- Write to queue
atomically $ writeTQueue queue 42

-- Read from queue (blocks if empty)
value <- atomically $ readTQueue queue

-- Non-blocking read
maybeValue <- atomically $ tryReadTQueue queue
```

### Producer-Consumer Pattern

```haskell
producer :: TQueue Int -> IO ()
producer queue = forM_ [1..100] $ \i -> do
  atomically $ writeTQueue queue i
  threadDelay 10000

consumer :: String -> TQueue Int -> IO ()
consumer name queue = forever $ do
  item <- atomically $ readTQueue queue
  putStrLn $ name ++ " consumed: " ++ show item

main :: IO ()
main = do
  queue <- newTQueueIO

  -- Multiple producers and consumers
  forkIO $ producer queue
  forkIO $ consumer "Consumer 1" queue
  forkIO $ consumer "Consumer 2" queue

  threadDelay 10000000
```

## TVar - Shared State

Complex shared state with multiple TVars:

```haskell
data Inventory = Inventory
  { itemStock :: TVar (Map String Int)
  , itemReserved :: TVar (Map String Int)
  }

newInventory :: IO Inventory
newInventory = Inventory
  <$> newTVarIO Map.empty
  <*> newTVarIO Map.empty

-- Reserve items atomically
reserveItem :: Inventory -> String -> Int -> STM Bool
reserveItem inv item qty = do
  stock <- readTVar (itemStock inv)
  reserved <- readTVar (itemReserved inv)

  let available = Map.findWithDefault 0 item stock
  let currentReserved = Map.findWithDefault 0 item reserved

  if available - currentReserved >= qty
    then do
      writeTVar (itemReserved inv) $
        Map.insertWith (+) item qty reserved
      return True
    else return False

-- Complete reservation
completeReservation :: Inventory -> String -> Int -> STM ()
completeReservation inv item qty = do
  stock <- readTVar (itemStock inv)
  reserved <- readTVar (itemReserved inv)

  writeTVar (itemStock inv) $
    Map.adjust (subtract qty) item stock
  writeTVar (itemReserved inv) $
    Map.adjust (subtract qty) item reserved

-- Both operations are atomic!
purchaseItem :: Inventory -> String -> Int -> IO Bool
purchaseItem inv item qty = atomically $ do
  success <- reserveItem inv item qty
  when success $
    completeReservation inv item qty
  return success
```

## TMVar - Transactional MVar

Blocking read/write variable:

```haskell
import Control.Concurrent.STM.TMVar

-- Create empty TMVar
tmvar <- newEmptyTMVarIO :: IO (TMVar Int)

-- Put value (blocks if full)
atomically $ putTMVar tmvar 42

-- Take value (blocks if empty)
value <- atomically $ takeTMVar tmvar

-- Non-blocking operations
atomically $ tryPutTMVar tmvar 100
atomically $ tryTakeTMVar tmvar
```

## Exception Handling in STM

STM transactions can throw and catch exceptions:

```haskell
import Control.Exception

data InsufficientFunds = InsufficientFunds Int Int
  deriving (Show, Exception)

withdrawWithException :: TVar Int -> Int -> STM ()
withdrawWithException account amount = do
  balance <- readTVar account
  if balance >= amount
    then writeTVar account (balance - amount)
    else throwSTM $ InsufficientFunds balance amount

-- Handle in STM
transferSafe :: TVar Int -> TVar Int -> Int -> STM (Either String ())
transferSafe from to amount =
  (Right <$> transfer from to amount) `catchSTM` \(e :: InsufficientFunds) ->
    return $ Left $ "Transfer failed: " ++ show e

-- Or handle in IO
main :: IO ()
main = do
  alice <- newTVarIO 100
  bob <- newTVarIO 50

  result <- atomically $ transferSafe alice bob 200
  case result of
    Left err -> putStrLn err
    Right () -> putStrLn "Transfer successful"
```

## Invariants with always

Enforce invariants that are checked on every transaction:

```haskell
-- always :: STM a -> STM ()

data Account = Account
  { balance :: TVar Int
  , overdraftLimit :: Int
  }

-- Enforce invariant: balance >= -overdraftLimit
enforceOverdraft :: Account -> STM ()
enforceOverdraft acc = always $ do
  bal <- readTVar (balance acc)
  check (bal >= negate (overdraftLimit acc))

main :: IO ()
main = do
  balanceVar <- newTVarIO 100
  let acc = Account balanceVar 50

  atomically $ enforceOverdraft acc

  -- This will fail if it violates invariant
  atomically $ writeTVar balanceVar (-100)
  -- Exception: invariant violated
```

## Performance Considerations

STM has automatic optimistic concurrency:

```haskell
-- Good: short transactions
shortTransaction :: TVar Int -> STM ()
shortTransaction var = do
  x <- readTVar var
  writeTVar var (x + 1)

-- Bad: long-running computation in transaction
badTransaction :: TVar Int -> STM Int
badTransaction var = do
  x <- readTVar var
  let result = expensiveComputation x  -- BAD!
  writeTVar var result
  return result

-- Good: computation outside transaction
goodTransaction :: TVar Int -> IO Int
goodTransaction var = do
  x <- atomically $ readTVar var
  let result = expensiveComputation x  -- Outside STM
  atomically $ writeTVar var result
  return result
```

## Real-World: Job Queue

```haskell
data Job = Job
  { jobId :: Int
  , jobData :: String
  } deriving (Show, Eq)

data JobQueue = JobQueue
  { pending :: TQueue Job
  , inProgress :: TVar (Set Int)
  , completed :: TVar (Set Int)
  }

newJobQueue :: IO JobQueue
newJobQueue = JobQueue
  <$> newTQueueIO
  <*> newTVarIO Set.empty
  <*> newTVarIO Set.empty

-- Submit job
submitJob :: JobQueue -> Job -> STM ()
submitJob queue job = writeTQueue (pending queue) job

-- Claim job (atomic!)
claimJob :: JobQueue -> STM (Maybe Job)
claimJob queue = do
  maybeJob <- tryReadTQueue (pending queue)
  case maybeJob of
    Nothing -> return Nothing
    Just job -> do
      modifyTVar' (inProgress queue) (Set.insert (jobId job))
      return (Just job)

-- Complete job
completeJob :: JobQueue -> Job -> STM ()
completeJob queue job = do
  modifyTVar' (inProgress queue) (Set.delete (jobId job))
  modifyTVar' (completed queue) (Set.insert (jobId job))

-- Worker
worker :: String -> JobQueue -> IO ()
worker name queue = forever $ do
  maybeJob <- atomically $ claimJob queue
  case maybeJob of
    Nothing -> threadDelay 100000
    Just job -> do
      putStrLn $ name ++ " processing: " ++ show job
      threadDelay 1000000  -- Simulate work
      atomically $ completeJob queue job
```

## Key Takeaways

1. **Atomic** - transactions execute all-or-nothing
2. **Composable** - combine transactions like pure functions
3. **retry** - block until conditions are met
4. **orElse** - fallback transactions
5. **No deadlocks** - optimistic concurrency, no locks

Haskell's STM provides principled, composable concurrency. It eliminates race conditions and deadlocks while maintaining the benefits of functional programming. All concurrent state changes are atomic and consistent.
