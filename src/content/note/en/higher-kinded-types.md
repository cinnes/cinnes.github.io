---
title: Higher-Kinded Types - Abstracting Over Type Constructors
timestamp: 2025-11-14 00:00:00+00:00
description: Explore higher-kinded types to write generic abstractions that work across different container types through type classes and polymorphism.
tags: [fp, hkt, types, haskell]
toc: true
---


Higher-kinded types (HKTs) allow you to abstract over type constructors—types that themselves take type parameters. In Haskell, HKTs are native and enable powerful generic programming through type classes.

## Kinds - Types of Types

Every type has a kind, which describes its "type":

```haskell
-- :kind or :k in GHCi shows the kind

:k Int
-- Int :: *
-- * means a concrete type

:k Maybe
-- Maybe :: * -> *
-- Takes a type, returns a type

:k Either
-- Either :: * -> * -> *
-- Takes two types, returns a type

:k []
-- [] :: * -> *
-- List type constructor

:k (,)
-- (,) :: * -> * -> *
-- Tuple type constructor
```

## Type Constructors as Parameters

HKTs let you parameterize over type constructors:

```haskell
-- Functor abstracts over * -> * types
class Functor f where
  fmap :: (a -> b) -> f a -> f b

-- f has kind * -> *
-- f could be Maybe, [], Either e, IO, etc.

-- Different instances
instance Functor Maybe where
  fmap _ Nothing = Nothing
  fmap g (Just x) = Just (g x)

instance Functor [] where
  fmap = map

instance Functor (Either e) where
  fmap _ (Left e) = Left e
  fmap g (Right x) = Right (g x)
```

## Generic Functions

Write functions that work for any `Functor`:

```haskell
-- Works for Maybe, [], Either, IO, etc.
doubleInside :: (Functor f, Num a) => f a -> f a
doubleInside = fmap (*2)

doubleInside (Just 5)
-- Just 10

doubleInside [1, 2, 3]
-- [2, 4, 6]

doubleInside (Right 10 :: Either String Int)
-- Right 20
```

## Type Class Hierarchy

HKTs enable type class hierarchies:

```haskell
-- Functor -> Applicative -> Monad
class Functor f where
  fmap :: (a -> b) -> f a -> f b

class Functor f => Applicative f where
  pure :: a -> f a
  (<*>) :: f (a -> b) -> f a -> f b

class Applicative m => Monad m where
  return :: a -> m a
  (>>=) :: m a -> (a -> m b) -> m b

-- Generic function works for all Applicatives
liftA2Generic :: Applicative f => (a -> b -> c) -> f a -> f b -> f c
liftA2Generic g fa fb = g <$> fa <*> fb

liftA2Generic (+) (Just 3) (Just 5)
-- Just 8

liftA2Generic (+) [1, 2] [10, 20]
-- [11, 21, 12, 22]
```

## Traversable - Multi-HKT Classes

Some type classes abstract over multiple HKTs:

```haskell
class (Functor t, Foldable t) => Traversable t where
  traverse :: Applicative f => (a -> f b) -> t a -> f (t b)
  sequenceA :: Applicative f => t (f a) -> f (t a)

-- t has kind * -> *  (the structure)
-- f has kind * -> *  (the effect)

-- Example: validate all elements
validateAll :: [Maybe Int] -> Maybe [Int]
validateAll = sequenceA

validateAll [Just 1, Just 2, Just 3]
-- Just [1, 2, 3]

validateAll [Just 1, Nothing, Just 3]
-- Nothing
```

## Custom HKT Type Classes

Define your own abstractions:

```haskell
-- Bifunctor - two type parameters
class Bifunctor p where
  bimap :: (a -> c) -> (b -> d) -> p a b -> p c d
  first :: (a -> c) -> p a b -> p c b
  second :: (b -> d) -> p a b -> p a d

instance Bifunctor Either where
  bimap f _ (Left x) = Left (f x)
  bimap _ g (Right y) = Right (g y)
  first f = bimap f id
  second g = bimap id g

instance Bifunctor (,) where
  bimap f g (x, y) = (f x, g y)
  first f (x, y) = (f x, y)
  second g (x, y) = (x, g y)

-- Usage
first (+1) (Left 5)
-- Left 6

second (*2) (Right 10)
-- Right 20

bimap (+1) (*2) (3, 5)
-- (4, 10)
```

## Monad Transformers

Stack effects using higher-kinded types:

```haskell
-- MaybeT transformer
newtype MaybeT m a = MaybeT { runMaybeT :: m (Maybe a) }

-- m has kind * -> *
-- MaybeT m has kind * -> *
-- MaybeT m a has kind *

instance Monad m => Functor (MaybeT m) where
  fmap f (MaybeT ma) = MaybeT $ do
    maybeA <- ma
    return (fmap f maybeA)

instance Monad m => Applicative (MaybeT m) where
  pure = MaybeT . return . Just
  (MaybeT mf) <*> (MaybeT ma) = MaybeT $ do
    maybeF <- mf
    maybeA <- ma
    return (maybeF <*> maybeA)

instance Monad m => Monad (MaybeT m) where
  (MaybeT ma) >>= f = MaybeT $ do
    maybeA <- ma
    case maybeA of
      Nothing -> return Nothing
      Just a -> runMaybeT (f a)

-- Combine IO and Maybe
type IOMaybe = MaybeT IO

askUser :: String -> IOMaybe String
askUser prompt = MaybeT $ do
  putStrLn prompt
  input <- getLine
  return $ if null input then Nothing else Just input

program :: IOMaybe ()
program = do
  name <- askUser "Name:"
  email <- askUser "Email:"
  lift $ putStrLn $ "Hello, " ++ name ++ " (" ++ email ++ ")"
```

