import { BlogPost } from '../types/blog'

export const sampleBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Getting Started with React Hooks',
    excerpt:
      'Learn how to use React Hooks to manage state and side effects in your functional components. This comprehensive guide covers useState, useEffect, and custom hooks.',
    content: `# Getting Started with React Hooks

React Hooks revolutionized how we write React components by allowing us to use state and other React features in functional components. In this comprehensive guide, we'll explore the most commonly used hooks and learn how to create our own custom hooks.

## useState Hook

The \`useState\` hook is the most basic hook that allows you to add state to functional components:

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## useEffect Hook

The \`useEffect\` hook lets you perform side effects in functional components. It serves the same purpose as \`componentDidMount\`, \`componentDidUpdate\`, and \`componentWillUnmount\` combined in React classes.

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Custom Hooks

You can create your own hooks to share stateful logic between components:

\`\`\`javascript
import { useState, useEffect } from 'react';

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}
\`\`\`

React Hooks provide a more direct API to the React concepts you already know. They offer a powerful way to compose behavior and share logic between components without the complexity of higher-order components or render props.`,
    author: 'Sarah Johnson',
    publishedAt: new Date('2024-01-20'),
    tags: ['react', 'hooks', 'javascript', 'frontend'],
    slug: 'getting-started-with-react-hooks',
    featured: true,
  },
  {
    id: '2',
    title: 'TypeScript Best Practices for Large Applications',
    excerpt:
      'Discover essential TypeScript patterns and practices that will help you build maintainable, scalable applications with confidence.',
    content: `# TypeScript Best Practices for Large Applications

TypeScript has become the go-to choice for building large-scale JavaScript applications. Its static type system helps catch errors early, improves code readability, and enhances developer productivity. In this article, we'll explore best practices for using TypeScript in large applications.

## Strict Configuration

Always start with a strict TypeScript configuration:

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
\`\`\`

## Use Interface for Object Shapes

Prefer interfaces over type aliases for object shapes:

\`\`\`typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

// Avoid for simple object shapes
type User = {
  id: string;
  name: string;
  email: string;
}
\`\`\`

## Leverage Union Types

Union types are powerful for representing values that can be one of several types:

\`\`\`typescript
type Status = 'loading' | 'success' | 'error';

interface ApiResponse<T> {
  status: Status;
  data?: T;
  error?: string;
}
\`\`\`

## Generic Constraints

Use generic constraints to make your types more specific:

\`\`\`typescript
interface Identifiable {
  id: string;
}

function updateEntity<T extends Identifiable>(entity: T, updates: Partial<T>): T {
  return { ...entity, ...updates };
}
\`\`\`

Following these practices will help you write more maintainable and robust TypeScript code that scales well with your application's growth.`,
    author: 'Michael Chen',
    publishedAt: new Date('2024-01-18'),
    tags: ['typescript', 'best-practices', 'javascript', 'programming'],
    slug: 'typescript-best-practices-large-applications',
    featured: true,
  },
  {
    id: '3',
    title: 'Building Responsive Layouts with CSS Grid',
    excerpt:
      'Master CSS Grid to create complex, responsive layouts with ease. Learn the fundamentals and advanced techniques for modern web design.',
    content: `# Building Responsive Layouts with CSS Grid

CSS Grid Layout is a two-dimensional layout method that offers a more efficient way to arrange elements on a web page. Unlike Flexbox, which is primarily one-dimensional, Grid can handle both rows and columns simultaneously.

## Basic Grid Setup

To create a grid container, simply apply \`display: grid\`:

\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 1rem;
}
\`\`\`

## Grid Areas

Named grid areas make layouts more semantic and easier to maintain:

\`\`\`css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
\`\`\`

## Responsive Design

CSS Grid excels at responsive design:

\`\`\`css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .layout {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
    grid-template-columns: 1fr;
  }
}
\`\`\`

CSS Grid provides incredible flexibility for creating responsive, maintainable layouts that adapt to different screen sizes and content requirements.`,
    author: 'Emily Rodriguez',
    publishedAt: new Date('2024-01-15'),
    tags: ['css', 'grid', 'responsive-design', 'frontend', 'web-design'],
    slug: 'building-responsive-layouts-css-grid',
    featured: false,
  },
  {
    id: '4',
    title: 'Introduction to Node.js and Express',
    excerpt:
      'Get started with server-side JavaScript using Node.js and Express. Build your first REST API and understand the fundamentals of backend development.',
    content: `# Introduction to Node.js and Express

Node.js revolutionized JavaScript by bringing it to the server side. Combined with Express.js, it provides a powerful platform for building scalable web applications and APIs.

## What is Node.js?

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows you to run JavaScript on the server, enabling full-stack JavaScript development.

## Setting Up Express

Getting started with Express is straightforward:

\`\`\`bash
npm init -y
npm install express
\`\`\`

Create a basic server:

\`\`\`javascript
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
\`\`\`

## Building REST API Endpoints

Express makes it easy to create RESTful APIs:

\`\`\`javascript
const users = [];

// GET all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// POST new user
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  const user = { 
    id: Date.now().toString(), 
    name, 
    email 
  };
  users.push(user);
  res.status(201).json(user);
});

// GET user by ID
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});
\`\`\`

## Middleware

Express middleware functions execute during the request-response cycle:

\`\`\`javascript
// Logging middleware
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.path} - \${new Date().toISOString()}\`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
\`\`\`

Node.js and Express provide a solid foundation for building modern web applications with JavaScript across the entire stack.`,
    author: 'David Wilson',
    publishedAt: new Date('2024-01-12'),
    tags: ['nodejs', 'express', 'javascript', 'backend', 'api'],
    slug: 'introduction-nodejs-express',
    featured: false,
  },
  {
    id: '5',
    title: 'Modern JavaScript ES6+ Features You Should Know',
    excerpt:
      'Explore the essential ES6+ features that modern JavaScript developers use daily. From arrow functions to async/await, level up your coding skills.',
    content: `# Modern JavaScript ES6+ Features You Should Know

JavaScript has evolved significantly with ES6 and subsequent versions. These modern features make code more readable, maintainable, and efficient. Let's explore the essential features every developer should master.

## Arrow Functions

Arrow functions provide a concise syntax for writing functions:

\`\`\`javascript
// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// With single parameter
const square = x => x * x;

// With block body
const processData = data => {
  const processed = data.map(item => item * 2);
  return processed.filter(item => item > 10);
};
\`\`\`

## Destructuring Assignment

Extract values from arrays and objects with ease:

\`\`\`javascript
// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// Object destructuring
const { name, age, city = 'Unknown' } = user;

// Function parameters
const handleUser = ({ name, email }) => {
  console.log(\`User: \${name} (\${email})\`);
};
\`\`\`

## Template Literals

Create strings with embedded expressions:

\`\`\`javascript
const name = 'World';
const greeting = \`Hello, \${name}!\`;

// Multi-line strings
const html = \`
  <div class="container">
    <h1>\${title}</h1>
    <p>\${content}</p>
  </div>
\`;
\`\`\`

## Promises and Async/Await

Handle asynchronous operations elegantly:

\`\`\`javascript
// Promises
fetch('/api/users')
  .then(response => response.json())
  .then(users => console.log(users))
  .catch(error => console.error(error));

// Async/await
async function getUsers() {
  try {
    const response = await fetch('/api/users');
    const users = await response.json();
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}
\`\`\`

## Modules

Organize code with import and export statements:

\`\`\`javascript
// utils.js
export const formatDate = date => date.toLocaleDateString();
export default function calculateAge(birthDate) {
  return new Date().getFullYear() - birthDate.getFullYear();
}

// main.js
import calculateAge, { formatDate } from './utils.js';

const age = calculateAge(new Date('1990-01-01'));
const formattedDate = formatDate(new Date());
\`\`\`

## Spread and Rest Operators

The spread (...) operator has multiple uses:

\`\`\`javascript
// Array spreading
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

// Object spreading
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// Rest parameters
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}
\`\`\`

These ES6+ features form the foundation of modern JavaScript development. Mastering them will make your code more expressive and maintainable.`,
    author: 'Alex Thompson',
    publishedAt: new Date('2024-01-10'),
    tags: ['javascript', 'es6', 'modern-js', 'frontend', 'programming'],
    slug: 'modern-javascript-es6-features',
    featured: false,
  },
  {
    id: '6',
    title: 'Understanding React State Management',
    excerpt:
      'Dive deep into React state management patterns. Learn when to use local state, Context API, and external state management libraries.',
    content: `# Understanding React State Management

State management is one of the most important aspects of React development. As applications grow in complexity, managing state effectively becomes crucial for maintainability and performance.

## Local Component State

Start with local state for simple, isolated component needs:

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const increment = () => setCount(prev => prev + 1);
  const toggle = () => setIsVisible(prev => !prev);

  return (
    <div>
      {isVisible && <p>Count: {count}</p>}
      <button onClick={increment}>Increment</button>
      <button onClick={toggle}>Toggle</button>
    </div>
  );
}
\`\`\`

## Lifting State Up

When multiple components need to share state, lift it to their common ancestor:

\`\`\`jsx
function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      <Header user={user} />
      <Profile user={user} onUserUpdate={setUser} />
      <Settings user={user} onUserUpdate={setUser} />
    </div>
  );
}
\`\`\`

## Context API

For deeply nested component trees, Context API prevents prop drilling:

\`\`\`jsx
const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const value = {
    user,
    updateUser: setUser,
    logout: () => setUser(null)
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
\`\`\`

## useReducer for Complex State

When state logic becomes complex, useReducer provides better organization:

\`\`\`jsx
const initialState = {
  items: [],
  loading: false,
  error: null
};

function todoReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    default:
      return state;
  }
}

function TodoList() {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  const addTodo = (text) => {
    dispatch({ type: 'ADD_ITEM', payload: { id: Date.now(), text } });
  };

  return (
    <div>
      {state.loading && <p>Loading...</p>}
      {state.error && <p>Error: {state.error}</p>}
      {state.items.map(item => (
        <div key={item.id}>{item.text}</div>
      ))}
    </div>
  );
}
\`\`\`

## External State Management

For large applications, consider libraries like Redux, Zustand, or Jotai:

\`\`\`javascript
// Zustand example
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

function Counter() {
  const { count, increment, decrement, reset } = useStore();
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
\`\`\`

Choose the right state management approach based on your application's complexity and requirements. Start simple and evolve as needed.`,
    author: 'Jessica Park',
    publishedAt: new Date('2024-01-08'),
    tags: ['react', 'state-management', 'hooks', 'frontend', 'javascript'],
    slug: 'understanding-react-state-management',
    featured: false,
  },
]
