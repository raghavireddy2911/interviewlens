/**
 * whisper.worker.js  (optimized)
 *
 * Runs transformers.js Whisper pipeline inside a Web Worker.
 * Now probes for WebGPU first and falls back to WASM automatically.
 *
 * Messages IN  (from main thread):
 *   { type: 'load' }
 *   { type: 'transcribe', audio: Float32Array, sampleRate: number }
 *
 * Messages OUT (to main thread):
 *   { type: 'loading', device: 'webgpu'|'wasm' }
 *   { type: 'progress', progress: object }
 *   { type: 'ready',   device: string }
 *   { type: 'result',  text: string, chunks: Array }
 *   { type: 'error',   message: string }
 */

import { pipeline, env } from '@huggingface/transformers';

// Let transformers.js cache models in the browser's OPFS / Cache API
env.allowLocalModels = false;
env.useBrowserCache  = true;

let transcriber = null;
let activeDevice = 'wasm';

// ─── WebGPU probe ──────────────────────────────────────────────────────────
async function detectDevice() {
  try {
    if (typeof navigator === 'undefined' || !navigator.gpu) return 'wasm';
    const adapter = await navigator.gpu.requestAdapter();
    return adapter ? 'webgpu' : 'wasm';
  } catch {
    return 'wasm';
  }
}

// ─── Load model ────────────────────────────────────────────────────────────
async function loadModel() {
  activeDevice = await detectDevice();
  self.postMessage({ type: 'loading', device: activeDevice });

  const dtype = activeDevice === 'webgpu'
    ? { encoder_model: 'fp32', decoder_model_merged: 'q4' }
    : { encoder_model: 'fp32', decoder_model_merged: 'q4' }; // same quant, wasm just uses CPU

  try {
    transcriber = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny',
      {
        device: activeDevice,
        dtype,
        progress_callback: (progress) => {
          self.postMessage({ type: 'progress', progress });
        },
      }
    );
    self.postMessage({ type: 'ready', device: activeDevice });
  } catch (err) {
    // WebGPU failed at runtime → retry with WASM
    if (activeDevice === 'webgpu') {
      console.warn('[Whisper] WebGPU load failed, retrying with WASM:', err.message);
      activeDevice = 'wasm';
      self.postMessage({ type: 'loading', device: 'wasm' });
      transcriber = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny',
        {
          device: 'wasm',
          dtype,
          progress_callback: (progress) => {
            self.postMessage({ type: 'progress', progress });
          },
        }
      );
      self.postMessage({ type: 'ready', device: 'wasm' });
    } else {
      throw err;
    }
  }
}

// ─── Message router ────────────────────────────────────────────────────────
self.addEventListener('message', async (event) => {
  const { type, audio, sampleRate } = event.data;

  if (type === 'load') {
    try {
      await loadModel();
    } catch (err) {
      self.postMessage({ type: 'error', message: err.message });
    }
    return;
  }

  if (type === 'transcribe') {
    if (!transcriber) {
      self.postMessage({ type: 'error', message: 'Model not loaded yet.' });
      return;
    }
    try {
      console.log('[InterviewLens:Whisper] Starting transcription on audio samples:', audio?.length);
      const result = await transcriber(audio, {
        sampling_rate: sampleRate ?? 16000,
        language: 'english',
        task: 'transcribe',
        return_timestamps: 'word',
        chunk_length_s: 30,
        stride_length_s: 5,
      });
      const text = (result.text || '').trim();
      console.log('[InterviewLens:Whisper] Transcription result:', text);
      self.postMessage({
        type: 'result',
        text,
        chunks: result.chunks || [],
      });
    } catch (err) {
      console.error('[InterviewLens:Whisper] Transcription error:', err);
      self.postMessage({ type: 'error', message: err.message });
    }
  }
});
