---
title: Functors and Monads - Containers for Safer Code
timestamp: 2025-11-07 00:00:00+00:00
description: Understand functors and monads to write safer code that handles nulls, errors, and async operations elegantly.
tags: [fp, functors, monads, haskell]
toc: true
---


Functors and monads are fundamental type classes in Haskell that provide a consistent interface for working with values in computational contexts. They enable elegant handling of null values, errors, and effectful computations.

## Functors - Mappable Containers

A Functor is anything that implements `fmap`, allowing you to transform wrapped values:

```haskell
class Functor f where
  fmap :: (a -> b) -> f a -> f b

-- Infix operator
(<$>) :: Functor f => (a -> b) -> f a -> f b
(<$>) = fmap
```

### List Functor

```haskell
-- Lists are functors
instance Functor [] where
  fmap = map

fmap (*2) [1, 2, 3, 4]
-- [2, 4, 6, 8]

(+10) <$> [1, 2, 3]
-- [11, 12, 13]
```

### Maybe Functor

```haskell
-- Maybe handles null values safely
data Maybe a = Nothing | Just a

instance Functor Maybe where
  fmap _ Nothing = Nothing
  fmap f (Just x) = Just (f x)

-- Usage
fmap (*2) (Just 5)
-- Just 10

fmap (*2) Nothing
-- Nothing

(+1) <$> Just 10
-- Just 11
```

### Safe Property Access

```haskell
data Person = Person
  { name :: String
  , age :: Int
  , address :: Maybe Address
  }

data Address = Address
  { street :: String
  , city :: String
  }

-- Without Maybe: unsafe!
-- getCity person = city (address person)  -- Crashes if no address

-- With Maybe: safe!
getCity :: Person -> Maybe String
getCity person = fmap city (address person)

-- Or using <$>
getCity' :: Person -> Maybe String
getCity' person = city <$> address person

alice = Person "Alice" 30 (Just (Address "Main St" "NYC"))
bob = Person "Bob" 25 Nothing

getCity alice  -- Just "NYC"
getCity bob    -- Nothing
```

## Applicative Functors

Applicatives let you apply wrapped functions to wrapped values:

```haskell
class Functor f => Applicative f where
  pure :: a -> f a
  (<*>) :: f (a -> b) -> f a -> f b

-- Also provides:
liftA2 :: Applicative f => (a -> b -> c) -> f a -> f b -> f c
```

### Maybe Applicative

```haskell
instance Applicative Maybe where
  pure = Just
  Nothing <*> _ = Nothing
  _ <*> Nothing = Nothing
  Just f <*> Just x = Just (f x)

-- Combine Maybe values
liftA2 (+) (Just 3) (Just 5)
-- Just 8

liftA2 (+) (Just 3) Nothing
-- Nothing

-- Applicative style
(+) <$> Just 3 <*> Just 5
-- Just 8
```

### Validation

```haskell
data Person = Person String Int
  deriving Show

-- Validate and construct
validateName :: String -> Maybe String
validateName "" = Nothing
validateName name = Just name

validateAge :: Int -> Maybe Int
validateAge age
  | age >= 0 && age <= 150 = Just age
  | otherwise = Nothing

-- Combine validations
makePerson :: String -> Int -> Maybe Person
makePerson name age =
  Person <$> validateName name <*> validateAge age

-- Or with liftA2
makePerson' :: String -> Int -> Maybe Person
makePerson' = liftA2 Person `on` validateName `on` validateAge
  where on = (.)

makePerson "Alice" 30
-- Just (Person "Alice" 30)

makePerson "" 30
-- Nothing

makePerson "Bob" 200
-- Nothing
```

## Monads - Chainable Computations

Monads add `>>=` (bind) for chaining dependent computations:

```haskell
class Applicative m => Monad m where
  return :: a -> m a  -- Same as pure
  (>>=) :: m a -> (a -> m b) -> m b

-- Also:
(>>) :: m a -> m b -> m b  -- Sequence, ignore first result
```

