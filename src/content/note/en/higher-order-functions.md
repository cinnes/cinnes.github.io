---
title: Higher-Order Functions - Functions as First-Class Citizens
timestamp: 2025-11-11 00:00:00+00:00
description: Master higher-order functions to write more expressive and reusable code by treating functions as values.
tags: [fp, hof, haskell]
toc: true
---

# Higher-Order Functions - Functions as First-Class Citizens

In functional programming, functions are first-class citizens. This means they can be passed as arguments, returned from other functions, and assigned to variables. Higher-order functions leverage this to create powerful abstractions.

## What is a Higher-Order Function?

A higher-order function is a function that:
1. Takes one or more functions as arguments, or
2. Returns a function as its result

```haskell
-- Takes a function as argument
applyTwice :: (a -> a) -> a -> a
applyTwice f x = f (f x)

-- Returns a function
makeAdder :: Int -> (Int -> Int)
makeAdder n = \x -> x + n

-- Usage
applyTwice (+3) 10    -- 16
add5 = makeAdder 5
add5 7                -- 12
```

## Standard Higher-Order Functions

### Map

Transform each element in a list:

```haskell
-- map :: (a -> b) -> [a] -> [b]

map (*2) [1, 2, 3, 4, 5]
-- [2, 4, 6, 8, 10]

map toUpper "hello"
-- "HELLO"

map (\x -> x * x) [1, 2, 3]
-- [1, 4, 9]
```

### Filter

Keep only elements that satisfy a predicate:

```haskell
-- filter :: (a -> Bool) -> [a] -> [a]

filter even [1, 2, 3, 4, 5, 6]
-- [2, 4, 6]

filter (> 5) [3, 8, 1, 9, 2]
-- [8, 9]

filter isPrime [1..20]
-- [2, 3, 5, 7, 11, 13, 17, 19]
```

### Fold (Reduce)

Combine elements into a single value:

```haskell
-- foldl :: (b -> a -> b) -> b -> [a] -> b
-- foldr :: (a -> b -> b) -> b -> [a] -> b

-- Sum
foldl (+) 0 [1, 2, 3, 4, 5]
-- 15

-- Product
foldl (*) 1 [1, 2, 3, 4]
-- 24

-- Reverse
foldl (flip (:)) [] [1, 2, 3]
-- [3, 2, 1]

-- Maximum
foldl1 max [3, 1, 4, 1, 5, 9]
-- 9
```

## Function Composition

Combine functions to create new ones:

```haskell
-- (.) :: (b -> c) -> (a -> b) -> a -> c

double :: Int -> Int
double x = x * 2

increment :: Int -> Int
increment x = x + 1

-- Compose
doubleAndIncrement :: Int -> Int
doubleAndIncrement = increment . double

doubleAndIncrement 5
-- 11  (5 * 2 = 10, then 10 + 1 = 11)

-- Multiple composition
process :: String -> String
process = map toUpper . filter isAlpha . reverse

process "hello, world!"
-- "DLROWOLLEH"
```

## Creating Higher-Order Functions

### Predicate Combinators

```haskell
-- Combine predicates
both :: (a -> Bool) -> (a -> Bool) -> a -> Bool
both p q x = p x && q x

either' :: (a -> Bool) -> (a -> Bool) -> a -> Bool
either' p q x = p x || q x

neg :: (a -> Bool) -> a -> Bool
neg p x = not (p x)

-- Usage
isEvenAndPositive :: Int -> Bool
isEvenAndPositive = both even (> 0)

filter isEvenAndPositive [-2, -1, 0, 1, 2, 3, 4]
-- [2, 4]
```

### Function Transformers

```haskell
-- Apply function n times
times :: Int -> (a -> a) -> a -> a
times 0 f = id
times n f = f . times (n - 1) f

times 3 (*2) 5
-- 40  (5 * 2 * 2 * 2)

-- Flip arguments
flip' :: (a -> b -> c) -> b -> a -> c
flip' f x y = f y x

-- Const - ignore second argument
const' :: a -> b -> a
const' x _ = x

map (const' 0) [1, 2, 3]
-- [0, 0, 0]
```

## Partial Application

Apply some arguments to get a new function:

```haskell
-- All functions are curried in Haskell
add :: Int -> Int -> Int
add x y = x + y

-- Partial application
add5 :: Int -> Int
add5 = add 5

add5 10
-- 15

-- With operators
multiplyBy10 :: Int -> Int
multiplyBy10 = (*10)

divideBy2 :: Double -> Double
divideBy2 = (/2)

-- In filter/map
filter (> 5) [1..10]
map (*2) [1..5]
```

