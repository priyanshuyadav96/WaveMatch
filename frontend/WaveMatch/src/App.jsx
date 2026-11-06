import { useState } from "react";
import { useAudioAnalyser } from "./hooks/useAudioAnalyser";
import { useAudioClip } from "./hooks/useAudioClip";

import Navbar from "./components/Navbar";
import VisualizerBackground from "./components/VisualizerBackground";
import RecordButton from "./components/RecordButton";
import UploadButton from "./components/UploadButton";
import AudioPreview from "./components/AudioPreview";
import RecognizeButton from "./components/RecognizeButton";
import RecognitionResults from "./components/RecognitionResults";
import PageFooter from "./components/PageFooter";

export default function App() {
  const { analyser, connectElement, startMic, stopMic } = useAudioAnalyser();
  const { clip, recording, error, setFile, toggleRecording, clear } = useAudioClip({ startMic, stopMic });
  const [recognizing, setRecognizing] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [playingUrl, setPlayingUrl] = useState(null);
  const playing = playingUrl !== null && playingUrl === clip?.url;
  const handleTryAgain = () => {
    setRecognitionResult(null);
    clear();
    setPlayingUrl(null);
  };


  const handleRecognize = async () => {
    if (!clip?.file || recognizing) return;

    setRecognizing(true);
    setRecognitionError(null);

    try {
      const formData = new FormData();

      formData.append("audio", clip.file);
      const API_URL = import.meta.env.VITE_API_URL || "";

      const response = await fetch(`${API_URL}/api/audio/recognize`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok && data.success !== false) {
        throw new Error(data.message || "Recognition failed");
      }

      setRecognitionResult(data);
    } catch (err) {
      console.error("Recognition error:", err);
      setRecognitionError(
        err.message || "Something went wrong during recognition."
      );
    } finally {
      setRecognizing(false);
    }
  };
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink bg-[radial-gradient(ellipse_at_50%_48%,#351329_0%,transparent_55%)]">
      <Navbar />

      <section className="relative mx-auto flex min-h-[calc(100vh-76px)] w-[min(calc(100%-40px),1000px)] flex-col items-center justify-center pt-[35px] pb-[65px] max-md:w-[calc(100%-36px)] max-[480px]:min-h-[calc(100svh-65px)] max-[480px]:w-[calc(100%-32px)] max-[480px]:pt-5 max-[480px]:pb-[75px]">
        <VisualizerBackground analyser={analyser} active={playing || recording} />

        {
          recognitionResult?
            <div className="relative z-2 flex w-[min(100%,440px)] flex-col items-center">
              <button
              type="button"
              onClick={handleTryAgain}
              className="mt-6 flex h-11 items-center justify-center gap-2 rounded-full border border-pink-400/30 px-6 text-sm font-medium text-pink-300 transition hover:bg-pink-400/10"
            >
              <span>↻</span>
              Recognize Another Song
              </button>
              { !recognitionResult.success && <div className="text-center text-lg font-bold text-pink-300">NO CONFIDENT MATCH FOUND</div> }
              <RecognitionResults  result={recognitionResult} />
            </div>:
            <div className="relative z-2 flex w-[min(100%,440px)] flex-col items-center">
          <RecordButton recording={recording} onClick={toggleRecording} />
          <UploadButton disabled={recording} onFile={setFile} />

          {error && <p className="mt-5 text-center text-[11px] text-danger">{error}</p>}
          {clip && (
            <>
            <AudioPreview
              clip={clip}
              onPlay={(el) => {
              connectElement(el);
              setPlayingUrl(clip.url);
              }}
              onStop={() => setPlayingUrl(null)}
              onRemove={clear}
            />

            <RecognizeButton
              disabled={recording}
              onClick={handleRecognize}
             />
          </>
          )}
            </div>    
        }
        {recognitionError && (
          <p className="mt-4 text-center text-xs text-danger">
            {recognitionError}
          </p>
        )}

        <PageFooter />
      </section>
    </main>
  );
}
