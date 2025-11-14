---
title: Optics - Composable Getters and Setters
timestamp: 2025-11-18 00:00:00+00:00
description: Master lenses, prisms, and other optics to elegantly read and update deeply nested immutable data structures with composable, reusable operations.
tags: [fp, optics, lenses, haskell]
toc: true
---

# Optics - Composable Getters and Setters

Optics provide a composable way to focus on parts of immutable data structures. Haskell's `lens` library offers a powerful toolkit for reading, updating, and traversing nested data elegantly.

## The Problem

Updating nested immutable data is verbose:

```haskell
data Address = Address
  { _street :: String
  , _city :: String
  , _zipCode :: String
  } deriving Show

data Person = Person
  { _name :: String
  , _age :: Int
  , _address :: Address
  } deriving Show

-- Update city deeply nested
updateCity :: String -> Person -> Person
updateCity newCity person =
  person { _address = (_address person) { _city = newCity } }
```

This doesn't scale. Optics solve this.

## Lenses - Focus on a Field

A lens focuses on a field within a structure:

```haskell
{-# LANGUAGE TemplateHaskell #-}

import Control.Lens

-- Generate lenses automatically
data Person = Person
  { _name :: String
  , _age :: Int
  , _address :: Address
  } deriving Show

data Address = Address
  { _street :: String
  , _city :: String
  } deriving Show

makeLenses ''Person
makeLenses ''Address

-- Now we have:
-- name :: Lens' Person String
-- age :: Lens' Person Int
-- address :: Lens' Person Address
-- street :: Lens' Address String
-- city :: Lens' Address String
```

## Basic Lens Operations

```haskell
alice :: Person
alice = Person "Alice" 30 (Address "Main St" "NYC")

-- View: get a value
alice ^. name
-- "Alice"

alice ^. age
-- 30

-- Set: update a value
alice & name .~ "Alicia"
-- Person "Alicia" 30 (Address "Main St" "NYC")

alice & age .~ 31
-- Person "Alice" 31 (Address "Main St" "NYC")

-- Over: modify with a function
alice & age %~ (+1)
-- Person "Alice" 31 (Address "Main St" "NYC")

alice & name %~ map toUpper
-- Person "ALICE" 30 (Address "Main St" "NYC")
```

## Lens Composition

The power of lenses: composition!

```haskell
-- Compose lenses with (.)
personCity :: Lens' Person String
personCity = address . city

-- Access nested field
alice ^. address . city
-- "NYC"

-- Or use the composed lens
alice ^. personCity
-- "NYC"

-- Update nested field
alice & address . city .~ "Boston"
-- Person "Alice" 30 (Address "Main St" "Boston")

alice & personCity .~ "Boston"
-- Same result

-- Modify nested field
alice & address . city %~ map toUpper
-- Person "Alice" 30 (Address "Main St" "NYC")
```

## Prisms - Focus on a Constructor

Prisms handle sum types where the focus might not exist:

```haskell
data Result a
  = Success a
  | Failure String
  deriving Show

makePrisms ''Result

-- Generated prisms:
-- _Success :: Prism' (Result a) a
-- _Failure :: Prism' (Result a) String

result1 :: Result Int
result1 = Success 42

result2 :: Result Int
result2 = Failure "error"

-- Preview: try to extract
result1 ^? _Success
-- Just 42

result2 ^? _Success
-- Nothing

result2 ^? _Failure
-- Just "error"

-- Review: construct
_Success # 100
-- Success 100

_Failure # "oops"
-- Failure "oops"
```

## Traversals - Focus on Multiple Elements

Traversals operate on multiple values:

```haskell
-- Traverse list elements
numbers :: [Int]
numbers = [1, 2, 3, 4, 5]

-- View all (as list)
numbers ^.. traverse
-- [1, 2, 3, 4, 5]

-- Modify all
numbers & traverse %~ (*2)
-- [2, 4, 6, 8, 10]

-- Set all
numbers & traverse .~ 0
-- [0, 0, 0, 0, 0]
```

## Filtered Traversals

