/**
 * prompts.js
 *
 * System and user prompts for WebLLM:
 *   - Resume scanning: extracts skills and projects into strict JSON.
 *   - Project-centric interview question generation.
 *   - Chain-of-Thought "reason" scoring with placeholder-only schema.
 */

export const SYSTEM_INTERVIEW =
  'You are an expert, objective hiring interviewer. Evaluate candidate answers critically and fairly. Always return ONLY raw JSON, with no markdown code blocks or surrounding text.';

/**
 * Parse scanned or pasted resume text into projects and skills.
 */
export function parseResumePrompt(resumeText) {
  const safeResume = resumeText.slice(0, 1500);
  return (
    `Analyze this candidate resume:\n"""\n${safeResume}\n"""\n\n` +
    `Extract the candidate's key projects and top technical skills.\n` +
    `Return ONLY a single valid JSON object following this exact format:\n` +
    `{\n` +
    `  "projects": ["<Project 1 title or description>", "<Project 2 title or description>"],\n` +
    `  "skills": ["<Skill 1>", "<Skill 2>", "<Skill 3>"]\n` +
    `}`
  );
}

/**
 * Generate 5 interview questions: mostly about candidate's projects, plus general role ones.
 */
export function generateQuestionsPrompt(role, resume, parsedResume = null) {
  const projects = parsedResume?.projects || [];
  const skills = parsedResume?.skills || [];

  let background = '';
  if (projects.length > 0 || skills.length > 0) {
    background =
      (projects.length > 0 ? `\nCandidate Projects:\n- ${projects.join('\n- ')}\n` : '') +
      (skills.length > 0 ? `\nCandidate Skills: ${skills.join(', ')}\n` : '');
  } else if (resume) {
    background = `\nCandidate Background Excerpt: ${resume.slice(0, 600)}\n`;
  }

  return (
    `Target Role: "${role}"${background}\n` +
    `Generate exactly 5 interview questions for this candidate.\n` +
    `Requirement: Focus at least 3 questions specifically on the candidate's own projects and tools listed above, and the remaining 2 on behavioral/role expertise.\n` +
    `Return ONLY a JSON array of 5 strings:\n` +
    `["<Question 1>", "<Question 2>", "<Question 3>", "<Question 4>", "<Question 5>"]`
  );
}

/**
 * Score a spoken answer.
 * Writes "reason" before the scores so the model reasons before assigning numbers.
 * Uses placeholder-only schema with no numbers for the model to copy.
 */
export function scoreAnswerPrompt(question, answer, role) {
  const safeAnswer = answer.length > 500 ? answer.slice(0, 500) + '…' : answer;

  return (
    `Job Role: "${role}"\n` +
    `Interview Question: "${question}"\n` +
    `Candidate Spoken Answer: "${safeAnswer}"\n\n` +
    `Carefully evaluate the spoken answer above.\n` +
    `First analyze the answer's strengths and weaknesses in "reason", then assign clarity and relevance scores from 1 (poor) to 10 (exceptional), followed by one actionable improvement tip.\n\n` +
    `Return ONLY a single valid JSON object following this exact structure with no extra text:\n` +
    `{\n` +
    `  "reason": "<one or two sentences critically analyzing the spoken answer>",\n` +
    `  "clarity": <integer between 1 and 10>,\n` +
    `  "relevance": <integer between 1 and 10>,\n` +
    `  "tip": "<one direct coaching sentence for next time>"\n` +
    `}`
  );
}

export const RETRY_SUFFIX =
  '\n\nYour previous response was invalid. Output ONLY the raw JSON object starting with { and ending with }.';

export function buildMessages(userPrompt, systemPrompt = SYSTEM_INTERVIEW) {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userPrompt },
  ];
}
