/**
 * analytics.js
 * Pure JS helpers — no external deps.
 */

const FILLER_RE = /\b(um+|uh+|like|you\s+know|so|basically|literally|actually|right)\b/gi;

/**
 * Count filler-word occurrences in a transcript string.
 * Returns { count, words: string[] }
 */
export function computeFillerWords(transcript) {
  if (!transcript) return { count: 0, words: [] };
  const matches = transcript.match(FILLER_RE) || [];
  return {
    count: matches.length,
    words: [...new Set(matches.map((w) => w.toLowerCase().replace(/\s+/, ' ')))],
  };
}

/**
 * Compute words-per-minute given transcript text and duration in milliseconds.
 */
export function computeWPM(transcript, durationMs) {
  if (!transcript || !durationMs || durationMs <= 0) return 0;
  const words = transcript.trim().split(/\s+/).filter(Boolean).length;
  const minutes = durationMs / 60_000;
  return Math.round(words / minutes);
}

/**
 * Provide sensible heuristic scores and advice when LLM is offline.
 */
export function computeHeuristicFeedback(transcript, fillerCount = 0, wpm = 0) {
  const words = transcript ? transcript.trim().split(/\s+/).filter(Boolean).length : 0;

  // Clarity score based on length and fillers
  let clarity = 7;
  if (words < 10) clarity = 4;
  else if (words >= 30 && fillerCount <= 2) clarity = 9;
  else if (fillerCount > 5) clarity = Math.max(3, 7 - Math.floor(fillerCount / 2));

  // Relevance score estimated from length and pacing
  let relevance = 7;
  if (words < 15) relevance = 4;
  else if (words >= 40) relevance = 8;

  // Personalized tip based on speaking pace and filler words
  let tip = 'Good answer! Keep structuring your thoughts with the STAR method.';
  if (words < 15) {
    tip = 'Try expanding your response with specific examples and outcome metrics.';
  } else if (fillerCount > 4) {
    tip = `Pause silently instead of using filler words like "${fillerCount > 0 ? 'um/like' : ''}".`;
  } else if (wpm > 160) {
    tip = 'Your pacing was slightly hurried; try taking measured breaths between sentences.';
  } else if (wpm > 0 && wpm < 90) {
    tip = 'Try speaking with a bit more momentum to keep your interviewer engaged.';
  }

  return { clarity, relevance, tip };
}

