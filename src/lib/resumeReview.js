const ROLE_SKILLS = {
  'Frontend Developer': [
    'html', 'css', 'javascript', 'react', 'typescript', 'tailwind',
    'responsive', 'redux', 'next', 'git', 'figma', 'api',
  ],
  'Full Stack Developer': [
    'react', 'node', 'express', 'mongodb', 'sql', 'javascript',
    'rest', 'api', 'git', 'html', 'css', 'postgresql', 'docker',
  ],
  'Backend Developer': [
    'node', 'express', 'python', 'java', 'sql', 'mongodb', 'rest',
    'api', 'docker', 'postgresql', 'authentication', 'git', 'redis',
  ],
  'Data Scientist': [
    'python', 'pandas', 'numpy', 'scikit-learn', 'machine learning',
    'statistics', 'sql', 'matplotlib', 'tensorflow', 'pytorch',
    'data analysis', 'jupyter',
  ],
  'AI/ML Engineer': [
    'python', 'machine learning', 'deep learning', 'tensorflow', 'pytorch',
    'nlp', 'llm', 'langchain', 'rag', 'transformers', 'scikit-learn', 'opencv',
  ],
  'Software Engineer': [
    'data structures', 'algorithms', 'java', 'python', 'c++', 'git',
    'oop', 'sql', 'problem solving', 'leetcode', 'system design', 'testing',
  ],
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasKeyword(text, kw) {
  const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(kw)}(\\.?js)?([^a-z0-9]|$)`, 'i');
  return re.test(text);
}

function pickRole(roleText) {
  const r = (roleText || '').toLowerCase();
  if (/front/.test(r)) return 'Frontend Developer';
  if (/full/.test(r)) return 'Full Stack Developer';
  if (/back/.test(r)) return 'Backend Developer';
  if (/\b(ai|ml|llm|machine learning|deep learning)\b/.test(r)) return 'AI/ML Engineer';
  if (/data/.test(r)) return 'Data Scientist';
  return 'Software Engineer';
}

function matchRole(text, role) {
  const skills = ROLE_SKILLS[role];
  const matched = skills.filter((k) => hasKeyword(text, k));
  const missing = skills.filter((k) => !hasKeyword(text, k));
  const fit = Math.round((matched.length / skills.length) * 100);
  return { role, fit, matched, missing };
}

export function reviewResume(resumeText, roleText) {
  const text = (resumeText || '').toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // 1. Completeness checklist
  const checks = [
    {
      label: 'Contact details (email or phone)',
      ok: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(text) || /\b\d{10}\b/.test(text.replace(/[\s-]/g, '')),
      tip: 'Add your email and phone number.',
    },
    {
      label: 'Education',
      ok: /(b\.?\s?tech|bachelor|education|university|college|cgpa|gpa)/.test(text),
      tip: 'Add an Education section with degree, college and CGPA.',
    },
    {
      label: 'Skills section',
      ok: /skills/.test(text),
      tip: 'Add a Skills section listing your technologies.',
    },
    {
      label: 'Projects',
      ok: /project/.test(text),
      tip: 'Add 2-3 projects with what you built and the tech used.',
    },
    {
      label: 'GitHub or LinkedIn link',
      ok: /(github|linkedin)/.test(text),
      tip: 'Add your GitHub and LinkedIn links.',
    },
    {
      label: 'Internship, certificates or achievements',
      ok: /(intern|experience|certif|hackathon|achievement|award)/.test(text),
      tip: 'Add certificates, hackathons or achievements.',
    },
    {
      label: 'Measurable results (numbers)',
      ok: /\d+\s?(%|\+|x\b|users|students|ms\b)/.test(text),
      tip: 'Add numbers, e.g. "reduced load time by 30%" or "used by 50 students".',
    },
    {
      label: 'Enough detail (150+ words)',
      ok: wordCount >= 150,
      tip: 'Your resume looks short. Add more detail about your projects.',
    },
  ];

  const passed = checks.filter((c) => c.ok).length;
  const completeness = Math.round((passed / checks.length) * 100);

  // 2. Fit for the target role
  const targetRole = pickRole(roleText);
  const target = matchRole(text, targetRole);

  // 3. Best-fit roles across all roles
  const bestRoles = Object.keys(ROLE_SKILLS)
    .map((r) => matchRole(text, r))
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 3)
    .map((r) => ({ role: r.role, fit: r.fit }));

  // 4. Verdict
  let verdict;
  if (target.fit >= 60 && completeness >= 70) {
    verdict = `Good to go for ${targetRole}. Your resume matches this role well.`;
  } else if (target.fit >= 35) {
    verdict = `Partly ready for ${targetRole}. Add the missing skills and fix the gaps below.`;
  } else {
    verdict = `Not a strong match for ${targetRole} yet. Check the best-fit roles below, or add the missing skills.`;
  }

  return {
    targetRole,
    fit: target.fit,
    matched: target.matched,
    missing: target.missing,
    completeness,
    checks,
    bestRoles,
    verdict,
  };
}