### Maybe Monad

```haskell
instance Monad Maybe where
  return = Just
  Nothing >>= _ = Nothing
  Just x >>= f = f x

-- Chain lookups
type UserId = Int
type User = String

findUser :: UserId -> Maybe User
findUser 1 = Just "Alice"
findUser 2 = Just "Bob"
findUser _ = Nothing

findUserAddress :: User -> Maybe Address
findUserAddress "Alice" = Just (Address "Main St" "NYC")
findUserAddress "Bob" = Nothing
findUserAddress _ = Nothing

-- Chained lookup
getUserCity :: UserId -> Maybe String
getUserCity userId =
  findUser userId >>= \user ->
  findUserAddress user >>= \addr ->
  return (city addr)

-- Or with do-notation
getUserCity' :: UserId -> Maybe String
getUserCity' userId = do
  user <- findUser userId
  addr <- findUserAddress user
  return (city addr)

getUserCity 1  -- Just "NYC"
getUserCity 2  -- Nothing (Bob has no address)
getUserCity 3  -- Nothing (user not found)
```

## Either for Error Handling

Either carries error information:

```haskell
data Either e a = Left e | Right a

instance Functor (Either e) where
  fmap _ (Left e) = Left e
  fmap f (Right x) = Right (f x)

instance Applicative (Either e) where
  pure = Right
  Left e <*> _ = Left e
  Right f <*> Right x = Right (f x)
  _ <*> Left e = Left e

instance Monad (Either e) where
  Left e >>= _ = Left e
  Right x >>= f = f x
```

### Error Handling Example

```haskell
type Error = String

validateEmail :: String -> Either Error String
validateEmail email
  | '@' `elem` email = Right email
  | otherwise = Left "Invalid email: must contain @"

validateAge' :: Int -> Either Error Int
validateAge' age
  | age >= 18 = Right age
  | otherwise = Left "Invalid age: must be 18+"

-- Chain validations
processUser :: String -> Int -> Either Error (String, Int)
processUser email age = do
  validEmail <- validateEmail email
  validAge <- validateAge' age
  return (validEmail, validAge)

processUser "alice@example.com" 30
-- Right ("alice@example.com", 30)

processUser "invalid" 30
-- Left "Invalid email: must contain @"

processUser "alice@example.com" 15
-- Left "Invalid age: must be 18+"
```

## List Monad - Non-Determinism

Lists model multiple possible values:

```haskell
instance Monad [] where
  return x = [x]
  xs >>= f = concat (map f xs)  -- Or: concatMap f xs

-- Generate all pairs
pairs :: [Int] -> [Char] -> [(Int, Char)]
pairs nums chars = do
  n <- nums
  c <- chars
  return (n, c)

pairs [1, 2] ['a', 'b']
-- [(1,'a'), (1,'b'), (2,'a'), (2,'b')]

-- Pythagorean triples
pythTriples :: Int -> [(Int, Int, Int)]
pythTriples n = do
  a <- [1..n]
  b <- [a..n]
  c <- [b..n]
  guard (a*a + b*b == c*c)
  return (a, b, c)

pythTriples 15
-- [(3,4,5), (5,12,13), (6,8,10), (9,12,15)]
```

## IO Monad

IO sequences effectful operations:

```haskell
-- IO is an abstract type
-- Can only escape via running main or unsafePerformIO

greet :: IO ()
greet = do
  putStrLn "What's your name?"
  name <- getLine
  putStrLn $ "Hello, " ++ name ++ "!"

-- Reading a file
readAndProcess :: FilePath -> IO String
readAndProcess path = do
  contents <- readFile path
  let processed = map toUpper contents
  return processed

-- Chaining I/O operations
copyFile' :: FilePath -> FilePath -> IO ()
copyFile' src dest = do
  contents <- readFile src
  writeFile dest contents
  putStrLn $ "Copied " ++ src ++ " to " ++ dest
```

