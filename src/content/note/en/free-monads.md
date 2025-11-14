---
title: Free Monads - Separating Description from Interpretation
timestamp: 2025-11-17 00:00:00+00:00
description: Build programs as data structures using free monads to completely separate program description from execution, enabling multiple interpreters and optimizations.
tags: [fp, monads, free, haskell]
toc: true
---


Free monads let you build programs as pure data structures, completely separating *what* your program does from *how* it does it. This enables multiple interpreters, optimizations, and testing without changing business logic.

## The Free Monad Type

```haskell
import Control.Monad.Free

-- Free monad: the freest monad over a functor
data Free f a
  = Pure a
  | Free (f (Free f a))

instance Functor f => Functor (Free f) where
  fmap f (Pure a) = Pure (f a)
  fmap f (Free fa) = Free (fmap (fmap f) fa)

instance Functor f => Applicative (Free f) where
  pure = Pure
  Pure f <*> Pure a = Pure (f a)
  Pure f <*> Free fa = Free (fmap (fmap f) fa)
  Free ff <*> fa = Free (fmap (<*> fa) ff)

instance Functor f => Monad (Free f) where
  Pure a >>= f = f a
  Free fa >>= f = Free (fmap (>>= f) fa)

-- Lift a functor into Free
liftF :: Functor f => f a -> Free f a
liftF fa = Free (fmap Pure fa)
```

## Building a DSL

Define operations as a functor:

```haskell
{-# LANGUAGE DeriveFunctor #-}

-- Console DSL
data ConsoleF next
  = Print String next
  | ReadLine (String -> next)
  deriving Functor

type Console = Free ConsoleF

-- Smart constructors
printLine :: String -> Console ()
printLine msg = liftF (Print msg ())

readLine :: Console String
readLine = liftF (ReadLine id)

-- Build programs
greet :: Console ()
greet = do
  printLine "What's your name?"
  name <- readLine
  printLine $ "Hello, " ++ name ++ "!"
```

## Interpreters

The power: multiple ways to run the same program!

```haskell
-- Interpreter 1: Real IO
runConsoleIO :: Console a -> IO a
runConsoleIO (Pure a) = return a
runConsoleIO (Free (Print msg next)) = do
  putStrLn msg
  runConsoleIO next
runConsoleIO (Free (ReadLine cont)) = do
  input <- getLine
  runConsoleIO (cont input)

-- Interpreter 2: Pure testing
runConsolePure :: [String] -> Console a -> (a, [String])
runConsolePure inputs prog = run inputs [] prog
  where
    run _ output (Pure a) = (a, reverse output)
    run inputs output (Free (Print msg next)) =
      run inputs (msg : output) next
    run (i:is) output (Free (ReadLine cont)) =
      run is output (cont i)
    run [] output (Free (ReadLine cont)) =
      run [] output (cont "")

-- Usage
main :: IO ()
main = runConsoleIO greet

-- Test
test :: ((), [String])
test = runConsolePure ["Alice"] greet
-- ((), ["What's your name?", "Hello, Alice!"])
```

## HTTP DSL

```haskell
data HttpF next
  = Get String (Response -> next)
  | Post String Body (Response -> next)
  | Delete String (next)
  deriving Functor

type Http = Free HttpF

-- Smart constructors
httpGet :: String -> Http Response
httpGet url = liftF (Get url id)

httpPost :: String -> Body -> Http Response
httpPost url body = liftF (Post url body id)

httpDelete :: String -> Http ()
httpDelete url = liftF (Delete url ())

-- Example program
getUserData :: Int -> Http User
getUserData userId = do
  resp <- httpGet $ "/users/" ++ show userId
  return (parseUser resp)

createUser :: User -> Http Response
createUser user = httpPost "/users" (encodeUser user)

-- Production interpreter
runHttpIO :: Http a -> IO a
runHttpIO (Pure a) = return a
runHttpIO (Free (Get url cont)) = do
  resp <- Network.httpGet url
  runHttpIO (cont resp)
runHttpIO (Free (Post url body cont)) = do
  resp <- Network.httpPost url body
  runHttpIO (cont resp)
runHttpIO (Free (Delete url next)) = do
  Network.httpDelete url
  runHttpIO next

-- Mock interpreter
runHttpMock :: Map String Response -> Http a -> a
runHttpMock _ (Pure a) = a
runHttpMock mocks (Free (Get url cont)) =
  let resp = Map.findWithDefault emptyResp url mocks
  in runHttpMock mocks (cont resp)
runHttpMock mocks (Free (Post _ _ cont)) =
  runHttpMock mocks (cont okResp)
runHttpMock mocks (Free (Delete _ next)) =
  runHttpMock mocks next
```

