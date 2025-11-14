---
title: Currying - Transforming Functions for Better Composition
timestamp: 2025-11-09 00:00:00+00:00
description: Learn how currying transforms multi-argument functions into sequences of single-argument functions for improved flexibility and reusability.
tags: [fp, currying, partial, haskell]
toc: true
---

# Currying - Transforming Functions for Better Composition

Currying is the technique of converting a function that takes multiple arguments into a sequence of functions that each take a single argument. Named after mathematician Haskell Curry, it's a powerful tool for creating flexible, reusable code.

In Haskell, **all functions are curried by default**. What appears to be multi-argument functions are actually chains of single-argument functions.

## Understanding Currying

### All Functions Are Curried

```haskell
-- This looks like a two-argument function
add :: Int -> Int -> Int
add x y = x + y

-- But it's actually:
add :: Int -> (Int -> Int)
add x = \y -> x + y

-- These are equivalent:
add 3 5      -- 8
(add 3) 5    -- 8
(\y -> 3 + y) 5  -- 8
```

The type `Int -> Int -> Int` is right-associative, meaning `Int -> (Int -> Int)`:
- Take an `Int`
- Return a function that takes another `Int`
- That function returns an `Int`

### Partial Application

Apply some arguments to get a specialized function:

```haskell
-- Full application
add 3 5  -- 8

-- Partial application
add3 :: Int -> Int
add3 = add 3

add3 5   -- 8
add3 10  -- 13

-- More examples
multiply :: Int -> Int -> Int
multiply x y = x * y

double :: Int -> Int
double = multiply 2

triple :: Int -> Int
triple = multiply 3

double 5  -- 10
triple 5  -- 15
```

## Practical Applications

### Configuration Functions

```haskell
-- Generic greeting builder
greet :: String -> String -> String -> String
greet greeting name punctuation =
  greeting ++ ", " ++ name ++ punctuation

-- Specialized greetings
hello :: String -> String
hello = greet "Hello"

goodbye :: String -> String
goodbye = greet "Goodbye"

-- Even more specialized
helloExcited :: String -> String
helloExcited = greet "Hello" `ap` id `ap` const "!"
-- Or simply:
helloExcited name = greet "Hello" name "!"

hello "Alice"    -- "Hello, Alice"
goodbye "Bob"    -- "Goodbye, Bob"
```

### List Operations

```haskell
-- Filter with partial application
filter :: (a -> Bool) -> [a] -> [a]

evens :: [Int] -> [Int]
evens = filter even

positives :: [Int] -> [Int]
positives = filter (> 0)

longWords :: [String] -> [String]
longWords = filter (\w -> length w > 5)

evens [1, 2, 3, 4, 5, 6]        -- [2, 4, 6]
positives [-2, -1, 0, 1, 2]     -- [1, 2]
longWords ["hi", "hello", "hey"]  -- ["hello"]
```

### Map with Partial Application

```haskell
-- map :: (a -> b) -> [a] -> [b]

-- Specialized mappers
doubleAll :: [Int] -> [Int]
doubleAll = map (*2)

uppercaseAll :: [String] -> [String]
uppercaseAll = map (map toUpper)

squareAll :: [Int] -> [Int]
squareAll = map (^2)

doubleAll [1, 2, 3]           -- [2, 4, 6]
uppercaseAll ["hi", "bye"]    -- ["HI", "BYE"]
squareAll [1, 2, 3, 4]        -- [1, 4, 9, 16]
```

## Operators and Sections

Operators can be partially applied using sections:

```haskell
-- Left section
(+3) :: Int -> Int
(+3) 5    -- 8

(*2) :: Int -> Int
(*2) 10   -- 20

-- Right section
(3+) :: Int -> Int
(3+) 5    -- 8

(2*) :: Int -> Int
(2*) 10   -- 20

-- Comparison sections
(> 5) :: Int -> Bool
(> 5) 10   -- True

(<= 3) :: Int -> Bool
(<= 3) 2   -- True

-- Division (order matters!)
(/2) :: Double -> Double
(/2) 10.0  -- 5.0 (divide by 2)

(2/) :: Double -> Double
(2/) 10.0  -- 0.2 (2 divided by...)
```

## Function Composition with Currying

Currying makes composition elegant:

```haskell
-- (.) :: (b -> c) -> (a -> b) -> a -> c

-- Process numbers
processNumbers :: [Int] -> [Int]
processNumbers = filter (> 0) . map (*2) . filter even

processNumbers [1, 2, 3, 4, 5, 6]
-- [4, 8, 12]  (even: [2,4,6] -> double: [4,8,12] -> positive: [4,8,12])

-- Process strings
processText :: String -> String
processText = filter isAlpha . map toUpper

processText "Hello, World!"
-- "HELLOWORLD"
```

## Flipping Arguments

Sometimes you need to swap argument order:

```haskell
-- flip :: (a -> b -> c) -> b -> a -> c
flip f x y = f y x

-- Subtract in reverse
subtractFrom :: Int -> Int -> Int
subtractFrom = flip (-)

subtractFrom 10 3  -- 7  (10 - 3, not 3 - 10)

-- Useful for partial application
subtract5From :: Int -> Int
subtract5From = subtractFrom 5

subtract5From 10  -- 5  (10 - 5)

-- With division
divideInto :: Double -> Double -> Double
divideInto = flip (/)

divideInto 100 10  -- 10.0  (100 / 10)
```

