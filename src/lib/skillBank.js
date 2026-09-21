const BANK = [
  {
    group: 'js',
    skills: ['javascript', 'js', 'es6'],
    roles: ['frontend', 'fullstack', 'backend', 'software'],
    question: 'What is the difference between var, let and const in JavaScript?',
    answer:
      'var is function scoped, hoisted and initialised as undefined, and can be redeclared. let and const are block scoped and cannot be used before their declaration (the temporal dead zone). let can be reassigned, while const cannot be reassigned, although the contents of a const object can still change.',
    points: [
      { label: 'var is function scoped', any: ['function scope', 'function-scoped', 'function scoped'] },
      { label: 'let and const are block scoped', any: ['block scope', 'block-scoped', 'block scoped', 'block'] },
      { label: 'hoisting', any: ['hoist'] },
      { label: 'const cannot be reassigned', any: ['reassign', 're-assign', 'constant', 'cannot be changed'] },
    ],
  },
  {
    group: 'js2',
    skills: ['javascript', 'js', 'closure', 'async'],
    roles: ['frontend', 'fullstack', 'backend', 'software'],
    question: 'What is a closure in JavaScript, and where is it useful?',
    answer:
      'A closure is a function that remembers the variables of the scope where it was created, even after the outer function has finished running. It is used for data privacy, counters, callbacks and function factories.',
    points: [
      { label: 'remembers the outer scope', any: ['outer', 'scope', 'lexical', 'remember'] },
      { label: 'works after the outer function finishes', any: ['after', 'finished', 'returned', 'even when'] },
      { label: 'use case (privacy, counter, callback)', any: ['private', 'privacy', 'counter', 'callback', 'factory', 'encapsulat'] },
    ],
  },
  {
    group: 'react',
    skills: ['react', 'redux', 'next'],
    roles: ['frontend', 'fullstack'],
    question: 'What is the difference between props and state in React?',
    answer:
      'Props are inputs passed from a parent component to a child and are read-only. State is data owned and managed inside a component, and updating it with its setter function triggers a re-render.',
    points: [
      { label: 'props come from the parent', any: ['parent', 'passed', 'pass'] },
      { label: 'props are read-only', any: ['read only', 'read-only', 'immutable', 'cannot be changed', 'cannot be modified'] },
      { label: 'state is owned by the component', any: ['own', 'manage', 'inside', 'internal', 'local'] },
      { label: 'state update causes a re-render', any: ['re-render', 'rerender', 're render', 'render again', 'update the ui'] },
    ],
  },
  {
    group: 'react2',
    skills: ['react', 'hooks', 'useeffect'],
    roles: ['frontend', 'fullstack'],
    question: 'What does useEffect do, and what is the dependency array?',
    answer:
      'useEffect runs side effects such as data fetching, subscriptions or timers after render. The dependency array controls when it runs again: an empty array runs it once after the first render, listed values re-run it when they change, and no array runs it after every render. The cleanup function runs before the next effect or when the component unmounts.',
    points: [
      { label: 'side effects like fetching', any: ['side effect', 'fetch', 'subscription', 'api call'] },
      { label: 'dependency array', any: ['dependency', 'dependencies', 'array'] },
      { label: 'empty array runs once', any: ['once', 'mount', 'first render'] },
      { label: 'cleanup function', any: ['cleanup', 'clean up', 'unmount'] },
    ],
  },
  {
    group: 'css',
    skills: ['css', 'tailwind', 'bootstrap'],
    roles: ['frontend', 'fullstack'],
    question: 'What is the CSS box model?',
    answer:
      'Every element is a box made of content, padding, border and margin, from the inside out. With box-sizing set to border-box, the width includes the padding and border.',
    points: [
      { label: 'content', any: ['content'] },
      { label: 'padding', any: ['padding'] },
      { label: 'border', any: ['border'] },
      { label: 'margin', any: ['margin'] },
      { label: 'box-sizing: border-box', any: ['box-sizing', 'box sizing', 'border-box', 'border box'] },
    ],
  },
  {
    group: 'css',
    skills: ['css', 'flexbox', 'grid'],
    roles: ['frontend', 'fullstack'],
    question: 'What is the difference between CSS Flexbox and Grid?',
    answer:
      'Flexbox lays items out in one dimension, either a row or a column. Grid is two-dimensional and controls rows and columns together. Flexbox suits components like navbars, and Grid suits full page layouts.',
    points: [
      { label: 'flexbox is one-dimensional', any: ['one dimension', 'one-dimension', 'single dimension', 'row or a column', 'row or column', '1d'] },
      { label: 'grid is two-dimensional', any: ['two dimension', 'two-dimension', 'rows and columns', '2d'] },
      { label: 'when to use each', any: ['navbar', 'layout', 'align', 'component', 'page'] },
    ],
  },
  {
    group: 'html',
    skills: ['html', 'html5'],
    roles: ['frontend', 'fullstack'],
    question: 'What is semantic HTML and why does it matter?',
    answer:
      'Semantic HTML uses meaningful tags like header, nav, main, article, section and footer instead of generic divs. It improves accessibility for screen readers, helps SEO, and makes code easier to read and maintain.',
    points: [
      { label: 'meaningful tags (header, nav, main)', any: ['header', 'nav', 'main', 'article', 'footer', 'section', 'meaningful'] },
      { label: 'accessibility', any: ['accessib', 'screen reader'] },
      { label: 'SEO', any: ['seo', 'search engine'] },
      { label: 'readability and maintenance', any: ['readab', 'maintain', 'understand'] },
    ],
  },
  {
    group: 'node',
    skills: ['node', 'nodejs'],
    roles: ['backend', 'fullstack'],
    question: 'What is Node.js, and why is it good for handling many requests?',
    answer:
      'Node.js is a JavaScript runtime built on the V8 engine. It uses a single-threaded, event-driven, non-blocking I/O model with an event loop, so it can handle many concurrent requests without waiting on slow operations.',
    points: [
      { label: 'JavaScript runtime (V8)', any: ['runtime', 'v8'] },
      { label: 'single-threaded', any: ['single thread', 'single-thread', 'one thread'] },
      { label: 'event loop / event-driven', any: ['event loop', 'event-driven', 'event driven'] },
      { label: 'non-blocking / async I/O', any: ['non-blocking', 'non blocking', 'asynchronous', 'async'] },
    ],
  },
  {
    group: 'node',
    skills: ['express', 'middleware'],
    roles: ['backend', 'fullstack'],
    question: 'What is middleware in Express?',
    answer:
      'Middleware is a function that has access to the request, the response and the next function. Middleware runs in order between the incoming request and the final route handler. It is used for logging, authentication, parsing request bodies and error handling, and it must call next() or end the response.',
    points: [
      { label: 'access to request and response', any: ['request', 'response'] },
      { label: 'next function', any: ['next'] },
      { label: 'runs in order', any: ['order', 'sequence', 'before', 'between'] },
      { label: 'use cases (auth, logging, parsing)', any: ['authentication', 'auth', 'logging', 'parsing', 'error handling'] },
    ],
  },
  {
    group: 'sql',
    skills: ['sql', 'mysql', 'postgresql', 'postgres'],
    roles: ['backend', 'fullstack', 'data', 'software'],
    question: 'What is the difference between INNER JOIN and LEFT JOIN in SQL?',
    answer:
      'INNER JOIN returns only the rows that match in both tables. LEFT JOIN returns all rows from the left table and the matching rows from the right table, with NULL where there is no match.',
    points: [
      { label: 'inner join returns only matching rows', any: ['only matching', 'matching rows', 'both tables', 'match in both', 'matches in both'] },
      { label: 'left join keeps all left rows', any: ['all rows from the left', 'all the rows from the left', 'left table', 'all from the left'] },
      { label: 'NULL when there is no match', any: ['null', 'no match', 'not match'] },
    ],
  },
  {
    group: 'sql',
    skills: ['sql', 'database', 'dbms'],
    roles: ['backend', 'fullstack', 'data', 'software'],
    question: 'What are a primary key and a foreign key?',
    answer:
      'A primary key uniquely identifies each row in a table and cannot be null. A foreign key is a column that references the primary key of another table, which creates a relationship and enforces referential integrity.',
    points: [
      { label: 'primary key is unique', any: ['unique', 'uniquely'] },
      { label: 'primary key cannot be null', any: ['null', 'empty'] },
      { label: 'foreign key references another table', any: ['reference', 'refers', 'another table', 'other table', 'link'] },
      { label: 'relationship / integrity', any: ['integrity', 'relationship', 'consisten'] },
    ],
  },
  {
    group: 'mongo',
    skills: ['mongodb', 'mongo', 'nosql'],
    roles: ['backend', 'fullstack'],
    question: 'How is MongoDB different from a relational database?',
    answer:
      'MongoDB is a NoSQL document database that stores flexible JSON-like BSON documents in collections, with no fixed schema. Relational databases use tables with a fixed schema and joins. MongoDB scales horizontally with sharding and suits changing or nested data.',
    points: [
      { label: 'stores documents (JSON/BSON)', any: ['document', 'json', 'bson'] },
      { label: 'collections', any: ['collection'] },
      { label: 'flexible schema', any: ['schema', 'flexible', 'schemaless'] },
      { label: 'relational uses tables and joins', any: ['table', 'sql', 'join', 'relational'] },
    ],
  },
  {
    group: 'python',
    skills: ['python'],
    roles: ['backend', 'data', 'ai', 'software'],
    question: 'What is the difference between a list and a tuple in Python?',
    answer:
      'Lists are mutable, so you can change them after creation. Tuples are immutable, slightly faster, and can be used as dictionary keys. Use tuples for fixed data and lists for data that changes.',
    points: [
      { label: 'list is mutable', any: ['mutable', 'can be changed', 'can change', 'modify'] },
      { label: 'tuple is immutable', any: ['immutable', 'cannot be changed', 'cannot change', 'can not be changed'] },
      { label: 'tuple is faster or usable as a dictionary key', any: ['faster', 'key', 'hashable'] },
      { label: 'when to use each', any: ['fixed', 'constant', 'changes'] },
    ],
  },
  {
    group: 'python2',
    skills: ['python', 'flask', 'django', 'fastapi'],
    roles: ['backend', 'ai', 'software'],
    question: 'What are decorators in Python?',
    answer:
      'A decorator is a function that takes another function and returns a new function that adds behaviour, without changing the original code. It is applied with the @ syntax and is used for logging, timing, caching and authentication.',
    points: [
      { label: 'takes and returns a function', any: ['function'] },
      { label: 'adds behaviour without changing the code', any: ['behaviour', 'behavior', 'extend', 'wrap', 'add', 'modify'] },
      { label: '@ syntax', any: ['@', 'at symbol', 'at sign', 'at the rate'] },
      { label: 'use cases (logging, timing, auth)', any: ['logging', 'timing', 'authentication', 'auth', 'login', 'cach'] },
    ],
  },
  {
    group: 'ml',
    skills: ['machine learning', 'ml', 'scikit-learn', 'tensorflow', 'pytorch', 'deep learning'],
    roles: ['data', 'ai'],
    question: 'What is overfitting, and how can you prevent it?',
    answer:
      'Overfitting is when a model learns the training data, including its noise, so it performs well on training data but poorly on new data. You can prevent it with more data, cross-validation, regularisation, a simpler model, dropout and early stopping.',
    points: [
      { label: 'good on training, poor on new data', any: ['new data', 'unseen', 'test data', 'training data'] },
      { label: 'learns noise / memorises', any: ['noise', 'memor'] },
      { label: 'regularisation', any: ['regulari'] },
      { label: 'cross-validation', any: ['cross-validation', 'cross validation'] },
      { label: 'more data, dropout or early stopping', any: ['more data', 'dropout', 'early stopping', 'simpler'] },
    ],
  },
  {
    group: 'ml2',
    skills: ['machine learning', 'ml', 'data science', 'scikit-learn'],
    roles: ['data', 'ai'],
    question: 'What is the difference between supervised and unsupervised learning?',
    answer:
      'Supervised learning trains on labelled data to predict outputs, for example classification and regression. Unsupervised learning finds patterns in unlabelled data, for example clustering and dimensionality reduction.',
    points: [
      { label: 'supervised uses labelled data', any: ['label'] },
      { label: 'classification / regression', any: ['classification', 'regression'] },
      { label: 'unsupervised uses unlabelled data', any: ['unlabel', 'without label', 'no label'] },
      { label: 'clustering / dimensionality reduction', any: ['cluster', 'dimensionality'] },
    ],
  },
  {
    group: 'ds',
    skills: ['data structures', 'dsa', 'array', 'linked list', 'leetcode'],
    roles: ['software', 'backend', 'fullstack'],
    question: 'What is the difference between an array and a linked list?',
    answer:
      'An array stores elements in contiguous memory, so accessing an element by index is O(1), but inserting in the middle is costly. A linked list stores nodes connected by pointers, so insertion and deletion are O(1) once you have the node, but access by index is O(n).',
    points: [
      { label: 'array uses contiguous memory', any: ['contiguous', 'continuous'] },
      { label: 'array index access is O(1)', any: ['index', 'constant time', 'o(1)', 'o of 1', 'o of one', 'random access'] },
      { label: 'linked list uses nodes and pointers', any: ['pointer', 'node', 'next'] },
      { label: 'insertion / deletion', any: ['insert', 'delet'] },
      { label: 'linked list access is O(n)', any: ['o(n)', 'o of n', 'linear', 'traverse'] },
    ],
  },
  {
    group: 'ds2',
    skills: ['algorithms', 'data structures', 'dsa', 'leetcode', 'problem solving'],
    roles: ['software', 'backend', 'ai'],
    question: 'What is time complexity? Explain Big O with an example.',
    answer:
      'Time complexity describes how the running time of an algorithm grows with the input size. Big O notation gives the worst-case upper bound. For example, linear search is O(n), and binary search on sorted data is O(log n).',
    points: [
      { label: 'grows with input size', any: ['input size', 'grows', 'input'] },
      { label: 'Big O is the worst case / upper bound', any: ['worst', 'upper bound', 'big o'] },
      { label: 'an example (linear or binary search)', any: ['binary search', 'linear search', 'o of n', 'log n', 'o(n)'] },
    ],
  },
  {
    group: 'git',
    skills: ['git', 'github'],
    roles: ['frontend', 'fullstack', 'backend', 'data', 'ai', 'software'],
    question: 'What is the difference between git merge and git rebase?',
    answer:
      'Merge combines branches by creating a merge commit and preserves the full history. Rebase replays your commits on top of another branch, giving a linear history, but it rewrites commits, so you should not rebase shared branches.',
    points: [
      { label: 'merge creates a merge commit', any: ['merge commit', 'combine', 'preserve'] },
      { label: 'rebase replays commits on top', any: ['replay', 'on top', 'reapply', 're-apply'] },
      { label: 'linear history', any: ['linear', 'clean'] },
      { label: 'rewrites history, avoid on shared branches', any: ['rewrite', 'shared', 'public'] },
    ],
  },
  {
    group: 'rest',
    skills: ['rest', 'api', 'express', 'flask', 'django', 'fastapi'],
    roles: ['backend', 'fullstack', 'frontend'],
    question: 'What are the main HTTP methods in a REST API, and what does each do?',
    answer:
      'GET reads data, POST creates a resource, PUT replaces or updates a whole resource, PATCH updates part of it, and DELETE removes it. REST is stateless and uses status codes such as 200, 201, 404 and 500.',
    points: [
      { label: 'GET reads data', any: ['get'] },
      { label: 'POST creates', any: ['post'] },
      { label: 'PUT / PATCH update', any: ['put', 'patch', 'update'] },
      { label: 'DELETE removes', any: ['delete'] },
      { label: 'status codes', any: ['status code', '404', '200', '201', '500'] },
    ],
  },
  {
    group: 'oop',
    skills: ['java', 'c++', 'oop', 'python', 'object oriented'],
    roles: ['software', 'backend'],
    question: 'Explain the four pillars of object-oriented programming.',
    answer:
      'Encapsulation bundles data and methods and hides internal state. Abstraction exposes only the essential details. Inheritance lets a class reuse the behaviour of another class. Polymorphism lets the same interface have different implementations, for example through method overriding.',
    points: [
      { label: 'encapsulation', any: ['encapsulation'] },
      { label: 'abstraction', any: ['abstraction'] },
      { label: 'inheritance', any: ['inheritance'] },
      { label: 'polymorphism', any: ['polymorphism'] },
    ],
  },
  {
    group: 'docker',
    skills: ['docker', 'kubernetes', 'devops', 'container'],
    roles: ['backend', 'fullstack', 'software'],
    question: 'What is Docker, and why do we use containers?',
    answer:
      'Docker packages an application with its dependencies into an image that runs the same way everywhere. Containers share the host operating system kernel, so they are lighter and faster to start than virtual machines.',
    points: [
      { label: 'packages app with dependencies', any: ['dependenc', 'package'] },
      { label: 'image', any: ['image'] },
      { label: 'runs the same everywhere', any: ['everywhere', 'consistent', 'same'] },
      { label: 'lighter than virtual machines', any: ['virtual machine', 'vm', 'lightweight', 'light'] },
      { label: 'shares the host kernel', any: ['kernel', 'host'] },
    ],
  },
  {
    group: 'llm',
    skills: ['rag', 'llm', 'langchain', 'generative ai', 'chatbot'],
    roles: ['ai'],
    question: 'What is RAG (retrieval-augmented generation), and why is it useful?',
    answer:
      'RAG retrieves relevant documents from a knowledge base, usually with embeddings and a vector database, and adds them to the prompt so the LLM answers from real data. It reduces hallucinations and lets you use fresh or private data without retraining the model.',
    points: [
      { label: 'retrieves relevant documents', any: ['retriev'] },
      { label: 'embeddings / vector database', any: ['embedding', 'vector'] },
      { label: 'adds context to the prompt', any: ['prompt', 'context'] },
      { label: 'reduces hallucinations', any: ['hallucinat'] },
      { label: 'no retraining, fresh or private data', any: ['retrain', 'fine-tun', 'fine tun', 'up to date', 'private', 'latest'] },
    ],
  },
  {
    group: 'llm2',
    skills: ['nlp', 'embeddings', 'transformers', 'llm', 'rag'],
    roles: ['ai', 'data'],
    question: 'What are embeddings, and how are they used?',
    answer:
      'Embeddings are numeric vectors that represent the meaning of text, so texts with similar meanings sit close together. Cosine similarity measures how close two embeddings are, which powers semantic search and recommendations.',
    points: [
      { label: 'numeric vectors', any: ['vector', 'numbers', 'numeric'] },
      { label: 'capture meaning', any: ['meaning', 'semantic'] },
      { label: 'similar items are close', any: ['similar', 'close', 'nearby'] },
      { label: 'cosine similarity / search', any: ['cosine', 'distance', 'similarity', 'search', 'recommend'] },
    ],
  },
];

