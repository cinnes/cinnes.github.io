---
title: "Types are your first tests"
timestamp: 2025-11-13 15:30:00+00:00
tags: [fp, haskell, types]
description: Strong types catch bugs before you run a single test
---

If your Haskell code compiles, you've already passed dozens of tests.

```haskell
-- This won't compile - type error!
badFunction :: Int -> String
badFunction x = x + 1  -- Error: can't return Int when String expected
```

Compare to dynamically typed languages where this silently breaks at runtime. The compiler is your friend.

Type-driven development: write the type signature first, let the compiler guide your implementation.
