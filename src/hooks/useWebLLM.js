/**
 * useWebLLM.js
 *
 * Hook to interface with llm.worker.js.
 *
 * Improvements:
 *   - Auto-starts loading immediately when worker is spawned inside useEffect (Strict-Mode safe).
 *   - Captures worker.onerror for silent script crashes.
 *   - 90-second timeout with fallback failure notification.
 *   - Exposes loadingText, llmDevice, downloadProgress, and retryLoad.
 */

import { useState, useRef, useEffect, useCallback } from 'react';

const TAG = '[InterviewLens:useWebLLM]';
let nextId = 0;

export function useWebLLM() {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing AI worker...');
  const [llmDevice, setLlmDevice] = useState(null);
  const [activeModel, setActiveModel] = useState(null);
  const [error, setError] = useState(null);

  const workerRef = useRef(null);
  const pendingRef = useRef({});
  const timeoutRef = useRef(null);

  const spawnWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    console.log(`${TAG} Spawning new LLM Web Worker...`);
    setIsLoading(true);
    setError(null);
    setDownloadProgress(0);
    setLoadingText('Initializing AI engine...');

    const worker = new Worker(
      new URL('../workers/llm.worker.js', import.meta.url),
      { type: 'module' }
    );

    // 90-second timeout fallback
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.warn(`${TAG} Model load timed out after 90 seconds.`);
      setIsLoading(false);
      setError('Model download timed out. You can use standard predefined questions or retry.');
    }, 90_000);

    worker.addEventListener('message', (event) => {
      const { type, id, ...data } = event.data || {};

      if (type === 'progress') {
        const pct = Math.round((data.progress ?? 0) * 100);
        setDownloadProgress(pct);
        setLoadingText(data.text || `Loading model (${pct}%)...`);
      } else if (type === 'ready') {
        clearTimeout(timeoutRef.current);
        console.log(`${TAG} Model ready on device: ${data.device}`);
        setIsLoading(false);
        setDownloadProgress(100);
        setLoadingText('Ready');
        setLlmDevice(data.device ?? 'webgpu');
        setActiveModel(data.modelId ?? null);
      } else if (type === 'load_error') {
        clearTimeout(timeoutRef.current);
        console.error(`${TAG} Worker reported load error:`, data.message);
        setIsLoading(false);
        setError(data.message || 'Failed to load model.');
      } else if (type === 'generate_result') {
        setIsGenerating(false);
        pendingRef.current[id]?.resolve(data.text);
        delete pendingRef.current[id];
      } else if (type === 'generate_error') {
        setIsGenerating(false);
        pendingRef.current[id]?.reject(new Error(data.message));
        delete pendingRef.current[id];
      }
    });

    worker.addEventListener('error', (err) => {
      clearTimeout(timeoutRef.current);
      console.error(`${TAG} Worker crashed:`, err);
      setIsLoading(false);
      setError(err.message || 'Worker thread encountered an error.');
    });

    // Send 'load' command directly to worker instance
    console.log(`${TAG} Sending 'load' command to worker.`);
    worker.postMessage({ type: 'load' });
    workerRef.current = worker;
  }, []);

  // Boot worker on mount
  useEffect(() => {
    spawnWorker();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (workerRef.current) {
        console.log(`${TAG} Terminating worker on cleanup.`);
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [spawnWorker]);

  /**
   * Run inference.
   */
  const generate = useCallback((messages, maxTokens = 180, temperature = 0.7) => {
    if (!workerRef.current) {
      return Promise.reject(new Error('LLM worker is not available.'));
    }

    return new Promise((resolve, reject) => {
      const id = String(nextId++);
      pendingRef.current[id] = { resolve, reject };
      setIsGenerating(true);
      workerRef.current.postMessage({ type: 'generate', id, messages, maxTokens, temperature });
    });
  }, []);

  return {
    loadModel: spawnWorker,
    generate,
    isLoading,
    isGenerating,
    downloadProgress,
    loadingText,
    llmDevice,
    activeModel,
    error,
  };
}