## Combining DSLs

Use coproducts to combine multiple DSLs:

```haskell
{-# LANGUAGE TypeOperators #-}

import Data.Functor.Sum

-- Combine two functors
type (:+:) = Sum

-- Inject left
injectL :: f a -> (f :+: g) a
injectL = InL

-- Inject right
injectR :: g a -> (f :+: g) a
injectR = InR

-- Combined DSL
type App = Free (ConsoleF :+: HttpF)

-- Smart constructors with injection
printLine' :: String -> App ()
printLine' msg = liftF (injectL (Print msg ()))

readLine' :: App String
readLine' = liftF (injectL (ReadLine id))

httpGet' :: String -> App Response
httpGet' url = liftF (injectR (Get url id))

-- Program using both DSLs
fetchAndDisplay :: Int -> App ()
fetchAndDisplay userId = do
  printLine' "Fetching user..."
  resp <- httpGet' ("/users/" ++ show userId)
  printLine' $ "User: " ++ show resp

-- Interpreter
runApp :: App a -> IO a
runApp (Pure a) = return a
runApp (Free (InL (Print msg next))) = do
  putStrLn msg
  runApp next
runApp (Free (InL (ReadLine cont))) = do
  input <- getLine
  runApp (cont input)
runApp (Free (InR (Get url cont))) = do
  resp <- Network.httpGet url
  runApp (cont resp)
-- ... other cases
```

## Freer Monads

Use freer monads for easier composition:

```haskell
{-# LANGUAGE GADTs #-}
{-# LANGUAGE FlexibleContexts #-}

import Control.Monad.Freer
import Control.Monad.Freer.Internal

-- Effects as GADTs
data Console r where
  PrintLine :: String -> Console ()
  ReadLine :: Console String

data Http r where
  HttpGet :: String -> Http Response
  HttpPost :: String -> Body -> Http Response

-- Smart constructors
printLine :: Member Console effs => Eff effs ()
printLine msg = send (PrintLine msg)

readLine :: Member Console effs => Eff effs String
readLine = send ReadLine

httpGet :: Member Http effs => String -> Eff effs Response
httpGet url = send (HttpGet url)

-- Program using multiple effects
program :: (Member Console effs, Member Http effs) => Eff effs ()
program = do
  printLine "Enter user ID:"
  userId <- readLine
  resp <- httpGet ("/users/" ++ userId)
  printLine $ "User: " ++ show resp

-- Interpreters
runConsole :: Eff (Console ': effs) a -> Eff effs a
runConsole = interpret $ \case
  PrintLine msg -> liftIO $ putStrLn msg
  ReadLine -> liftIO getLine

runHttp :: Eff (Http ': effs) a -> Eff effs a
runHttp = interpret $ \case
  HttpGet url -> liftIO $ Network.httpGet url
  HttpPost url body -> liftIO $ Network.httpPost url body

-- Run program
main :: IO ()
main = runM $ runHttp $ runConsole program
```

## Optimizing Free Programs

Inspect and optimize before execution:

```haskell
-- Analyze program
countOperations :: Free HttpF a -> Int
countOperations (Pure _) = 0
countOperations (Free (Get _ cont)) = 1 + countOperations cont
countOperations (Free (Post _ _ cont)) = 1 + countOperations cont
countOperations (Free (Delete _ next)) = 1 + countOperations next

-- Batch requests
batchGets :: Free HttpF a -> ([String], Free HttpF a)
batchGets (Pure a) = ([], Pure a)
batchGets (Free (Get url cont)) =
  let (urls, rest) = batchGets cont
  in (url : urls, rest)
batchGets prog = ([], prog)

-- Optimize: batch consecutive GETs
optimizeHttp :: Free HttpF a -> Free HttpF a
optimizeHttp prog =
  let (urls, rest) = batchGets prog
  in if null urls
    then prog
    else Free (BatchGet urls (\resps -> continue resps rest))
```

## Database DSL