```haskell
-- Only even numbers
numbers ^.. traverse . filtered even
-- [2, 4]

-- Modify only even numbers
numbers & traverse . filtered even %~ (*10)
-- [1, 20, 3, 40, 5]

-- Only positive after transformation
[1, -2, 3, -4] ^.. traverse . filtered (> 0)
-- [1, 3]
```

## Record Updates

```haskell
data Company = Company
  { _companyName :: String
  , _employees :: [Person]
  } deriving Show

makeLenses ''Company

company :: Company
company = Company "Acme Inc" [alice, bob, charlie]

-- Update all employee ages
company & employees . traverse . age %~ (+1)

-- Update all employee cities
company & employees . traverse . address . city .~ "Boston"

-- Get all employee names
company ^.. employees . traverse . name
-- ["Alice", "Bob", "Charlie"]

-- Find employees in NYC
company ^.. employees . traverse . filtered (\p -> p ^. address . city == "NYC")
```

## Isos - Bidirectional Conversion

An Iso represents an isomorphism:

```haskell
-- String <-> [Char] (trivial, but demonstrates concept)
import Data.Char (toUpper, toLower)

-- Celsius <-> Fahrenheit
celsiusFahrenheit :: Iso' Double Double
celsiusFahrenheit = iso toF toC
  where
    toF c = c * 9 / 5 + 32
    toC f = (f - 32) * 5 / 9

-- Use in both directions
0 ^. celsiusFahrenheit
-- 32.0

32 ^. from celsiusFahrenheit
-- 0.0

-- In modifications
[0, 10, 20] & traverse . celsiusFahrenheit %~ (+10)
-- Adds 10 Fahrenheit to each Celsius value
```

## At and Ix - Map and List Access

```haskell
import qualified Data.Map as Map

-- Map access
userMap :: Map.Map Int String
userMap = Map.fromList [(1, "Alice"), (2, "Bob")]

-- at: access map key (Maybe)
userMap ^. at 1
-- Just "Alice"

userMap ^. at 99
-- Nothing

-- Set map value
userMap & at 1 .~ Just "Alicia"
-- fromList [(1, "Alicia"), (2, "Bob")]

-- Delete map value
userMap & at 1 .~ Nothing
-- fromList [(2, "Bob")]

-- ix: index with default behavior
userMap ^? ix 1
-- Just "Alice"

-- Modify if exists
userMap & ix 1 %~ map toUpper
-- fromList [(1, "ALICE"), (2, "Bob")]

-- List indexing
[10, 20, 30] ^? ix 1
-- Just 20

[10, 20, 30] & ix 1 .~ 25
-- [10, 25, 30]
```

## Operators

Common lens operators:

```haskell
-- (^.) - view
alice ^. name  -- "Alice"

-- (.~) - set
alice & name .~ "Bob"

-- (%~) - modify
alice & age %~ (+1)

-- (^?) - preview (Maybe)
Success 42 ^? _Success  -- Just 42

-- (^..) - to list
[1,2,3] ^.. traverse  -- [1,2,3]

-- (.=) - stateful set (in State monad)
-- (%=) - stateful modify

-- (^@..) - indexed list
["a", "b", "c"] ^@.. itraversed  -- [(0,"a"), (1,"b"), (2,"c")]
```

## Practical Example: Nested Records

```haskell
data Config = Config
  { _database :: DatabaseConfig
  , _server :: ServerConfig
  } deriving Show

data DatabaseConfig = DatabaseConfig
  { _host :: String
  , _port :: Int
  , _credentials :: Credentials
  } deriving Show

data ServerConfig = ServerConfig
  { _serverPort :: Int
  , _maxConnections :: Int
  } deriving Show

data Credentials = Credentials
  { _username :: String
  , _password :: String
  } deriving Show

makeLenses ''Config
makeLenses ''DatabaseConfig
makeLenses ''ServerConfig
makeLenses ''Credentials

config :: Config
config = Config
  { _database = DatabaseConfig "localhost" 5432
      (Credentials "admin" "secret")
  , _server = ServerConfig 8080 100
  }

-- Deep access
config ^. database . credentials . username
-- "admin"

-- Deep update
config & database . credentials . password .~ "new-secret"

-- Multiple updates
config
  & database . port .~ 5433
  & server . maxConnections .~ 200
```