const PROJECT_Q = {
  question:
    'Tell me about a project you built. What problem did it solve, which technologies did you use, and what was the hardest challenge?',
  answer:
    'Use a clear structure. State the problem and who it was for, your role, the tech stack and why you chose it, one specific challenge and how you solved it, and the result, with a number if you can.',
  points: [
    { label: 'the problem it solved', any: ['problem', 'goal', 'purpose', 'aim'] },
    { label: 'technologies used', any: ['react', 'node', 'python', 'used', 'technolog', 'stack', 'built with'] },
    { label: 'a challenge you faced', any: ['challenge', 'difficult', 'issue', 'bug', 'hardest'] },
    { label: 'the result or impact', any: ['result', 'impact', 'outcome', 'users', 'improved', 'reduced'] },
  ],
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasTerm(text, term) {
  return new RegExp(`(^|[^a-z0-9])${escapeRegex(term)}`, 'i').test(text);
}

function roleKey(roleText) {
  const r = (roleText || '').toLowerCase();
  if (/front/.test(r)) return 'frontend';
  if (/full/.test(r)) return 'fullstack';
  if (/back/.test(r)) return 'backend';
  if (/\b(ai|ml|llm|genai|machine learning|deep learning)\b/.test(r)) return 'ai';
  if (/data/.test(r)) return 'data';
  return 'software';
}

// Pick 4 skill questions (based on the resume and role) plus 1 project question.
export function selectQuestions(roleText, resumeText, count = 5) {
  const role = roleKey(roleText);
  const text = (resumeText || '').toLowerCase();

  const ranked = BANK.map((e) => {
    let score = Math.random();
    if (e.skills.some((k) => hasTerm(text, k))) score += 3;
    if (e.roles.includes(role)) score += 2;
    return { e, score };
  }).sort((a, b) => b.score - a.score);

  const picked = [];
  const usedGroups = new Set();
  for (const { e } of ranked) {
    if (picked.length >= count - 1) break;
    if (usedGroups.has(e.group)) continue;
    usedGroups.add(e.group);
    picked.push({ question: e.question, answer: e.answer, points: e.points });
  }
  picked.push(PROJECT_Q);
  return picked;
}

// Check which key points the spoken answer covered.
export function scoreCoverage(transcript, points) {
  const text = (transcript || '').toLowerCase();
  const covered = [];
  const missed = [];
  points.forEach((p) => {
    (p.any.some((t) => hasTerm(text, t)) ? covered : missed).push(p.label);
  });
  const ratio = points.length ? covered.length / points.length : 0;
  return { covered, missed, ratio, score: Math.max(1, Math.round(ratio * 10)) };
}

// English fluency estimate from pace, fillers, repetition, variety and sentence length.
export function checkFluency(transcript, durationMs) {
  const text = (transcript || '').trim().toLowerCase();
  const words = text.match(/[a-z']+/g) || [];
  const n = words.length;
  const minutes = durationMs > 0 ? durationMs / 60000 : 0;
  const wpm = minutes > 0 ? Math.round(n / minutes) : 0;

  const fillers = (
    text.match(/\b(um+|uh+|er|erm|hmm+|you know|i mean|kind of|sort of|basically)\b/g) || []
  ).length;
  const repeats = (text.match(/\b([a-z']+)\s+\1\b/g) || []).length;
  const variety = n > 0 ? new Set(words).size / n : 0;
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const avgSentence = n / Math.max(1, sentences.length);
  const fillersPer100 = n > 0 ? (fillers / n) * 100 : 0;

  let score = 100;
  const tips = [];

  if (fillersPer100 > 2) {
    score -= Math.min(30, fillersPer100 * 6);
    tips.push('Reduce filler words (um, uh, you know). Pause silently instead.');
  }
  if (repeats >= 1) {
    score -= Math.min(15, repeats * 5);
    tips.push('You repeated some words. Take a breath and finish the thought.');
  }
  if (wpm > 0 && wpm < 90) {
    score -= Math.min(20, (90 - wpm) * 0.5);
    tips.push('You spoke slowly. Aim for 110 to 160 words per minute.');
  } else if (wpm > 180) {
    score -= Math.min(20, (wpm - 180) * 0.4);
    tips.push('You spoke very fast. Slow down so the interviewer can follow.');
  }
  if (n >= 40 && variety < 0.45) {
    score -= 10;
    tips.push('Vary your vocabulary. Try not to repeat the same words.');
  }
  if (avgSentence > 35) {
    score -= 10;
    tips.push('Use shorter sentences. Long run-on sentences are hard to follow.');
  }
  if (n < 25) {
    score -= 15;
    tips.push('Your answer was very short. Aim for 30 to 60 seconds.');
  }
  if (tips.length === 0) tips.push('Good pace and clean delivery. Keep it up.');

  score = Math.max(0, Math.min(100, Math.round(score)));
  const label = score >= 80 ? 'Fluent' : score >= 60 ? 'Good, some hesitation' : 'Needs practice';

  return {
    score,
    label,
    wpm,
    fillers,
    repeats,
    variety: Math.round(variety * 100),
    avgSentence: Math.round(avgSentence),
    tips,
    tooShort: n < 25,
  };
}