## Higher-Kinded Data

Use HKTs for generic data structures:

```haskell
-- Generic user type parameterized by effect
data User f = User
  { userId :: f Int
  , userName :: f String
  , userEmail :: f String
  }

-- Pure user
type PureUser = User Identity

-- Partial user (for forms)
type PartialUser = User Maybe

-- Validated user (with validation)
type ValidatedUser = User (Either String)

-- Example
partial User :: PartialUser
partialUser = User
  { userId = Just 1
  , userName = Just "Alice"
  , userEmail = Nothing  -- Not yet filled
  }

-- Validation
validateUser :: PartialUser -> ValidatedUser
validateUser user = User
  { userId = maybe (Left "Missing ID") Right (userId user)
  , userName = maybe (Left "Missing name") Right (userName user)
  , userEmail = maybe (Left "Missing email") Right (userEmail user)
  }
```

## Rank-N Types

HKTs enable rank-2 polymorphism:

```haskell
{-# LANGUAGE RankNTypes #-}

-- Function that takes a polymorphic function
runBoth :: (forall a. f a -> a) -> f Int -> f String -> (Int, String)
runBoth extract fi fs = (extract fi, extract fs)

-- Extract from Identity
getId :: forall a. Identity a -> a
getId (Identity x) = x

runBoth getId (Identity 42) (Identity "hello")
-- (42, "hello")

-- Generic ST computation
runST :: (forall s. ST s a) -> a
-- s is locally quantified - prevents escape
```

## Data Kinds and Kind Polymorphism

Use types as kinds:

```haskell
{-# LANGUAGE DataKinds #-}
{-# LANGUAGE KindSignatures #-}
{-# LANGUAGE GADTs #-}

-- Promote data to kind level
data Nat = Zero | Succ Nat

-- Type-level natural numbers
data Vec (n :: Nat) a where
  VNil :: Vec 'Zero a
  VCons :: a -> Vec n a -> Vec ('Succ n) a

-- Length-indexed list
v1 :: Vec ('Succ 'Zero) Int
v1 = VCons 1 VNil

v2 :: Vec ('Succ ('Succ 'Zero)) Int
v2 = VCons 1 (VCons 2 VNil)

-- Type-safe head (can't call on empty!)
vhead :: Vec ('Succ n) a -> a
vhead (VCons x _) = x
```

## Type Families

Type-level functions using HKTs:

```haskell
{-# LANGUAGE TypeFamilies #-}

-- Associated type families
class Collection c where
  type Elem c
  empty :: c
  insert :: Elem c -> c -> c
  toList :: c -> [Elem c]

instance Collection [a] where
  type Elem [a] = a
  empty = []
  insert = (:)
  toList = id

instance Ord a => Collection (Set a) where
  type Elem (Set a) = a
  empty = Set.empty
  insert = Set.insert
  toList = Set.toList

-- Generic function
singleton :: Collection c => Elem c -> c
singleton x = insert x empty
```

## Free Constructions

Build free structures over HKTs:

```haskell
-- Free monad
data Free f a
  = Pure a
  | Free (f (Free f a))

instance Functor f => Functor (Free f) where
  fmap g (Pure x) = Pure (g x)
  fmap g (Free fa) = Free (fmap (fmap g) fa)

instance Functor f => Applicative (Free f) where
  pure = Pure
  Pure f <*> Pure x = Pure (f x)
  Pure f <*> Free fx = Free (fmap (fmap f) fx)
  Free ff <*> fx = Free (fmap (<*> fx) ff)

instance Functor f => Monad (Free f) where
  Pure x >>= f = f x
  Free fx >>= f = Free (fmap (>>= f) fx)

-- Lift functor into free monad
liftF :: Functor f => f a -> Free f a
liftF fa = Free (fmap Pure fa)
```

## Practical Example: Generic Effects

```haskell
-- Generic effect interface
class Monad m => MonadFileSystem m where
  readFile' :: FilePath -> m String
  writeFile' :: FilePath -> String -> m ()

class Monad m => MonadHTTP m where
  httpGet :: String -> m String
  httpPost :: String -> String -> m String

-- Generic business logic
processData :: (MonadFileSystem m, MonadHTTP m) => m ()
processData = do
  config <- readFile' "config.json"
  result <- httpPost "https://api.example.com" config
  writeFile' "result.txt" result

-- Different implementations
instance MonadFileSystem IO where
  readFile' = Prelude.readFile
  writeFile' = Prelude.writeFile

instance MonadHTTP IO where
  httpGet url = -- actual HTTP call
  httpPost url body = -- actual HTTP call

-- Test implementation
data MockIO a = MockIO { runMock :: Map String String -> (a, Map String String) }

instance Monad MockIO where
  -- ...

instance MonadFileSystem MockIO where
  readFile' path = MockIO $ \store ->
    (fromMaybe "" (Map.lookup path store), store)
  writeFile' path contents = MockIO $ \store ->
    ((), Map.insert path contents store)
```

## Key Takeaways

1. **HKTs are native** - no encoding needed in Haskell
2. **Type classes** - abstract over type constructors
3. **Kind system** - track arity of type constructors
4. **Transformers** - compose effects
5. **Generic code** - write once, works for many types

Higher-kinded types are fundamental to Haskell's abstraction capabilities. They enable writing truly generic, reusable code that works uniformly across different computational contexts.
