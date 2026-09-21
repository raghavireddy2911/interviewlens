// src/components/ExtraFeedback.jsx
// Shows the model answer, key-point check and English fluency under the feedback screen.

export default function ExtraFeedback({ modelAnswer, coverage, fluency }) {
  if (!fluency) return null;

  const color =
    fluency.score >= 80 ? '#22c55e' : fluency.score >= 60 ? '#f59e0b' : '#f05252';

  return (
    <div className="screen" style={{ minHeight: 'auto', paddingTop: 0, gap: 16 }}>
      {modelAnswer && (
        <div className="card flex-col" style={{ gap: 10, fontSize: '0.88rem' }}>
          <div style={{ fontWeight: 700 }}>✅ Model answer</div>
          <div>{modelAnswer}</div>

          {coverage && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Key points you covered: {coverage.covered.length} of{' '}
                {coverage.covered.length + coverage.missed.length}
              </div>
              {coverage.covered.map((p) => (
                <div key={p}>✅ {p}</div>
              ))}
              {coverage.missed.map((p) => (
                <div key={p}>❌ {p}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card flex-col" style={{ gap: 10, fontSize: '0.88rem' }}>
        <div style={{ fontWeight: 700 }}>🗣 English fluency</div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color }}>{fluency.score}/100</span>
          <span>{fluency.label}</span>
        </div>

        <div className="text-muted">
          {fluency.wpm > 0 && <>Pace: {fluency.wpm} words/min · </>}
          Fillers: {fluency.fillers} · Repeated words: {fluency.repeats} · Vocabulary variety:{' '}
          {fluency.variety}%
        </div>

        <div>
          {fluency.tips.map((t) => (
            <div key={t}>💡 {t}</div>
          ))}
        </div>

        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          This checks pace, fillers, repetition, variety and sentence length. Speech-to-text may
          auto-correct grammar, so it cannot catch every grammar mistake.
        </div>
      </div>
    </div>
  );
}