## Monad Utilities

### mapM and sequence

```haskell
-- mapM :: Monad m => (a -> m b) -> [a] -> m [b]
-- sequence :: Monad m => [m a] -> m [a]

-- Print and collect
printItem :: Int -> IO Int
printItem x = do
  print x
  return (x * 2)

mapM printItem [1, 2, 3]
-- Prints: 1, 2, 3
-- Returns: IO [2, 4, 6]

-- Sequence multiple I/O actions
actions :: [IO ()]
actions = [putStrLn "First", putStrLn "Second", putStrLn "Third"]

sequence_ actions
-- Prints all three lines
```

### filterM

```haskell
-- filterM :: Monad m => (a -> m Bool) -> [a] -> m [a]

-- Get all subsets using list monad
powerset :: [a] -> [[a]]
powerset = filterM (\_ -> [True, False])

powerset [1, 2, 3]
-- [[1,2,3], [1,2], [1,3], [1], [2,3], [2], [3], []]
```

## do-Notation Sugar

do-notation is syntactic sugar for `>>=`:

```haskell
-- This do-block:
do
  x <- action1
  y <- action2 x
  return (x + y)

-- Desugars to:
action1 >>= \x ->
  action2 x >>= \y ->
    return (x + y)

-- Pattern matching:
do
  Just x <- maybeAction
  return x

-- Desugars to:
maybeAction >>= \(Just x) -> return x
```

## Monad Laws

All monad instances must satisfy:

```haskell
-- Left identity
return a >>= f  ≡  f a

-- Right identity
m >>= return  ≡  m

-- Associativity
(m >>= f) >>= g  ≡  m >>= (\x -> f x >>= g)
```

These laws ensure monads behave predictably.

## Real-World Example

```haskell
import Data.Maybe (fromMaybe)
import Control.Monad (guard)

data User = User
  { userId :: Int
  , userName :: String
  , userEmail :: String
  } deriving Show

data Post = Post
  { postId :: Int
  , postAuthorId :: Int
  , postTitle :: String
  } deriving Show

-- Database simulation
users :: [User]
users =
  [ User 1 "Alice" "alice@example.com"
  , User 2 "Bob" "bob@example.com"
  ]

posts :: [Post]
posts =
  [ Post 1 1 "First Post"
  , Post 2 1 "Second Post"
  , Post 3 2 "Bob's Post"
  ]

-- Lookup functions
findUserById :: Int -> Maybe User
findUserById uid = find (\u -> userId u == uid) users

findPostsByAuthor :: Int -> [Post]
findPostsByAuthor aid = filter (\p -> postAuthorId p == aid) posts

-- Get user's posts
getUserPosts :: Int -> Maybe [Post]
getUserPosts uid = do
  user <- findUserById uid
  return (findPostsByAuthor (userId user))

-- With error handling
type Result a = Either String a

findUserById' :: Int -> Result User
findUserById' uid =
  case find (\u -> userId u == uid) users of
    Nothing -> Left $ "User not found: " ++ show uid
    Just user -> Right user

getUserPosts' :: Int -> Result [Post]
getUserPosts' uid = do
  user <- findUserById' uid
  Right (findPostsByAuthor (userId user))

-- Usage
getUserPosts 1
-- Just [Post 1 1 "First Post", Post 2 1 "Second Post"]

getUserPosts' 99
-- Left "User not found: 99"
```

## Key Takeaways

1. **Functor** - map over wrapped values with `fmap` / `<$>`
2. **Applicative** - apply wrapped functions with `<*>`
3. **Monad** - chain dependent computations with `>>=`
4. **Maybe** - handle null values safely
5. **Either** - carry error information
6. **IO** - sequence effects in a controlled way

Functors and monads provide a unified interface for working with computational contexts. They're the foundation of principled effectful programming in Haskell.
