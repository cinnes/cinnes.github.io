---
title: Effect Systems - Tracking and Controlling Side Effects
timestamp: 2025-11-16 00:00:00+00:00
description: Master effect systems to make side effects explicit, composable, and controllable through MTL-style type classes and monad transformers.
tags: [fp, effects, mtl, haskell]
toc: true
---


Effect systems make side effects explicit in type signatures, allowing you to track, compose, and handle effects separately from business logic. Haskell's MTL (Monad Transformer Library) provides this through type classes.

## The Problem with Hidden Effects

```haskell
-- What effects does this function have?
processUser :: Int -> User
processUser userId =
  let user = queryDatabase userId  -- Database I/O!
      _ = log "User accessed"        -- Logging!
  in if isNothing user
    then error "Not found"           -- Exception!
    else fromJust user
-- Type signature lies - claims to be pure!
```

Effects are hidden - the type doesn't reveal:
- **Database access** - I/O dependency
- **Logging** - side effect
- **Exceptions** - partial function

## MTL - Effect Type Classes

MTL uses type classes to describe effects:

```haskell
import Control.Monad.Reader
import Control.Monad.State
import Control.Monad.Except
import Control.Monad.Writer

-- MonadReader - read-only environment
class Monad m => MonadReader r m | m -> r where
  ask :: m r
  local :: (r -> r) -> m a -> m a

-- MonadState - mutable state
class Monad m => MonadState s m | m -> s where
  get :: m s
  put :: s -> m ()

-- MonadError - error handling
class Monad m => MonadError e m | m -> e where
  throwError :: e -> m a
  catchError :: m a -> (e -> m a) -> m a

-- MonadWriter - accumulating output
class Monad m => MonadWriter w m | m -> w where
  tell :: w -> m ()
  listen :: m a -> m (a, w)
```

## Explicit Effects in Types

```haskell
-- Now effects are visible!
processUser :: (MonadReader Config m, MonadError String m, MonadIO m)
            => Int -> m User
processUser userId = do
  config <- ask                    -- Read config
  user <- liftIO $ queryDB config userId  -- I/O
  case user of
    Nothing -> throwError "User not found"  -- Error
    Just u -> return u

-- Type signature tells us exactly what effects this uses
```

## Reader - Configuration

Pass configuration without explicit threading:

```haskell
import Control.Monad.Reader

data Config = Config
  { dbHost :: String
  , dbPort :: Int
  , apiKey :: String
  }

-- Business logic with Config access
getDbConnection :: (MonadReader Config m, MonadIO m) => m Connection
getDbConnection = do
  config <- ask
  liftIO $ connect (dbHost config) (dbPort config)

makeApiRequest :: (MonadReader Config m, MonadIO m) => String -> m Response
makeApiRequest endpoint = do
  config <- ask
  liftIO $ httpGet endpoint (apiKey config)

-- Compose operations
processData :: (MonadReader Config m, MonadIO m) => m Result
processData = do
  conn <- getDbConnection
  data' <- liftIO $ queryDB conn "SELECT * FROM users"
  response <- makeApiRequest "/api/process"
  return $ combine data' response

-- Run with config
main :: IO ()
main = do
  let config = Config "localhost" 5432 "secret-key"
  result <- runReaderT processData config
  print result
```

## State - Mutable State

Thread state through computations:

```haskell
import Control.Monad.State

-- Counter with state
increment :: MonadState Int m => m ()
increment = modify (+1)

getCount :: MonadState Int m => m Int
getCount = get

-- Example: count operations
countOps :: MonadState Int m => [Int] -> m Int
countOps [] = getCount
countOps (x:xs) = do
  increment  -- Count this operation
  -- Process x...
  countOps xs

-- Run with initial state
main :: IO ()
main = do
  let (result, finalCount) = runState (countOps [1..100]) 0
  print finalCount  -- 100
```

## Error - Exception Handling

Type-safe error handling:

```haskell
import Control.Monad.Except

data AppError
  = NotFound String
  | Unauthorized
  | ValidationError String
  deriving Show

-- Functions that can fail
findUser :: MonadError AppError m => Int -> m User
findUser userId =
  if userId > 0
    then return (User userId "Alice")
    else throwError (ValidationError "Invalid user ID")

requireAuth :: MonadError AppError m => Maybe Token -> m Token
requireAuth Nothing = throwError Unauthorized
requireAuth (Just token) = return token

-- Compose failable operations
getAuthenticatedUser :: (MonadError AppError m) => Maybe Token -> Int -> m User
getAuthenticatedUser maybeToken userId = do
  token <- requireAuth maybeToken
  user <- findUser userId
  return user

-- Handle errors
main :: IO ()
main = do
  result <- runExceptT $ getAuthenticatedUser Nothing 42
  case result of
    Left Unauthorized -> putStrLn "Not authorized"
    Left (NotFound msg) -> putStrLn $ "Not found: " ++ msg
    Left (ValidationError msg) -> putStrLn $ "Invalid: " ++ msg
    Right user -> print user
```

## Writer - Logging

Accumulate log messages:

```haskell
import Control.Monad.Writer

-- Log with Writer
processItem :: MonadWriter [String] m => Int -> m Int
processItem x = do
  tell ["Processing: " ++ show x]
  let result = x * 2
  tell ["Result: " ++ show result]
  return result

processAll :: MonadWriter [String] m => [Int] -> m [Int]
processAll xs = mapM processItem xs

-- Run and get logs
main :: IO ()
main = do
  let (results, logs) = runWriter (processAll [1, 2, 3])
  print results  -- [2, 4, 6]
  mapM_ putStrLn logs
  -- Processing: 1
  -- Result: 2
  -- Processing: 2
  -- Result: 4
  -- ...
```

## Combining Effects

Use multiple effects together:

```haskell
-- Multiple constraints
processUser :: ( MonadReader Config m
               , MonadState Int m
               , MonadError AppError m
               , MonadWriter [String] m
               , MonadIO m
               )
            => Int -> m User
processUser userId = do
  -- Reader
  config <- ask
  tell ["Using config: " ++ show config]

  -- State
  modify (+1)  -- Increment request counter

  -- Error
  when (userId <= 0) $
    throwError (ValidationError "Invalid ID")

  -- IO
  user <- liftIO $ queryDatabase config userId

  -- Writer
  tell ["Fetched user: " ++ show userId]

  return user
```

## Monad Transformers

Stack effects with transformers:

```haskell
import Control.Monad.Trans.Reader
import Control.Monad.Trans.State
import Control.Monad.Trans.Except

-- Concrete monad stack
type App a = ReaderT Config (StateT Int (ExceptT AppError IO)) a

-- Or using mtl style
-- App automatically has all the instances

-- Run the stack
runApp :: Config -> Int -> App a -> IO (Either AppError (a, Int))
runApp config initialState action =
  runExceptT $
    runStateT (runReaderT action config) initialState

-- Example
app :: App User
app = do
  config <- ask
  count <- get
  put (count + 1)
  liftIO $ putStrLn "Processing..."
  findUser 42

main :: IO ()
main = do
  let config = Config "localhost" 5432 "key"
  result <- runApp config 0 app
  case result of
    Left err -> print err
    Right (user, count) -> print (user, count)
```

## Custom Effect Type Classes

Define your own effects:

```haskell
-- Custom effect: logging
class Monad m => MonadLog m where
  logInfo :: String -> m ()
  logError :: String -> m ()
  logDebug :: String -> m ()

-- Custom effect: database
class Monad m => MonadDB m where
  query :: String -> m [Row]
  execute :: String -> m Int

-- Custom effect: cache
class Monad m => MonadCache m where
  cacheGet :: String -> m (Maybe Value)
  cacheSet :: String -> Value -> m ()

-- Business logic using custom effects
fetchUser :: (MonadDB m, MonadCache m, MonadLog m) => Int -> m User
fetchUser userId = do
  logInfo $ "Fetching user: " ++ show userId

  -- Try cache first
  cached <- cacheGet ("user:" ++ show userId)
  case cached of
    Just user -> do
      logDebug "Cache hit"
      return user
    Nothing -> do
      logDebug "Cache miss"
      rows <- query $ "SELECT * FROM users WHERE id = " ++ show userId
      let user = parseUser (head rows)
      cacheSet ("user:" ++ show userId) user
      return user
```

## Effect Instances

Implement custom effects for different contexts:

