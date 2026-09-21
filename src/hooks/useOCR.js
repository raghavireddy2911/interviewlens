/**
 * useOCR.js
 *
 * Hook to run Tesseract.js OCR in a Web Worker (with fallback).
 * Tracks real-time scanning progress and status messages.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

const TAG = '[InterviewLens:useOCR]';

export function useOCR() {
  const [isScanning, setIsScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrError, setOcrError] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => {
    try {
      const worker = new Worker(
        new URL('../workers/ocr.worker.js', import.meta.url),
        { type: 'module' }
      );
      workerRef.current = worker;
      return () => worker.terminate();
    } catch (e) {
      console.warn(`${TAG} Dedicated worker initialization failed:`, e);
    }
  }, []);

  const scanImage = useCallback((imageInput) => {
    return new Promise((resolve, reject) => {
      setIsScanning(true);
      setOcrProgress(0);
      setOcrStatus('Preparing image...');
      setOcrError(null);

      if (workerRef.current) {
        const handleMessage = (e) => {
          const { type, text, progress, status, message } = e.data || {};

          if (type === 'progress') {
            const pct = Math.round((progress ?? 0) * 100);
            setOcrProgress(pct);
            const statusLabel = status ? status.replace(/_/g, ' ') : 'Scanning';
            setOcrStatus(`${statusLabel} (${pct}%)`);
          } else if (type === 'result') {
            workerRef.current.removeEventListener('message', handleMessage);
            setIsScanning(false);
            setOcrProgress(100);
            setOcrStatus('Extraction complete');
            resolve(text);
          } else if (type === 'error') {
            workerRef.current.removeEventListener('message', handleMessage);
            setIsScanning(false);
            setOcrError(message || 'Failed to scan image.');
            reject(new Error(message));
          }
        };

        workerRef.current.addEventListener('message', handleMessage);
        workerRef.current.postMessage({ type: 'recognize', image: imageInput });
      } else {
        // Fallback: run createWorker directly
        import('tesseract.js').then(async ({ createWorker }) => {
          try {
            console.log(`${TAG} Running direct Tesseract fallback...`);
            const worker = await createWorker('eng', 1, {
              logger: (m) => {
                const pct = Math.round((m.progress ?? 0) * 100);
                setOcrProgress(pct);
                setOcrStatus(`${m.status || 'Scanning'} (${pct}%)`);
              },
            });
            const ret = await worker.recognize(imageInput);
            await worker.terminate();
            setIsScanning(false);
            setOcrProgress(100);
            setOcrStatus('Extraction complete');
            resolve(ret.data.text || '');
          } catch (err) {
            setIsScanning(false);
            setOcrError(err.message || 'OCR extraction failed.');
            reject(err);
          }
        });
      }
    });
  }, []);

  return {
    scanImage,
    isScanning,
    ocrProgress,
    ocrStatus,
    ocrError,
  };
}