```haskell
data DatabaseF next
  = Query String ([Row] -> next)
  | Execute String (Int -> next)
  | Transaction (Free DatabaseF ()) next
  deriving Functor

type Database = Free DatabaseF

-- Smart constructors
query :: String -> Database [Row]
query sql = liftF (Query sql id)

execute :: String -> Database Int
execute sql = liftF (Execute sql id)

transaction :: Database () -> Database ()
transaction ops = liftF (Transaction ops ())

-- Business logic
transferFunds :: Int -> Int -> Int -> Database ()
transferFunds fromId toId amount = transaction $ do
  execute $ "UPDATE accounts SET balance = balance - "
    ++ show amount ++ " WHERE id = " ++ show fromId
  execute $ "UPDATE accounts SET balance = balance + "
    ++ show amount ++ " WHERE id = " ++ show toId

-- Real database interpreter
runDB :: Connection -> Database a -> IO a
runDB _ (Pure a) = return a
runDB conn (Free (Query sql cont)) = do
  rows <- DB.query conn sql
  runDB conn (cont rows)
runDB conn (Free (Execute sql cont)) = do
  affected <- DB.execute conn sql
  runDB conn (cont affected)
runDB conn (Free (Transaction ops next)) = do
  DB.begin conn
  result <- catch
    (runDB conn ops >> DB.commit conn >> return True)
    (\e -> DB.rollback conn >> return False)
  runDB conn next

-- Mock interpreter (for testing)
runDBMock :: Database a -> (a, [String])
runDBMock prog = run [] prog
  where
    run log (Pure a) = (a, reverse log)
    run log (Free (Query sql cont)) =
      run (("QUERY: " ++ sql) : log) (cont [])
    run log (Free (Execute sql cont)) =
      run (("EXEC: " ++ sql) : log) (cont 1)
    run log (Free (Transaction ops next)) =
      let (_, txLog) = run [] ops
      in run (("BEGIN" : txLog ++ ["COMMIT"]) ++ log) next
```

## Church-Encoded Free

More efficient representation:

```haskell
-- Church encoding
newtype FreeC f a = FreeC
  { runFreeC :: forall r. (a -> r) -> (f r -> r) -> r }

instance Functor (FreeC f) where
  fmap f (FreeC run) = FreeC $ \pure' bind' ->
    run (pure' . f) bind'

instance Applicative (FreeC f) where
  pure a = FreeC $ \pure' _ -> pure' a
  FreeC runF <*> FreeC runA = FreeC $ \pure' bind' ->
    runF (\f -> runA (\a -> pure' (f a)) bind') bind'

instance Monad (FreeC f) where
  FreeC run >>= f = FreeC $ \pure' bind' ->
    run (\a -> runFreeC (f a) pure' bind') bind'

-- Lift
liftFC :: Functor f => f a -> FreeC f a
liftFC fa = FreeC $ \pure' bind' -> bind' (fmap pure' fa)

-- Interpreter
foldFreeC :: Monad m => (forall x. f x -> m x) -> FreeC f a -> m a
foldFreeC interp (FreeC run) =
  run return (>>= interp)
```

## Real-World: Test Framework

```haskell
data TestF next
  = Describe String (Free TestF ()) next
  | It String (IO ()) next
  | BeforeEach (IO ()) next
  deriving Functor

type Test = Free TestF

-- DSL
describe :: String -> Test () -> Test ()
describe name tests = liftF (Describe name tests ())

it :: String -> IO () -> Test ()
it name test = liftF (It name test ())

beforeEach :: IO () -> Test ()
beforeEach action = liftF (BeforeEach action ())

-- Example test suite
userTests :: Test ()
userTests = describe "User module" $ do
  beforeEach $ putStrLn "Setting up..."

  it "creates a user" $ do
    user <- createUser "Alice"
    userName user `shouldBe` "Alice"

  it "finds a user" $ do
    user <- findUser 1
    userId user `shouldBe` 1

-- Runner
runTests :: Test () -> IO ()
runTests (Pure ()) = return ()
runTests (Free (Describe name tests next)) = do
  putStrLn $ "\n" ++ name
  runTests tests
  runTests next
runTests (Free (It name test next)) = do
  putStr $ "  ✓ " ++ name
  test
  putStrLn ""
  runTests next
runTests (Free (BeforeEach action next)) = do
  action
  runTests next
```

## Key Takeaways

1. **Separate description from execution** - programs are data
2. **Multiple interpreters** - prod, test, mock, optimize
3. **Inspection** - analyze programs before running
4. **Type safe** - operations are well-typed
5. **Composition** - build complex programs from simple operations

Free monads enable truly declarative programming. Build programs as pure data, interpret them however you need. This is the foundation of libraries like purescript-halogen and polysemy.
