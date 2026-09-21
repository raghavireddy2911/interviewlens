import { useState, useEffect, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { useWebLLM }  from './hooks/useWebLLM.js';
import { useWhisper } from './hooks/useWhisper.js';
import {
  scoreAnswerPrompt,
  buildMessages,
  RETRY_SUFFIX,
} from './lib/prompts.js';
import {
  computeFillerWords,
  computeWPM,
  computeHeuristicFeedback,
} from './lib/analytics.js';
import { selectQuestions, scoreCoverage, checkFluency } from './lib/skillBank.js';

import SetupScreen    from './screens/SetupScreen.jsx';
import InterviewScreen from './screens/InterviewScreen.jsx';
import FeedbackScreen from './screens/FeedbackScreen.jsx';
import ExtraFeedback  from './components/ExtraFeedback.jsx';

const SCREENS = {
  SETUP:     'setup',
  INTERVIEW: 'interview',
  SCORING:   'scoring',
  FEEDBACK:  'feedback',
  DONE:      'done',
};

function parseJSON(raw) {
  const cleaned = raw.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');
  return JSON.parse(cleaned);
}

export default function App() {
  // AI hooks
  const {
    loadModel,
    generate,
    isLoading:        llmLoading,
    isGenerating:     llmGenerating,
    downloadProgress: llmProgress,
    loadingText:      llmText,
    llmDevice,
    activeModel,
    error:            llmError,
  } = useWebLLM();

  const {
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
  } = useWhisper();

  // Interview state
  const [screen,          setScreen]          = useState(SCREENS.SETUP);
  const [role,            setRole]            = useState('');
  const [questions,       setQuestions]       = useState([]);
  const [qMeta,           setQMeta]           = useState([]);
  const [currentIndex,    setCurrentIndex]    = useState(0);
  const [feedback,        setFeedback]        = useState(null);
  const [extra,           setExtra]           = useState(null);
  const [fillerData,      setFillerData]      = useState({ count: 0, words: [] });
  const [wpm,             setWpm]             = useState(0);
  const [savedTranscript, setSavedTranscript] = useState('');
  const [isGeneratingQs]                      = useState(false);
  const [usedFallbackQs,  setUsedFallbackQs]  = useState(false);

  // Resume scan (OCR) state
  const [isScanning,  setIsScanning]  = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus,   setOcrStatus]   = useState('');
  const [ocrError,    setOcrError]    = useState('');

  // Debugging & Short audio guards
  const [tooShortWarning, setTooShortWarning] = useState(false);
  const [rawLLMOutput,    setRawLLMOutput]    = useState('');
  const [evaluationMode,  setEvaluationMode]  = useState('LLM');

  // ── Handlers ───────────────────────────────────────────────────────────

  // Build the interview from the skill question bank (based on role + resume skills)
  const startInterview = useCallback((userRole, userResume) => {
    const items = selectQuestions(userRole, userResume, 5);
    setRole(userRole || 'General Candidate');
    setQMeta(items);
    setQuestions(items.map((i) => i.question));
    setCurrentIndex(0);
    setUsedFallbackQs(false);
    setTooShortWarning(false);
    setExtra(null);
    setScreen(SCREENS.INTERVIEW);
  }, []);

  const handleStartFallback = useCallback((userRole) => {
    console.log('[InterviewLens:App] Starting with skill questions (no resume).');
    startInterview(userRole, '');
  }, [startInterview]);

  const handleStart = useCallback((userRole, userResume) => {
    console.log('[InterviewLens:App] Starting skill-based interview for:', userRole);
    startInterview(userRole, userResume);
  }, [startInterview]);

  // Resume scan: photo -> text using Tesseract.js (runs in the browser)
  const handleScanImage = useCallback(async (file) => {
    setIsScanning(true);
    setOcrError('');
    setOcrProgress(0);
    setOcrStatus('Preparing image...');
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1600 / bitmap.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.9));

      const { data } = await Tesseract.recognize(blob, 'eng', {
        logger: (m) => {
          setOcrStatus(m.status || '');
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = (data.text || '').trim();
      if (text.length < 20) {
        setOcrError("Couldn't read much text. Try a clearer, well-lit photo.");
      }
      return text;
    } catch (err) {
      console.error('[InterviewLens:App] OCR failed:', err);
      setOcrError('Scan failed. You can paste your resume text instead.');
      return '';
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleStartRecording = useCallback(async () => {
    setTooShortWarning(false);
    await startRecording();
  }, [startRecording]);

  const handleStopAndScore = useCallback(async () => {
    await stopRecording();
  }, [stopRecording]);

  // ── Evaluation Trigger ──────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== SCREENS.INTERVIEW) return;
    if (isTranscribing) return;
    if (!transcript) return;

    const words = transcript.trim().split(/\s+/).filter(Boolean);
    console.log(`[InterviewLens:App] Transcript received (${words.length} words): "${transcript}"`);

    // Guard: Do not score if transcript is empty or under 5 words
    if (words.length < 5) {
      console.warn(`[InterviewLens:App] Transcript has only ${words.length} words (< 5 words). Halting scoring.`);
      setTooShortWarning(true);
      return;
    }

    setTooShortWarning(false);

    const question = questions[currentIndex];
    if (!question) return;

    async function evaluate() {
      const fillers = computeFillerWords(transcript);
      const calculatedWpm = computeWPM(transcript, durationMs);

      setSavedTranscript(transcript);
      setFillerData(fillers);
      setWpm(calculatedWpm);
      setScreen(SCREENS.SCORING);
      setFeedback(null);
      setExtra(null);
      setRawLLMOutput('');

      let result = null;

      // If LLM is unavailable, score with heuristic evaluation
      if (llmLoading || llmError) {
        console.log('[InterviewLens:App] LLM offline; running heuristic metrics.');
        setEvaluationMode('Heuristic Fallback');
        result = computeHeuristicFeedback(transcript, fillers.count, calculatedWpm);
      } else {
        try {
          console.log('[InterviewLens:App] Requesting LLM comment (temp=0.7)...');
          setEvaluationMode('WebLLM Llama-3.2');
          const prompt = scoreAnswerPrompt(question, transcript, role);
          let raw = await generate(buildMessages(prompt), 180, 0.7);
          setRawLLMOutput(raw);
          console.log('[InterviewLens:App] Raw LLM scoring response:\n', raw);

          try {
            result = parseJSON(raw);
          } catch {
            console.warn('[InterviewLens:App] Retrying JSON parsing...');
            const raw2 = await generate(buildMessages(prompt + RETRY_SUFFIX), 180, 0.7);
            setRawLLMOutput(raw2);
            result = parseJSON(raw2);
          }
        } catch (err) {
          console.warn('[InterviewLens:App] LLM scoring exception, using heuristic evaluation:', err.message);
          setEvaluationMode('Heuristic Fallback (LLM Error)');
          result = computeHeuristicFeedback(transcript, fillers.count, calculatedWpm);
        }
      }

      if (!result) {
        result = computeHeuristicFeedback(transcript, fillers.count, calculatedWpm);
      } else {
        result.reason    = result.reason || 'Candidate provided a direct response to the question.';
        result.clarity   = Math.min(10, Math.max(1, Number(result.clarity)   || 6));
        result.relevance = Math.min(10, Math.max(1, Number(result.relevance) || 6));
        result.tip       = result.tip || 'Provide tangible metrics and clear next steps in your answer.';
      }

      // Rule-based checks: key points covered + English fluency
      const meta = qMeta[currentIndex];
      const coverage = meta ? scoreCoverage(transcript, meta.points) : null;
      const fluency = checkFluency(transcript, durationMs);

      result.clarity = Math.max(1, Math.round(fluency.score / 10));
      if (coverage) {
        const total = coverage.covered.length + coverage.missed.length;
        result.relevance = coverage.score;
        result.reason = `You covered ${coverage.covered.length} of ${total} key points.`;
        if (coverage.missed.length > 0) {
          result.tip = `Try to mention: ${coverage.missed.slice(0, 2).join(', ')}.`;
        }
      }

      setExtra({ modelAnswer: meta ? meta.answer : '', coverage, fluency });
      setFeedback(result);
      setScreen(SCREENS.FEEDBACK);
    }

    evaluate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTranscribing, transcript]);

  const handleNext = useCallback(() => {
    const next = currentIndex + 1;
    if (next < questions.length) {
      setCurrentIndex(next);
      setScreen(SCREENS.INTERVIEW);
      setSavedTranscript('');
      setFeedback(null);
      setExtra(null);
      setTooShortWarning(false);
      setRawLLMOutput('');
    } else {
      setScreen(SCREENS.DONE);
    }
  }, [currentIndex, questions.length]);

  const handleFinish = useCallback(() => setScreen(SCREENS.DONE), []);

  const handleRestart = useCallback(() => {
    setScreen(SCREENS.SETUP);
    setQuestions([]);
    setQMeta([]);
    setCurrentIndex(0);
    setFeedback(null);
    setExtra(null);
    setSavedTranscript('');
    setTooShortWarning(false);
    setRawLLMOutput('');
  }, []);

  // ── Render Screens ──────────────────────────────────────────────────────

  if (screen === SCREENS.DONE) {
    return (
      <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 24 }}>
        <div style={{ fontSize: '4rem' }}>🎉</div>
        <div>
          <h1>Interview complete!</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Great practice session. Review your answers, pacing, and feedback to keep sharpening your skills.
          </p>
        </div>
        <button className="btn btn-primary" style={{ maxWidth: 280 }} onClick={handleRestart}>
          Start a New Interview
        </button>
      </div>
    );
  }

  if (screen === SCREENS.SETUP) {
    return (
      <SetupScreen
        onStart={handleStart}
        onStartFallback={handleStartFallback}
        llmLoading={llmLoading}
        llmProgress={llmProgress}
        llmText={llmText}
        llmDevice={llmDevice}
        activeModel={activeModel}
        llmError={llmError}
        onRetryLLM={loadModel}
        isGeneratingQs={isGeneratingQs}
        whisperLoading={whisperLoading}
        whisperDevice={whisperDevice}
        whisperReady={whisperReady}
        usingFallback={usingFallback}
        onScanImage={handleScanImage}
        isScanning={isScanning}
        ocrProgress={ocrProgress}
        ocrStatus={ocrStatus}
        ocrError={ocrError}
      />
    );
  }

  if (screen === SCREENS.INTERVIEW) {
    return (
      <InterviewScreen
        questions={questions}
        currentIndex={currentIndex}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        transcript={transcript}
        recordingSeconds={recordingSeconds}
        volume={volume}
        audioUrl={audioUrl}
        tooShortWarning={tooShortWarning}
        whisperReady={whisperReady}
        usingFallback={usingFallback}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopAndScore}
      />
    );
  }

  if (screen === SCREENS.SCORING || screen === SCREENS.FEEDBACK) {
    return (
      <>
        <FeedbackScreen
          question={questions[currentIndex]}
          transcript={savedTranscript}
          audioUrl={audioUrl}
          feedback={feedback}
          fillerData={fillerData}
          wpm={wpm}
          isScoring={screen === SCREENS.SCORING || llmGenerating}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          usedFallbackQs={usedFallbackQs}
          rawLLMOutput={rawLLMOutput}
          evaluationMode={evaluationMode}
          onNext={handleNext}
          onFinish={handleFinish}
        />
        {screen === SCREENS.FEEDBACK && extra && (
          <ExtraFeedback
            modelAnswer={extra.modelAnswer}
            coverage={extra.coverage}
            fluency={extra.fluency}
          />
        )}
      </>
    );
  }

  return null;
}