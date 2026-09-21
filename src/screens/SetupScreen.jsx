import { useState, useRef } from 'react';
import ProgressBar from '../components/ProgressBar.jsx';
import { reviewResume } from '../lib/resumeReview.js';

function DeviceBadge({ device }) {
  if (!device) return null;
  const icon  = device === 'webgpu' ? '⚡' : device === 'webspeech' ? '🔊' : '🧩';
  const label = device === 'webgpu' ? 'WebGPU' : device === 'webspeech' ? 'Web Speech' : 'WASM';
  return (
    <span className="badge" style={{ fontSize: '0.7rem' }}>
      {icon} {label}
    </span>
  );
}

export default function SetupScreen({
  onStart,
  onStartFallback,
  llmLoading,
  llmProgress,
  llmText,
  llmDevice,
  activeModel,
  llmError,
  onRetryLLM,
  isGeneratingQs,
  whisperLoading,
  whisperDevice,
  whisperReady,
  usingFallback,
  // OCR props
  onScanImage,
  isScanning,
  ocrProgress,
  ocrStatus,
  ocrError,
  extractedProjects,
  extractedSkills,
}) {
  const [role, setRole] = useState('');
  const [resume, setResume] = useState('');
  const [review, setReview] = useState(null);
  const fileInputRef = useRef(null);

  const canStart = role.trim().length > 0 && !isGeneratingQs && !isScanning;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await onScanImage(file);
      if (text) {
        setResume((prev) => (prev ? `${prev}\n\n${text}` : text));
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      // Reset input so same file can be re-scanned if needed
      e.target.value = '';
    }
  };

  const handleReview = () => {
    setReview(reviewResume(resume, role));
  };

  return (
    <div className="screen">
      {/* Hidden file input for camera/photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="app-header">
        <span className="app-logo">🎙</span>
        <h1>InterviewLens</h1>
      </div>

      <p className="text-muted text-sm">
        AI mock interviews — entirely in your browser. Private, fast, and runs locally.
      </p>

      {/* Model status cards */}
      <div className="card flex-col" style={{ gap: 14 }}>
        {/* LLM Status */}
        <div className="flex-col" style={{ gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-sm bold">🤖 Question & Evaluation AI</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {llmDevice && <DeviceBadge device={llmDevice} />}
              {llmLoading ? (
                <span className="text-muted text-sm">loading…</span>
              ) : llmError ? (
                <span className="danger text-sm bold">⚠ Offline</span>
              ) : (
                <span className="success text-sm bold">✓ ready</span>
              )}
            </div>
          </div>

          <ProgressBar
            value={llmError ? 0 : llmLoading ? llmProgress : 100}
            label={
              llmError
                ? 'AI unavailable'
                : llmLoading
                ? `${llmText || 'Downloading model...'} (${llmProgress}%)`
                : `${activeModel || 'Llama-3.2-1B'} ready`
            }
          />

          {llmError && (
            <div
              style={{
                background: 'rgba(240, 82, 82, 0.12)',
                border: '1px solid rgba(240, 82, 82, 0.3)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                marginTop: 4,
              }}
            >
              <div style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: 4 }}>
                ⚠ AI Model Notice:
              </div>
              <div className="text-muted" style={{ marginBottom: 8 }}>
                {llmError}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  style={{ minHeight: 32, padding: '4px 12px', fontSize: '0.8rem', width: 'auto' }}
                  onClick={onRetryLLM}
                >
                  🔄 Retry AI Download
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Whisper Status */}
        <div className="flex-col" style={{ gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-sm bold">🎤 Speech-to-Text</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {whisperDevice && <DeviceBadge device={whisperDevice} />}
              {usingFallback ? (
                <span className="text-muted text-sm">Web Speech API</span>
              ) : whisperReady ? (
                <span className="success text-sm bold">✓ ready</span>
              ) : (
                <span className="text-muted text-sm">loading…</span>
              )}
            </div>
          </div>
          <ProgressBar
            value={whisperReady ? 100 : 0}
            label={
              usingFallback
                ? 'Using browser native Web Speech API'
                : whisperReady
                ? 'Whisper Tiny ready'
                : 'Loading speech model...'
            }
          />
        </div>
      </div>

      {/* Role & Resume input */}
      <div className="card flex-col">
        <div>
          <label htmlFor="role">Target Role</label>
          <input
            id="role"
            type="text"
            placeholder='e.g. "Frontend Engineer", "Full Stack Developer", "Data Scientist"'
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isGeneratingQs || isScanning}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label htmlFor="resume" style={{ margin: 0 }}>
              Resume Experience
            </label>
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                minHeight: 32,
                padding: '4px 10px',
                fontSize: '0.78rem',
                width: 'auto',
                display: 'inline-flex',
                gap: 4,
              }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning || isGeneratingQs}
            >
              📷 {isScanning ? 'Scanning...' : 'Scan Resume (Camera/Image)'}
            </button>
          </div>

          {/* OCR Progress Indicator */}
          {isScanning && (
            <div
              style={{
                background: 'color-mix(in srgb, var(--accent) 10%, var(--surface-2))',
                border: '1px solid var(--border)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>🔍 {ocrStatus || 'Scanning resume with OCR...'}</span>
                <span>{ocrProgress}%</span>
              </div>
              <ProgressBar value={ocrProgress} />
            </div>
          )}

          {ocrError && (
            <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: 6 }}>
              ⚠ {ocrError}
            </div>
          )}

          <textarea
            id="resume"
            rows={5}
            placeholder="Paste your resume or click 'Scan Resume' to capture it with your camera. You can edit any text directly here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            disabled={isGeneratingQs || isScanning}
          />
          <div className="text-muted text-sm" style={{ fontSize: '0.75rem', marginTop: 4 }}>
            💡 Feel free to edit or correct any OCR typos in the box above.
          </div>

          {/* Review button */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: 10 }}
            disabled={resume.trim().length < 20 || isScanning || isGeneratingQs}
            onClick={handleReview}
          >
            📝 Review My Resume{role.trim() ? ` for ${role.trim()}` : ''}
          </button>
        </div>

        {/* Resume review results */}
        {review && (
          <div
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ fontWeight: 700 }}>📝 Resume Review</div>

            <div>{review.verdict}</div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Fit for {review.targetRole}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{review.fit}%</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Resume completeness</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{review.completeness}%</div>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Best-fit roles for your resume</div>
              {review.bestRoles.map((r) => (
                <div key={r.role}>
                  • {r.role}: {r.fit}%
                </div>
              ))}
            </div>

            {review.matched.length > 0 && (
              <div>
                <span style={{ fontWeight: 600 }}>✅ Skills found: </span>
                <span>{review.matched.join(', ')}</span>
              </div>
            )}

            {review.missing.length > 0 && (
              <div>
                <span style={{ fontWeight: 600 }}>➕ Consider adding: </span>
                <span>{review.missing.join(', ')}</span>
              </div>
            )}

            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Checklist</div>
              {review.checks.map((c) => (
                <div key={c.label}>
                  {c.ok ? '✅' : '⚠️'} {c.label}
                  {!c.ok && <div className="text-muted" style={{ marginLeft: 22 }}>{c.tip}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Projects & Skills Preview */}
        {((extractedProjects && extractedProjects.length > 0) || (extractedSkills && extractedSkills.length > 0)) && (
          <div
            style={{
              background: 'var(--surface-2)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--accent-light)' }}>
              🎯 AI Detected Projects & Skills:
            </div>
            {extractedProjects && extractedProjects.length > 0 && (
              <div>
                <span className="text-muted">Projects: </span>
                <span>{extractedProjects.join(', ')}</span>
              </div>
            )}
            {extractedSkills && extractedSkills.length > 0 && (
              <div>
                <span className="text-muted">Skills: </span>
                <span>{extractedSkills.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex-col" style={{ gap: 10, marginTop: 4 }}>
          {/* Primary start button */}
          <button
            className="btn btn-primary"
            disabled={!canStart}
            onClick={() => onStart(role.trim(), resume.trim())}
          >
            {isGeneratingQs ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#fff' }} />
                Extracting projects & generating questions…
              </>
            ) : llmLoading ? (
              '🚀 Start Interview (Auto-Fallback if Loading)'
            ) : resume.trim().length > 0 ? (
              '🚀 Start Project-Tailored Interview'
            ) : (
              '🚀 Start Interview'
            )}
          </button>

          {/* Quick start with standard questions button */}
          <button
            className="btn btn-secondary"
            disabled={role.trim().length === 0}
            onClick={() => onStartFallback(role.trim())}
            title="Starts immediately using built-in interview questions without waiting for AI download"
          >
            ⚡ Start Immediately (Standard Questions)
          </button>
        </div>
      </div>

      {/* Info footer */}
      <div className="card text-sm text-muted flex-col" style={{ gap: 8 }}>
        <p>🔒 <strong>Client-side:</strong> Camera images and resume text never leave your device.</p>
        <p>⚡ <strong>Acceleration:</strong> Uses WebGPU when supported, with automatic WebAssembly & Speech API fallbacks.</p>
      </div>
    </div>
  );
}