/**
 * useWhisper.js
 *
 * Speech-to-text hook with:
 *   - OfflineAudioContext 16000 Hz mono Float32Array resampling.
 *   - Live microphone volume meter (0-100) via Web Audio AnalyserNode.
 *   - Recording timer in seconds.
 *   - Playback audio URL generation for candidate review.
 *   - Web Speech API fallback.
 */

import { useState, useRef, useEffect, useCallback } from 'react';

const TAG = '[InterviewLens:Whisper]';
const WHISPER_TIMEOUT_MS = 60_000;

/**
 * Robustly decodes any audio Blob into a mono 16000 Hz Float32Array.
 */
async function blobToFloat32Mono16k(blob) {
  const targetSampleRate = 16000;
  const arrayBuffer = await blob.arrayBuffer();

  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtxClass();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  await audioCtx.close();

  console.log(
    `${TAG} Decoded audio: ${decoded.sampleRate}Hz, ${decoded.numberOfChannels}ch, duration: ${decoded.duration.toFixed(2)}s`
  );

  // If already exactly 16 kHz and mono, return channel data directly
  if (decoded.sampleRate === targetSampleRate && decoded.numberOfChannels === 1) {
    return decoded.getChannelData(0);
  }

  // Use OfflineAudioContext for browser-native resampling and mono mixdown
  const totalSamples = Math.ceil(decoded.duration * targetSampleRate);
  const offlineCtx = new OfflineAudioContext(1, totalSamples, targetSampleRate);

  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineCtx.destination);
  source.start(0);

  const rendered = await offlineCtx.startRendering();
  const float32 = rendered.getChannelData(0);
  console.log(`${TAG} Resampled to mono 16000Hz. Total Float32 samples: ${float32.length}`);
  return float32;
}

