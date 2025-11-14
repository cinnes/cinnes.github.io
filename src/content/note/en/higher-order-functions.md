---
title: Higher-Order Functions - Functions as First-Class Citizens
timestamp: 2025-11-11 00:00:00+00:00
description: Master higher-order functions to write more expressive and reusable code by treating functions as values.
tags: [fp, hof, haskell]
toc: true
---

In functional programming, functions are treated as first-class citizens—meaning they're just as important as any other value in your program. You can store them in variables, pass them as arguments to other functions, and return them as results. This simple idea unlocks incredibly powerful programming patterns.

Higher-order functions are functions that work with other functions. They either take functions as arguments, return functions as results, or both. This might sound abstract, but you've probably used them before without realizing it—whenever you use `map`, `filter`, or similar operations on lists.

## What Makes a Function "Higher-Order"?

A function is considered higher-order if it does at least one of these things:

1. **Takes a function as an argument** - Like a function that accepts a transformation to apply
2. **Returns a function as its result** - Like a function factory that builds customized functions

Let's see both in action:

```haskell
-- Takes a function as argument
applyTwice :: (a -> a) -> a -> a
applyTwice f x = f (f x)

-- Returns a function
makeAdder :: Int -> (Int -> Int)
makeAdder n = \x -> x + n
```

The first example, `applyTwice`, takes any function `f` and applies it twice to a value. The second, `makeAdder`, creates a new function that adds a specific number. Here's how they work:

```haskell
applyTwice (+3) 10    -- Result: 16 (10 + 3 + 3)
add5 = makeAdder 5
add5 7                -- Result: 12 (7 + 5)
```

## The Big Three: Map, Filter, and Fold

These are the most common higher-order functions you'll encounter. They form the foundation of functional list processing.

### Map - Transform Every Element

`map` takes a function and applies it to every element in a list, giving you a new list with the transformed values. Think of it like an assembly line where each item gets the same treatment.

```haskell
-- Signature: map :: (a -> b) -> [a] -> [b]

map (*2) [1, 2, 3, 4, 5]
-- Doubles each number: [2, 4, 6, 8, 10]

map toUpper "hello"
-- Uppercases each character: "HELLO"

map (\x -> x * x) [1, 2, 3]
-- Squares each number: [1, 4, 9]
```

The beauty of `map` is that it separates *what* you want to do (the transformation function) from *where* you want to do it (the list). This makes your code more modular and reusable.

### Filter - Keep Only What Matches

`filter` keeps only the elements that pass a test (return `True` for a given predicate function). It's like a bouncer at a club—only letting through what meets the criteria.

```haskell
-- Signature: filter :: (a -> Bool) -> [a] -> [a]

filter even [1, 2, 3, 4, 5, 6]
-- Keeps only even numbers: [2, 4, 6]

filter (> 5) [3, 8, 1, 9, 2]
-- Keeps only numbers greater than 5: [8, 9]
```

You can combine `filter` with `map` to first select what you want, then transform it. This is called composition, and it's one of the most powerful patterns in functional programming.

### Fold - Combine Into One Value

`fold` (also called `reduce`) takes a list and combines all its elements into a single value using a function you provide. Think of it like folding a piece of paper repeatedly—each fold combines what you have so far with the next piece.

```haskell
-- Left fold: foldl :: (b -> a -> b) -> b -> [a] -> b
-- Right fold: foldr :: (a -> b -> b) -> b -> [a] -> b

-- Sum all numbers
foldl (+) 0 [1, 2, 3, 4, 5]
-- Works like: ((((0 + 1) + 2) + 3) + 4) + 5 = 15

-- Multiply all numbers
foldl (*) 1 [1, 2, 3, 4]
-- Works like: ((((1 * 1) * 2) * 3) * 4) = 24

-- Find the maximum
foldl1 max [3, 1, 4, 1, 5, 9]
-- Compares each number to find the largest: 9
```

The first argument to `foldl` is the combining function, the second is the starting value, and the third is the list to process.

## Function Composition - Building Bigger from Smaller

One of the key benefits of higher-order functions is that you can combine simple functions to build more complex ones. The composition operator `(.)` lets you chain functions together, where the output of one becomes the input of the next.