## Practical Examples

### Data Processing Pipeline

```haskell
data Person = Person
  { name :: String
  , age :: Int
  , salary :: Double
  }

people :: [Person]
people =
  [ Person "Alice" 30 50000
  , Person "Bob" 25 45000
  , Person "Charlie" 35 60000
  , Person "Diana" 28 48000
  ]

-- Get names of people over 30 earning more than 50k
highEarners :: [Person] -> [String]
highEarners =
  map name
  . filter (\p -> salary p > 50000)
  . filter (\p -> age p > 30)

highEarners people
-- ["Charlie"]
```

### Custom Higher-Order Functions

```haskell
-- Retry a function n times until it succeeds
retry :: Int -> (a -> Maybe b) -> a -> Maybe b
retry 0 _ _ = Nothing
retry n f x = case f x of
  Just result -> Just result
  Nothing -> retry (n - 1) f x

-- Compose a list of functions
composeAll :: [a -> a] -> a -> a
composeAll = foldr (.) id

transforms :: [Int -> Int]
transforms = [(*2), (+10), subtract 3]

composeAll transforms 5
-- 17  ((5 - 3) + 10) * 2
```

### Memoization

```haskell
import Data.Function.Memoize

-- Slow fibonacci
fib :: Int -> Integer
fib 0 = 0
fib 1 = 1
fib n = fib (n - 1) + fib (n - 2)

-- Fast memoized fibonacci
fibMemo :: Int -> Integer
fibMemo = memoize fib'
  where
    fib' 0 = 0
    fib' 1 = 1
    fib' n = fibMemo (n - 1) + fibMemo (n - 2)

fibMemo 100
-- 354224848179261915075 (instant)
```

## Point-Free Style

Define functions without explicitly mentioning arguments:

```haskell
-- Pointful
sumSquares :: [Int] -> Int
sumSquares xs = sum (map (\x -> x * x) xs)

-- Point-free
sumSquares' :: [Int] -> Int
sumSquares' = sum . map (^2)

-- More examples
isEven :: Int -> Bool
isEven = (== 0) . (`mod` 2)

length' :: [a] -> Int
length' = foldr (\_ acc -> acc + 1) 0

null' :: [a] -> Bool
null' = foldr (\_ _ -> False) True
```

## Applicative Style

Apply functions with multiple arguments:

```haskell
import Control.Applicative

-- Apply a binary function
liftA2' :: (a -> b -> c) -> [a] -> [b] -> [c]
liftA2' f xs ys = f <$> xs <*> ys

-- Cartesian product
pairs :: [a] -> [b] -> [(a, b)]
pairs = liftA2 (,)

pairs [1, 2] ['a', 'b']
-- [(1,'a'), (1,'b'), (2,'a'), (2,'b')]

-- All combinations
combinations :: [Int] -> [Int] -> [Int]
combinations = liftA2 (+)

combinations [1, 2] [10, 20]
-- [11, 21, 12, 22]
```

## Monadic Higher-Order Functions

### mapM

Map with effects:

```haskell
-- mapM :: Monad m => (a -> m b) -> [a] -> m [b]

-- Print each element and collect results
printAndDouble :: Int -> IO Int
printAndDouble x = do
  print x
  return (x * 2)

mapM printAndDouble [1, 2, 3]
-- Prints: 1, 2, 3
-- Returns: IO [2, 4, 6]
```

### filterM

Filter with monadic predicate:

```haskell
-- filterM :: Monad m => (a -> m Bool) -> [a] -> m [a]

-- Interactive filter
askKeep :: Int -> IO Bool
askKeep x = do
  putStrLn $ "Keep " ++ show x ++ "? (y/n)"
  answer <- getLine
  return (answer == "y")

filterM askKeep [1, 2, 3]
-- Interactive prompts, returns filtered list
```

## Key Takeaways

1. **Functions as values** - pass and return functions freely
2. **Map/filter/fold** - fundamental higher-order operations
3. **Composition** - combine simple functions into complex ones
4. **Partial application** - create specialized functions
5. **Point-free** - express intent without naming arguments

Higher-order functions are the foundation of functional programming. They enable code reuse, composition, and declarative style that's more maintainable than imperative alternatives.