export function useWhisper() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [durationMs, setDurationMs] = useState(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [volume, setVolume] = useState(0); // 0 to 100
  const [audioUrl, setAudioUrl] = useState(null); // for playback

  const [whisperReady, setWhisperReady] = useState(false);
  const [whisperLoading, setWhisperLoading] = useState(false);
  const [whisperDevice, setWhisperDevice] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const workerRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);
  const fallbackRef = useRef(false);

  // ─── Initialize Whisper Worker ──────────────────────────────────────────
  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/whisper.worker.js', import.meta.url),
      { type: 'module' }
    );

    const fallbackTimer = setTimeout(() => {
      if (!whisperReady) activateFallback();
    }, WHISPER_TIMEOUT_MS);

    worker.addEventListener('message', (event) => {
      const { type } = event.data;
      if (type === 'loading') {
        setWhisperLoading(true);
        setWhisperDevice(event.data.device ?? null);
      } else if (type === 'ready') {
        clearTimeout(fallbackTimer);
        setWhisperLoading(false);
        setWhisperReady(true);
        setWhisperDevice(event.data.device ?? null);
        console.log(`${TAG} Model ready on device: ${event.data.device}`);
      } else if (type === 'result') {
        const text = event.data.text || '';
        console.log(`${TAG} Transcript received: "${text}"`);
        setTranscript(text);
        setIsTranscribing(false);
      } else if (type === 'error') {
        console.error(`${TAG} Worker error:`, event.data.message);
        setIsTranscribing(false);
        if (!whisperReady) activateFallback();
      }
    });

    worker.addEventListener('error', (err) => {
      console.error(`${TAG} Worker crashed:`, err);
      activateFallback();
    });

    worker.postMessage({ type: 'load' });
    workerRef.current = worker;

    return () => {
      clearTimeout(fallbackTimer);
      worker.terminate();
    };
  }, []);

  function activateFallback() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      console.warn(`${TAG} Web Speech API also unavailable.`);
      setWhisperLoading(false);
      setWhisperReady(true);
      return;
    }
    fallbackRef.current = true;
    setUsingFallback(true);
    setWhisperLoading(false);
    setWhisperReady(true);
    setWhisperDevice('webspeech');
    console.info(`${TAG} Switched to Web Speech API.`);
  }

  // ─── Volume Meter Setup ─────────────────────────────────────────────────
  const startVolumeMeter = (stream) => {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtxClass();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);

      audioContextRef.current = ctx;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 100) * 100));
        setVolume(normalized);
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      animFrameRef.current = requestAnimationFrame(updateMeter);
    } catch (e) {
      console.warn(`${TAG} Volume meter initialization failed:`, e);
    }
  };

  const stopVolumeMeter = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setVolume(0);
  };

  // ─── Web Speech Fallback Recording ──────────────────────────────────────
  const speechRecRef = useRef(null);
  const speechParts = useRef([]);

  const startRecordingFallback = useCallback(async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startVolumeMeter(stream);
    } catch (e) {
      console.warn('Mic volume meter not accessible for fallback:', e);
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';

    speechParts.current = [];
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          speechParts.current.push(e.results[i][0].transcript);
        }
      }
    };

    rec.start();
    speechRecRef.current = rec;
    startTimeRef.current = Date.now();
    setRecordingSeconds(0);
    setTranscript('');
    setIsRecording(true);

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopRecordingFallback = useCallback(() => {
    return new Promise((resolve) => {
      clearInterval(timerIntervalRef.current);
      stopVolumeMeter();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const rec = speechRecRef.current;
      if (!rec) return resolve(0);

      rec.onend = () => {
        const duration = Date.now() - startTimeRef.current;
        setDurationMs(duration);
        setIsRecording(false);
        const text = speechParts.current.join(' ').trim();
        console.log(`${TAG} Fallback speech transcript: "${text}"`);
        setTranscript(text);
        setIsTranscribing(false);
        resolve(duration);
      };
      rec.stop();
    });
  }, []);

  // ─── Whisper Recording ──────────────────────────────────────────────────
  const startRecordingWhisper = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startVolumeMeter(stream);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/ogg;codecs=opus';

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250);
      recorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setRecordingSeconds(0);
      setTranscript('');
      setAudioUrl(null);
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(`${TAG} Mic denied:`, err);
      alert('Microphone access denied. Please allow microphone permissions and try again.');
    }
  }, []);

  const stopRecordingWhisper = useCallback(() => {
    return new Promise((resolve) => {
      clearInterval(timerIntervalRef.current);
      stopVolumeMeter();

      const recorder = recorderRef.current;
      if (!recorder || recorder.state === 'inactive') return resolve(0);

      recorder.onstop = async () => {
        const duration = Date.now() - startTimeRef.current;
        setDurationMs(duration);
        setIsRecording(false);
        setIsTranscribing(true);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        // Create audio URL for user playback
        const playbackUrl = URL.createObjectURL(blob);
        setAudioUrl(playbackUrl);

        try {
          console.log(`${TAG} Decoding audio blob size=${blob.size} bytes...`);
          const float32 = await blobToFloat32Mono16k(blob);
          workerRef.current?.postMessage(
            { type: 'transcribe', audio: float32, sampleRate: 16000 },
            [float32.buffer]
          );
        } catch (err) {
          console.error(`${TAG} Audio decoding failed:`, err);
          setIsTranscribing(false);
        }
        resolve(duration);
      };

      recorder.stop();
    });
  }, []);

  const startRecording = useCallback(() => {
    if (fallbackRef.current) return startRecordingFallback();
    return startRecordingWhisper();
  }, [startRecordingFallback, startRecordingWhisper]);

  const stopRecording = useCallback(() => {
    if (fallbackRef.current) return stopRecordingFallback();
    return stopRecordingWhisper();
  }, [stopRecordingFallback, stopRecordingWhisper]);

  return {
    isRecording,
    isTranscribing,
    transcript,
    durationMs,
    recordingSeconds,
    volume,
    audioUrl,
    whisperReady,
    whisperLoading,
    whisperDevice,
    usingFallback,
    startRecording,
    stopRecording,
  };
}
