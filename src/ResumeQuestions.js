export function buildQuestionPrompt(role, resumeText) {
  return `You are an interviewer for a ${role} internship. Candidate resume text:
"""
${resumeText.slice(0, 1500)}
"""
Write 5 interview questions: 3 about specific projects or skills named in the resume, and 2 general ones. Return ONLY a JSON array of 5 strings, with no other text.`;
}

export function parseQuestions(raw, fallback) {
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    const arr = JSON.parse(match[0]);
    if (Array.isArray(arr) && arr.length) return arr.map(String).slice(0, 5);
  } catch (e) {}
  return fallback; // your fixed question bank
}