## Building Domain-Specific Functions

```haskell
-- HTTP request builder
data Request = Request
  { method :: String
  , url :: String
  , headers :: [(String, String)]
  , body :: String
  }

-- Curried constructor
makeRequest :: String -> String -> [(String, String)] -> String -> Request
makeRequest = Request

-- Specialized builders
getRequest :: String -> [(String, String)] -> String -> Request
getRequest = makeRequest "GET"

postRequest :: String -> [(String, String)] -> String -> Request
postRequest = makeRequest "POST"

-- Even more specialized
getUser :: [(String, String)] -> String -> Request
getUser = getRequest "/api/user"

-- Usage
request :: Request
request = getUser [("Auth", "token")] ""
```

## Advanced: Currying for Configuration

```haskell
-- Database query builder
query :: String -> String -> [(String, String)] -> String -> String
query table fields conditions orderBy =
  "SELECT " ++ fields
  ++ " FROM " ++ table
  ++ " WHERE " ++ show conditions
  ++ " ORDER BY " ++ orderBy

-- Specialized queries
queryUsers :: String -> [(String, String)] -> String -> String
queryUsers = query "users"

queryAllUsers :: [(String, String)] -> String -> String
queryAllUsers = queryUsers "*"

-- Even more specialized
activeUsers :: String -> String
activeUsers = queryAllUsers [("active", "true")]

-- Usage
activeUsers "created_at"
-- "SELECT * FROM users WHERE [(\"active\",\"true\")] ORDER BY created_at"
```

## Currying with Higher-Order Functions

```haskell
-- fold with partial application
sum' :: [Int] -> Int
sum' = foldl (+) 0

product' :: [Int] -> Int
product' = foldl (*) 1

concat' :: [[a]] -> [a]
concat' = foldl (++) []

sum' [1, 2, 3, 4]           -- 10
product' [1, 2, 3, 4]       -- 24
concat' [[1,2], [3,4]]      -- [1,2,3,4]

-- scanl with partial application
runningSum :: [Int] -> [Int]
runningSum = scanl (+) 0

runningProduct :: [Int] -> [Int]
runningProduct = scanl (*) 1

runningSum [1, 2, 3, 4]      -- [0,1,3,6,10]
runningProduct [1, 2, 3, 4]  -- [1,1,2,6,24]
```

## Uncurrying

Sometimes you need to convert back to tuple form:

```haskell
-- uncurry :: (a -> b -> c) -> (a, b) -> c
uncurry f (x, y) = f x y

-- Useful for working with pairs
add :: Int -> Int -> Int
add x y = x + y

addPair :: (Int, Int) -> Int
addPair = uncurry add

addPair (3, 5)  -- 8

-- Map over pairs
pairs :: [(Int, Int)]
pairs = [(1, 2), (3, 4), (5, 6)]

map (uncurry add) pairs
-- [3, 7, 11]

map (uncurry (*)) pairs
-- [2, 12, 30]
```

## Multi-Argument Functions

```haskell
-- Three arguments
clamp :: Int -> Int -> Int -> Int
clamp minVal maxVal x = max minVal (min maxVal x)

-- Partially apply bounds
clamp0to100 :: Int -> Int
clamp0to100 = clamp 0 100

clamp0to100 150  -- 100
clamp0to100 50   -- 50
clamp0to100 (-10)  -- 0

-- Four arguments
replace :: Eq a => a -> a -> [a] -> [a]
replace old new = map (\x -> if x == old then new else x)

-- Partial applications
replaceSpaces :: Char -> String -> String
replaceSpaces = replace ' '

removeSpaces :: String -> String
removeSpaces = replaceSpaces '_'

removeSpaces "hello world"  -- "hello_world"
```

## Practical Pipeline Example

```haskell
data User = User
  { userId :: Int
  , userName :: String
  , userAge :: Int
  , userActive :: Bool
  } deriving Show

users :: [User]
users =
  [ User 1 "Alice" 30 True
  , User 2 "Bob" 25 False
  , User 3 "Charlie" 35 True
  , User 4 "Diana" 28 True
  ]

-- Curried predicates
isActive :: User -> Bool
isActive = userActive

ageAbove :: Int -> User -> Bool
ageAbove n user = userAge user > n

nameIs :: String -> User -> Bool
nameIs name user = userName user == name

-- Combine with filter
activeUsers :: [User] -> [User]
activeUsers = filter isActive

oldActiveUsers :: [User] -> [User]
oldActiveUsers = filter isActive . filter (ageAbove 30)

-- Extract fields
names :: [User] -> [String]
names = map userName

ages :: [User] -> [Int]
ages = map userAge

-- Full pipeline
activeOldNames :: [User] -> [String]
activeOldNames = names . filter (ageAbove 30) . filter isActive

activeOldNames users
-- ["Charlie"]
```

## Key Takeaways

1. **All functions are curried** - in Haskell, this is automatic
2. **Partial application** - create specialized functions by applying some arguments
3. **Sections** - partially apply operators with special syntax
4. **Composition** - currying makes function composition natural
5. **Flip** - reorder arguments when needed for partial application

Currying transforms how you think about functions. Instead of "functions with multiple arguments," think "functions returning functions." This unlocks powerful composition and reusability.
