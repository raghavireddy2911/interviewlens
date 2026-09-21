/**
 * ProgressBar.jsx — Model download progress bar.
 * Props: value (0-100), label (string)
 */
export default function ProgressBar({ value = 0, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="text-muted text-sm">{label}</span>
          <span className="text-muted text-sm bold">{value}%</span>
        </div>
      )}
      <div className="progress-bar-wrap">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