```haskell
-- Signature: (.) :: (b -> c) -> (a -> b) -> a -> c

double :: Int -> Int
double x = x * 2

increment :: Int -> Int
increment x = x + 1

-- Compose them: first double, then increment
doubleAndIncrement :: Int -> Int
doubleAndIncrement = increment . double

doubleAndIncrement 5
-- First: 5 * 2 = 10, then: 10 + 1 = 11
```

You can chain as many functions as you want. This example processes a string by reversing it, filtering to only letters, then uppercasing:

```haskell
process :: String -> String
process = map toUpper . filter isAlpha . reverse

process "hello, world!"
-- Result: "DLROWOLLEH"
```

Read composition from right to left—it's like a pipeline where data flows through each transformation.

## Creating Your Own Higher-Order Functions

You're not limited to the built-in functions. Creating your own higher-order functions lets you capture patterns specific to your problem domain.

### Combining Predicates

Here's how you might combine multiple test functions:

```haskell
-- Check if both conditions are true
both :: (a -> Bool) -> (a -> Bool) -> a -> Bool
both p q x = p x && q x

-- Check if either condition is true
either' :: (a -> Bool) -> (a -> Bool) -> a -> Bool
either' p q x = p x || q x

-- Negate a condition
neg :: (a -> Bool) -> a -> Bool
neg p x = not (p x)
```

Now you can build complex predicates from simple ones:

```haskell
isEvenAndPositive :: Int -> Bool
isEvenAndPositive = both even (> 0)

filter isEvenAndPositive [-2, -1, 0, 1, 2, 3, 4]
-- Result: [2, 4]
```

### Repeating Functions

Want to apply a function multiple times? Here's a higher-order function that does exactly that:

```haskell
times :: Int -> (a -> a) -> a -> a
times 0 f = id  -- No times means do nothing
times n f = f . times (n - 1) f  -- Apply f, then recurse

times 3 (*2) 5
-- Doubles three times: 5 * 2 * 2 * 2 = 40
```

## Partial Application - Specialized Functions

In Haskell, all functions are automatically "curried"—they take one argument at a time. This means when you call a function with fewer arguments than it expects, you get back a new function waiting for the rest.

This is incredibly useful for creating specialized versions of general functions:

```haskell
add :: Int -> Int -> Int
add x y = x + y

-- Partial application: give just the first argument
add5 :: Int -> Int
add5 = add 5

add5 10  -- Result: 15

-- Works with operators too
multiplyBy10 = (*10)
divideBy2 = (/2)

-- Use in filter and map
filter (> 5) [1..10]  -- Keep numbers greater than 5
map (*2) [1..5]       -- Double each number
```

This pattern is everywhere in functional programming. Instead of writing lots of similar functions, you write one general function and create specialized versions through partial application.

## Practical Example - Data Processing

Let's see how these concepts work together in a real scenario. Imagine you have a list of people and want to find specific information:

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

-- Find names of people over 30 earning more than 50k
highEarners :: [Person] -> [String]
highEarners =
  map name                          -- Extract names
  . filter (\p -> salary p > 50000) -- Keep high earners
  . filter (\p -> age p > 30)       -- Keep those over 30

highEarners people
-- Result: ["Charlie"]
```

Notice how we built a complex query by composing simple operations. Each function does one thing well, and they combine naturally.

## Point-Free Style - Implicit Arguments

Sometimes you can write functions without explicitly naming their arguments. This is called "point-free" or "tacit" style. While it can be more abstract, it often reveals the essence of what a function does:

```haskell
-- With explicit argument (pointful)
sumSquares :: [Int] -> Int
sumSquares xs = sum (map (\x -> x * x) xs)

-- Without naming the list (point-free)
sumSquares' :: [Int] -> Int
sumSquares' = sum . map (^2)

-- More examples
isEven :: Int -> Bool
isEven = (== 0) . (`mod` 2)

length' :: [a] -> Int
length' = foldr (\_ acc -> acc + 1) 0
```

Point-free style isn't always better—use it when it makes the code clearer, not just shorter.

## Why This Matters

Higher-order functions fundamentally change how you think about programming. Instead of writing specific procedures for each task, you write general transformations and combine them. This leads to:

- **Less code duplication** - Write the pattern once, customize with functions
- **More reusability** - Small, focused functions can be used many ways
- **Easier testing** - Pure functions with no side effects are simple to test
- **Better composition** - Build complex behavior from simple pieces

The examples here just scratch the surface. As you work with higher-order functions more, you'll start seeing patterns everywhere and finding elegant solutions to complex problems.
