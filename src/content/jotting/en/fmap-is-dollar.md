---
title: "fmap is just <$>"
timestamp: 2025-11-14 12:00:00+00:00
tags: [fp, haskell, functors]
description: Quick reminder about the functor mapping operator
---

TIL that `<$>` is just infix `fmap`. These are identical:

```haskell
fmap (+1) (Just 5)
(+1) <$> Just 5
```

The `<$>` operator makes chaining way more readable:

```haskell
-- Instead of this:
fmap (*2) (fmap (+1) (Just 5))

-- Do this:
(*2) <$> ((+1) <$> Just 5)

-- Or even better with composition:
((*2) . (+1)) <$> Just 5
```

This works because `<$>` is just function application lifted into a functor context. Mind = blown.
