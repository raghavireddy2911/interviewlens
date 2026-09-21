/**
 * ScoreCard.jsx
 * Props: label (string), value (number 1-10), colorByValue (bool)
 */

function scoreColor(v) {
  if (v >= 8) return 'var(--success)';
  if (v >= 5) return 'var(--accent)';
  return 'var(--danger)';
}

export default function ScoreCard({ label, value }) {
  return (
    <div className="score-card">
      <div className="score-val" style={{ color: scoreColor(value) }}>
        {value}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/10</span>
      </div>
      <div className="score-label">{label}</div>
    </div>
  );
}