```haskell
-- Production instances
instance MonadLog IO where
  logInfo msg = putStrLn $ "[INFO] " ++ msg
  logError msg = putStrLn $ "[ERROR] " ++ msg
  logDebug msg = putStrLn $ "[DEBUG] " ++ msg

-- Test instances
data TestEnv = TestEnv
  { envLogs :: IORef [String]
  , envCache :: IORef (Map String Value)
  }

newtype TestM a = TestM { runTestM :: ReaderT TestEnv IO a }
  deriving (Functor, Applicative, Monad, MonadIO, MonadReader TestEnv)

instance MonadLog TestM where
  logInfo msg = do
    logsRef <- asks envLogs
    liftIO $ modifyIORef logsRef (++ ["INFO: " ++ msg])
  logError msg = do
    logsRef <- asks envLogs
    liftIO $ modifyIORef logsRef (++ ["ERROR: " ++ msg])
  logDebug msg = return ()  -- Ignore in tests

instance MonadCache TestM where
  cacheGet key = do
    cacheRef <- asks envCache
    cache <- liftIO $ readIORef cacheRef
    return $ Map.lookup key cache
  cacheSet key value = do
    cacheRef <- asks envCache
    liftIO $ modifyIORef cacheRef (Map.insert key value)
```

## Polymorphic Effect Functions

Write once, run anywhere:

```haskell
-- Generic business logic
processOrder :: ( MonadDB m
                , MonadLog m
                , MonadCache m
                , MonadError AppError m
                ) => Order -> m Receipt
processOrder order = do
  logInfo $ "Processing order: " ++ show (orderId order)

  -- Validate
  valid <- validateOrder order
  unless valid $
    throwError (ValidationError "Invalid order")

  -- Check inventory
  available <- checkInventory (orderItems order)
  unless available $
    throwError (NotFound "Item out of stock")

  -- Process payment
  paymentResult <- processPayment (orderPayment order)

  -- Update database
  execute $ "INSERT INTO orders ..."

  logInfo "Order processed successfully"
  return (makeReceipt order paymentResult)

-- Run in production
main :: IO ()
main = runProdApp $ processOrder myOrder

-- Run in tests
testProcessOrder :: IO ()
testProcessOrder = runTestApp $ processOrder testOrder
```

## ReaderT Pattern

Common pattern: ReaderT over IO:

```haskell
-- Application monad
data Env = Env
  { envConfig :: Config
  , envLogger :: Logger
  , envDB :: Connection
  }

newtype App a = App { unApp :: ReaderT Env IO a }
  deriving (Functor, Applicative, Monad, MonadIO, MonadReader Env)

-- Helper functions
runApp :: Env -> App a -> IO a
runApp env app = runReaderT (unApp app) env

getConfig :: App Config
getConfig = asks envConfig

getLogger :: App Logger
getLogger = asks envLogger

getDB :: App Connection
getDB = asks envDB

-- Business logic
processRequest :: Request -> App Response
processRequest req = do
  logger <- getLogger
  db <- getDB

  liftIO $ logMessage logger "Processing request"
  result <- liftIO $ queryDB db (reqQuery req)

  return $ makeResponse result
```

## Effect Isolation

Keep effects at the edges:

```haskell
-- Pure core logic
validateOrder :: Order -> Bool
validateOrder order =
  not (null (orderItems order)) &&
  orderTotal order > 0

calculateDiscount :: Order -> Customer -> Double
calculateDiscount order customer =
  let baseDiscount = if customerVIP customer then 0.1 else 0
      volumeDiscount = if orderTotal order > 1000 then 0.05 else 0
  in baseDiscount + volumeDiscount

-- Effectful shell
processOrderIO :: (MonadIO m, MonadDB m, MonadLog m) => Order -> m Receipt
processOrderIO order = do
  -- Pure validation
  unless (validateOrder order) $
    error "Invalid order"

  -- Fetch data
  customer <- fetchCustomer (orderCustomerId order)

  -- Pure calculation
  let discount = calculateDiscount order customer
  let finalTotal = orderTotal order * (1 - discount)

  -- Save and log
  logInfo $ "Processing order with discount: " ++ show discount
  saveOrder order finalTotal
  return (makeReceipt order finalTotal)
```

## Key Takeaways

1. **Type classes** - describe effects as constraints
2. **MTL** - standard effect type classes (Reader, State, Error, Writer)
3. **Transformers** - stack multiple effects
4. **Custom effects** - define domain-specific effect interfaces
5. **Polymorphic** - write once, run in multiple contexts

Haskell's effect systems make side effects explicit, testable, and composable. By encoding effects in types, you gain compile-time guarantees about what your code can do, making programs easier to reason about and refactor.
