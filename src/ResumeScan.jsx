import { useState } from "react";
import Tesseract from "tesseract.js";

// Shrink big phone photos so OCR runs faster
async function resizeImage(file, maxW = 1600) {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, maxW / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.9));
}

export default function ResumeScan({ onConfirm }) {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      const img = await resizeImage(file);
      const { data } = await Tesseract.recognize(img, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      if (!data.text || data.text.trim().length < 20) {
        setError("Couldn't read much text. Try a clearer, well-lit photo.");
      }
      setText(data.text.trim());
    } catch (err) {
      console.error(err);
      setError("Scan failed. You can paste your resume text below instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <label style={{ display: "block", fontWeight: 600 }}>Scan your resume</label>
      <input type="file" accept="image/*" capture="environment" onChange={handleFile} />
      {busy && <p>Reading resume... {progress}%</p>}
      {error && <p style={{ color: "orange" }}>{error}</p>}
      <textarea
        rows={8}
        style={{ width: "100%", marginTop: 8 }}
        placeholder="Resume text appears here. Edit it or paste your own."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button disabled={!text.trim()} onClick={() => onConfirm(text)}>
        Use this resume
      </button>
    </div>
  );
}