## Stateful Updates

Use lenses with State monad:

```haskell
import Control.Monad.State

updatePerson :: State Person ()
updatePerson = do
  age %= (+1)  -- Increment age
  name %= map toUpper  -- Uppercase name
  address . city .= "Boston"  -- Set city

-- Run state
runState updatePerson alice
-- ((), Person "ALICE" 31 (Address "Main St" "Boston"))
```

## Folding and Traversing

```haskell
-- Sum all ages
company ^. employees . traverse . age . to sum
-- Sum of all ages

-- Compute with foldOf
foldOf (employees . traverse . age) company
-- Sum of ages

-- sumOf shorthand
sumOf (employees . traverse . age) company

-- Any/all predicates
anyOf (employees . traverse . age) (> 30) company
-- True if any employee > 30

allOf (employees . traverse . age) (> 18) company
-- True if all employees > 18
```

## Custom Lenses

Define your own lenses:

```haskell
-- Manual lens creation
fullName :: Lens' Person String
fullName = lens getter setter
  where
    getter person = _name person
    setter person newName = person { _name = newName }

-- Lens for computed property
ageBracket :: Lens' Person String
ageBracket = lens getter setter
  where
    getter person
      | person ^. age < 18 = "minor"
      | person ^. age < 65 = "adult"
      | otherwise = "senior"
    setter person bracket = case bracket of
      "minor" -> person & age .~ 16
      "adult" -> person & age .~ 30
      "senior" -> person & age .~ 70
      _ -> person
```

## Indexed Traversals

Work with indices:

```haskell
-- Get indexed list
["a", "b", "c"] ^@.. itraversed
-- [(0,"a"), (1,"b"), (2,"c")]

-- Modify with index
["a", "b", "c"] & itraversed %@~ \i c -> show i ++ c
-- ["0a", "1b", "2c"]

-- Filter by index
["a", "b", "c", "d"] ^.. itraversed . filtered (\i -> even (fst i))
-- ["a", "c"]
```

## Practical: JSON-like Updates

```haskell
import qualified Data.Map as Map

data Value
  = VNull
  | VBool Bool
  | VInt Int
  | VString String
  | VArray [Value]
  | VObject (Map.Map String Value)
  deriving Show

makePrisms ''Value

-- Navigate JSON-like structure
jsonDoc :: Value
jsonDoc = VObject $ Map.fromList
  [ ("user", VObject $ Map.fromList
      [ ("name", VString "Alice")
      , ("age", VInt 30)
      , ("tags", VArray [VString "admin", VString "user"])
      ])
  ]

-- Access nested value
jsonDoc ^? _VObject . ix "user" . _VObject . ix "name" . _VString
-- Just "Alice"

-- Update nested value
jsonDoc & _VObject . ix "user" . _VObject . ix "age" . _VInt .~ 31

-- Add to array
jsonDoc & _VObject . ix "user" . _VObject . ix "tags" . _VArray
  %~ (++ [VString "moderator"])
```

## Performance Tips

```haskell
-- Avoid multiple passes
-- Bad: multiple traversals
let p1 = person & name %~ map toUpper
    p2 = p1 & age %~ (+1)
    p3 = p2 & address . city .~ "NYC"
in p3

-- Good: single pass
person
  & name %~ map toUpper
  & age %~ (+1)
  & address . city .~ "NYC"

-- Use strict versions for performance
person & name %@~ \i s -> ...  -- lazy
person & name %!~ \s -> ...     -- strict
```

## Key Takeaways

1. **Lenses** - composable getters/setters for fields
2. **Prisms** - getters/setters for sum type constructors
3. **Traversals** - operate on multiple values
4. **Composition** - combine optics to access deeply nested data
5. **Type safety** - lens operations are fully type-checked

Haskell's `lens` library eliminates boilerplate for immutable updates. Optics are composable, type-safe, and make working with complex data structures elegant and maintainable.
