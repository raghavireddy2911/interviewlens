/**
 * fallbackQuestions.js
 *
 * 15 well-rounded interview questions used when the LLM fails to generate
 * or is still loading. Randomly sampled to 5 per session.
 */

export const FALLBACK_QUESTIONS = [
  'Tell me about yourself and what drew you to this role.',
  'Describe a challenging project you worked on. What was your contribution?',
  'How do you prioritise tasks when you have multiple deadlines?',
  'Give an example of when you had to learn a new skill quickly.',
  'Describe a time you disagreed with a teammate. How did you resolve it?',
  'What is your approach to debugging a problem you\'ve never seen before?',
  'Walk me through how you would explain a complex technical idea to a non-technical stakeholder.',
  'Tell me about a time you received critical feedback. How did you respond?',
  'How do you stay up to date with trends and new tools in your field?',
  'Describe a situation where you had to work with incomplete information.',
  'What does a productive working day look like for you?',
  'Tell me about a goal you set and how you achieved it.',
  'How do you handle working under pressure or tight deadlines?',
  'Describe a project where you took initiative beyond your core responsibilities.',
  'Where do you see yourself in three years, and how does this role help you get there?',
];

/**
 * Return `count` questions picked randomly from the fallback list.
 * @param {number} count
 * @returns {string[]}
 */
export function sampleFallbackQuestions(count = 5) {
  const shuffled = [...FALLBACK_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
