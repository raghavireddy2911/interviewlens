/**
 * InterviewScreen.jsx
 *
 * Displays one interview question at a time.
 * Features:
 *   - Big animated record button.
 *   - Live microphone volume meter & recording duration timer.
 *   - Audio playback player for the recorded answer.
 *   - Warning banner if under 5 words ("We couldn't hear you, please try again.").
 *   - Live transcript preview.
 */

import RecordButton from '../components/RecordButton.jsx';

export default function InterviewScreen({
  questions,
  currentIndex,
  isRecording,
  isTranscribing,
  transcript,
  recordingSeconds,
  volume,
  audioUrl,
  tooShortWarning,
  whisperReady,
  usingFallback,
  onStartRecording,
  onStopRecording,
}) {
  const question = questions[currentIndex] ?? '(No question found)';
  const total = questions.length;

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="screen">
      {/* Header */}
      <div className="app-header">
        <span className="app-logo">🎙</span>
        <h1>InterviewLens</h1>
        <span className="badge" style={{ marginLeft: 'auto' }}>
          Q {currentIndex + 1}/{total}
        </span>
      </div>

      {/* Progress dots */}
      <div className="q-dots">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`q-dot ${i === currentIndex ? 'active' : i < currentIndex ? 'done' : ''}`}
          />
        ))}
      </div>

      {/* Question */}
      <div className="card">
        <p className="text-muted text-sm" style={{ marginBottom: 8 }}>
          Question {currentIndex + 1}
        </p>
        <h2 style={{ lineHeight: 1.45 }}>{question}</h2>
      </div>

      {/* Record area */}
      <div className="card flex-col" style={{ alignItems: 'center', gap: 16 }}>
        {!whisperReady ? (
          <div className="flex-col" style={{ alignItems: 'center', gap: 10 }}>
            <span className="spinner" />
            <p className="text-muted text-sm">Loading speech model…</p>
          </div>
        ) : (
          <>
            <RecordButton
              isRecording={isRecording}
              disabled={isTranscribing}
              onStart={onStartRecording}
              onStop={onStopRecording}
            />

            {/* Live recording timer & volume level */}
            {isRecording && (
              <div
                style={{
                  width: '100%',
                  maxWidth: 260,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>🎙 Mic Volume</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>
                    ⏱ {formatTimer(recordingSeconds)}
                  </span>
                </div>
                <div className="progress-bar-wrap" style={{ height: 6 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${volume}%`,
                      background:
                        volume > 75
                          ? 'var(--danger)'
                          : volume > 20
                          ? 'var(--success)'
                          : 'var(--accent)',
                      transition: 'width 0.1s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {usingFallback && !isRecording && (
              <span className="badge" style={{ fontSize: '0.7rem' }}>
                🔊 Web Speech API
              </span>
            )}
          </>
        )}

        {/* Short or empty transcript warning */}
        {tooShortWarning && (
          <div
            style={{
              background: 'rgba(240, 82, 82, 0.12)',
              border: '1px solid rgba(240, 82, 82, 0.35)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
              color: 'var(--danger)',
              fontWeight: 600,
              fontSize: '0.92rem',
              width: '100%',
            }}
          >
            We couldn't hear you, please try again.
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                fontWeight: 400,
                marginTop: 4,
              }}
            >
              Please speak clearly for at least a few sentences (minimum 5 words) before tapping stop.
            </div>
          </div>
        )}

        {/* Playback player for recorded audio */}
        {audioUrl && !isRecording && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              background: 'var(--surface-2)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>🎧 Playback recorded answer:</span>
              <span>Length: {formatTimer(recordingSeconds)}</span>
            </div>
            <audio controls src={audioUrl} style={{ width: '100%', height: 36 }} />
          </div>
        )}

        {/* Transcript Box */}
        {(isTranscribing || transcript) && (
          <div style={{ width: '100%' }}>
            <label style={{ marginBottom: 8 }}>Your answer transcript</label>
            {isTranscribing ? (
              <div
                className="transcript-box"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: 'var(--text-muted)',
                }}
              >
                <span className="spinner" />
                {usingFallback ? 'Listening with Web Speech...' : 'Transcribing with Whisper...'}
              </div>
            ) : (
              <div className="transcript-box">{transcript || '—'}</div>
            )}
          </div>
        )}
      </div>

      {/* Helper hint */}
      <p className="text-muted text-sm text-center">
        {isRecording
          ? '🔴 Recording in progress. Tap stop when you finish your answer.'
          : isTranscribing
          ? '⏳ Decoding audio and transcribing speech...'
          : 'Tap the microphone, speak your answer in full, then tap stop.'}
      </p>
    </div>
  );
}
