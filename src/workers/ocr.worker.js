/**
 * ocr.worker.js
 *
 * Runs Tesseract.js optical character recognition in a Web Worker.
 * Emits real-time progress and returns extracted text.
 */

import { createWorker } from 'tesseract.js';

let tesseractWorker = null;

async function initWorker() {
  if (tesseractWorker) return tesseractWorker;

  console.log('[InterviewLens:OCR-Worker] Initializing Tesseract worker...');
  tesseractWorker = await createWorker('eng', 1, {
    logger: (m) => {
      self.postMessage({
        type: 'progress',
        status: m.status,
        progress: m.progress ?? 0,
      });
    },
  });
  console.log('[InterviewLens:OCR-Worker] Tesseract worker ready.');
  return tesseractWorker;
}

self.addEventListener('message', async (event) => {
  const { type, image } = event.data || {};

  if (type === 'recognize') {
    try {
      console.log('[InterviewLens:OCR-Worker] Starting OCR recognize on image input...');
      const worker = await initWorker();
      const result = await worker.recognize(image);
      const text = result.data?.text || '';
      console.log(`[InterviewLens:OCR-Worker] OCR complete. Extracted ${text.length} characters.`);
      self.postMessage({ type: 'result', text });
    } catch (err) {
      console.error('[InterviewLens:OCR-Worker] OCR failed:', err);
      self.postMessage({ type: 'error', message: err.message || String(err) });
    }
  }
});
