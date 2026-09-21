/**
 * llm.worker.js
 *
 * Dedicated Web Worker running @mlc-ai/web-llm.
 * Runs entirely off the main UI thread.
 *
 * Features:
 *   - Auto-detects WebGPU and shader-f16 support.
 *   - Falls back to q4f32_1 if shader-f16 is unsupported.
 *   - Emits descriptive progress text and percentage.
 *   - Verbose console logging for debugging.
 */

import * as webllm from '@mlc-ai/web-llm';

let engine = null;
let activeModelId = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';
let usedDevice = 'unknown';

const TAG = '[InterviewLens:LLM-Worker]';

/**
 * Detect WebGPU support and whether the adapter supports shader-f16.
 */
async function inspectWebGPU() {
  console.log(`${TAG} Inspecting WebGPU availability...`);
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    console.warn(`${TAG} navigator.gpu is not defined in this worker.`);
    return { available: false, hasF16: false, adapterInfo: null };
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      console.warn(`${TAG} navigator.gpu.requestAdapter() returned null.`);
      return { available: false, hasF16: false, adapterInfo: null };
    }

    const hasF16 = adapter.features.has('shader-f16');
    console.log(`${TAG} WebGPU adapter acquired. shader-f16 support: ${hasF16}`);
    return { available: true, hasF16, adapter };
  } catch (err) {
    console.error(`${TAG} Error while inspecting WebGPU:`, err);
    return { available: false, hasF16: false, adapterInfo: null };
  }
}

/**
 * Load the LLM engine with progress callbacks.
 */
async function loadEngine() {
  console.log(`${TAG} Starting load sequence...`);
  const { available, hasF16 } = await inspectWebGPU();

  if (!available) {
    throw new Error(
      'WebGPU is not supported or enabled in this browser. Please enable WebGPU or use Chrome 113+.'
    );
  }

  usedDevice = 'webgpu';
  // Use q4f16_1 if shader-f16 is available, else q4f32_1 for compatibility
  activeModelId = hasF16
    ? 'Llama-3.2-1B-Instruct-q4f16_1-MLC'
    : 'Llama-3.2-1B-Instruct-q4f32_1-MLC';

  console.log(`${TAG} Selected model variant: ${activeModelId} (shader-f16: ${hasF16})`);

  const initProgressCallback = (report) => {
    const pct = Math.round((report.progress ?? 0) * 100);
    const text = report.text ?? 'Loading model...';
    console.log(`${TAG} [Progress ${pct}%] ${text}`);
    self.postMessage({
      type: 'progress',
      progress: report.progress ?? 0,
      text,
    });
  };

  try {
    console.log(`${TAG} Calling webllm.CreateMLCEngine with ${activeModelId}...`);
    engine = await webllm.CreateMLCEngine(activeModelId, {
      initProgressCallback,
      logLevel: 'INFO',
    });

    console.log(`${TAG} Model loaded and compiled successfully.`);
    self.postMessage({
      type: 'ready',
      device: usedDevice,
      modelId: activeModelId,
    });
  } catch (err) {
    console.error(`${TAG} Fatal error loading model:`, err);
    self.postMessage({
      type: 'load_error',
      message: err.message || String(err),
    });
  }
}

/**
 * Run chat completion inference.
 */
async function runGenerate({ id, messages, maxTokens = 180, temperature = 0.7 }) {
  if (!engine) {
    self.postMessage({
      type: 'generate_error',
      id,
      message: 'Engine is not loaded yet.',
    });
    return;
  }

  try {
    console.log(`${TAG} Generating response (temp=${temperature}, maxTokens=${maxTokens}) id=${id}...`);
    const response = await engine.chat.completions.create({
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    });

    const text = response.choices[0]?.message?.content ?? '';
    console.log(`${TAG} Generation complete for id=${id}. Output length: ${text.length}`);
    self.postMessage({ type: 'generate_result', id, text });
  } catch (err) {
    console.error(`${TAG} Generation failed for id=${id}:`, err);
    self.postMessage({ type: 'generate_error', id, message: err.message });
  }
}

// ─── Worker Message Router ──────────────────────────────────────────────────
self.addEventListener('message', async (event) => {
  const { type, ...data } = event.data || {};
  console.log(`${TAG} Received message type="${type}"`);

  if (type === 'load') {
    await loadEngine();
  } else if (type === 'generate') {
    await runGenerate(data);
  }
});
