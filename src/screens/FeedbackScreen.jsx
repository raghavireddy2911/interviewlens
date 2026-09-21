/**
 * FeedbackScreen.jsx
 *
 * Displays AI feedback:
 *   - Model's analytical reason written before scoring.
 *   - Clarity and Relevance scores (1-10).
 *   - Concrete coaching tip.
 *   - Audio playback of candidate's spoken answer.
 *   - On-screen debug panel displaying raw LLM output and pipeline info.
 */

import ScoreCard from '../components/ScoreCard.jsx';

export default function FeedbackScreen({
  question,
  transcript,
  audioUrl,
  feedback,
  fillerData,
  wpm,
  isScoring,
  currentIndex,
  totalQuestions,
  usedFallbackQs,
  rawLLMOutput,
  evaluationMode,
  onNext,
  onFinish,
}) {
  const isLastQuestion = currentIndex >= totalQuestions - 1;

  return (
    <div className="screen">
      {/* Header */}
      <div className="app-header">
        <span className="app-logo">🎙</span>
        <h1>InterviewLens</h1>
        <span className="badge" style={{ marginLeft: 'auto' }}>
          Q {currentIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* Question recap */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p className="text-muted text-sm">Question asked</p>
          {usedFallbackQs && <span className="badge" style={{ fontSize: '0.65rem' }}>Standard Question</span>}
        </div>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{question}</p>
      </div>

      {/* Scores & Reason */}
      {isScoring ? (
        <div className="card flex-col" style={{ alignItems: 'center', gap: 12 }}>
          <span className="spinner" />
          <p className="text-muted text-sm">Analysing your spoken answer with AI...</p>
        </div>
      ) : feedback ? (
        <>
          {/* Reason written by the model before scores */}
          {feedback.reason && (
            <div
              className="card"
              style={{
                background: 'var(--surface-2)',
                borderLeft: '4px solid var(--accent)',
                padding: '14px 16px',
              }}
            >
              <div className="text-muted text-sm" style={{ fontWeight: 600, marginBottom: 4 }}>
                Evaluator Analysis:
              </div>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>{feedback.reason}</p>
            </div>
          )}

          <div className="score-grid">
            <ScoreCard label="Clarity" value={feedback.clarity} />
            <ScoreCard label="Relevance" value={feedback.relevance} />
          </div>

          {/* Improvement Tip */}
          <div className="tip-box">
            <span className="tip-icon">💡</span>
            <span className="tip-text">{feedback.tip}</span>
          </div>
        </>
      ) : (
        <div className="card">
          <p className="text-muted text-sm">Feedback unavailable. Please try again.</p>
        </div>
      )}

      {/* Analytics */}
      <div className="stat-row">
        <div className="stat-chip">
          <div className="val" style={{ color: fillerData.count > 5 ? 'var(--warn)' : 'var(--text)' }}>
            {fillerData.count}
          </div>
          <div className="stat-label">Filler Words</div>
          {fillerData.words.length > 0 && (
            <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: 4 }}>
              {fillerData.words.join(', ')}
            </div>
          )}
        </div>
        <div className="stat-chip">
          <div
            className="val"
            style={{
              color: wpm > 165 ? 'var(--warn)' : wpm > 0 && wpm < 85 ? 'var(--warn)' : 'var(--text)',
            }}
          >
            {wpm || '—'}
          </div>
          <div className="stat-label">Words / Min</div>
          <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: 4 }}>
            {wpm > 165 ? 'A bit fast' : wpm > 0 && wpm < 85 ? 'A bit slow' : wpm > 0 ? 'Good pace' : ''}
          </div>
        </div>
      </div>

      {/* Spoken Answer & Playback */}
      {transcript && (
        <div className="card flex-col" style={{ gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ margin: 0 }}>Your answer transcript</label>
            <span className="text-muted text-sm">
              {transcript.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <div className="transcript-box">{transcript}</div>
          {audioUrl && (
            <div style={{ marginTop: 4 }}>
              <audio controls src={audioUrl} style={{ width: '100%', height: 36 }} />
            </div>
          )}
        </div>
      )}

      {/* On-screen Developer Debug Panel */}
      <div
        className="card"
        style={{
          background: 'var(--surface-2)',
          border: '1px dashed var(--border)',
          padding: '12px 14px',
        }}
      >
        <details>
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              userSelect: 'none',
            }}
          >
            🛠 On-Screen Debug Panel (Raw LLM Output & Pipeline)
          </summary>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div>Evaluation Engine: <strong>{evaluationMode || 'LLM'}</strong></div>
              <div>Raw Output Status: {rawLLMOutput ? 'Received' : 'Empty / Fallback'}</div>
            </div>
            <div>
              <span className="text-muted text-sm" style={{ fontSize: '0.75rem' }}>Raw LLM Response:</span>
              <pre
                style={{
                  background: 'var(--bg)',
                  padding: 8,
                  borderRadius: 'var(--radius-sm)',
                  overflowX: 'auto',
                  fontSize: '0.75rem',
                  marginTop: 4,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'var(--text)',
                }}
              >
                {rawLLMOutput || '(No raw LLM output recorded)'}
              </pre>
            </div>
          </div>
        </details>
      </div>

      {/* CTA buttons */}
      <div className="flex-col mt-auto" style={{ gap: 10 }}>
        {!isLastQuestion ? (
          <>
            <button className="btn btn-primary" onClick={onNext} disabled={isScoring}>
              Next Question →
            </button>
            <button className="btn btn-secondary" onClick={onFinish} disabled={isScoring}>
              Finish Early
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={onFinish} disabled={isScoring}>
            🎉 Finish Interview
          </button>
        )}
      </div>
    </div>
  );
}
