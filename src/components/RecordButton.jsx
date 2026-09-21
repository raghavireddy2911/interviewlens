/**
 * RecordButton.jsx
 *
 * Big animated microphone button.
 * Props:
 *   isRecording   — bool
 *   disabled      — bool
 *   onStart       — () => void
 *   onStop        — () => void
 */
export default function RecordButton({ isRecording, disabled, onStart, onStop }) {
  const handleClick = () => {
    if (disabled) return;
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div className="record-btn-wrap">
      <button
        className={`record-btn ${isRecording ? 'recording' : ''}`}
        onClick={handleClick}
        disabled={disabled}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? '⏹' : '🎙'}
      </button>
      <span className="record-label">
        {isRecording ? 'Recording — tap to stop' : 'Tap to record'}
      </span>
    </div>
  );
}

