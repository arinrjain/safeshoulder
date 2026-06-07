"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Volume2 } from "lucide-react";

type Props = {
  token: string;
  onTranscript: (text: string) => void;
  onAssistantText: (text: string) => void;
  disabled?: boolean;
  dark?: boolean;
  voiceMode?: boolean;
};

type VoiceState = "idle" | "recording" | "transcribing" | "speaking";

export function VoiceButton({ token, onTranscript, onAssistantText, disabled, dark, voiceMode }: Props) {
  const [state, setState] = useState<VoiceState>("idle");
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceThresholdRef = useRef(30); // Low threshold = quiet sound triggers silence detection
  const silenceDurationRef = useRef(0);

  // Initialize audio element for mobile/Safari support
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      silenceDurationRef.current = 0;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribe(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");

      // Setup silence detection using Web Audio API
      try {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let silenceCount = 0;
        let speechDetected = false; // must hear speech before auto-stopping

        function checkSilence() {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

          if (average >= silenceThresholdRef.current) {
            speechDetected = true;
            silenceCount = 0;
          } else if (speechDetected) {
            silenceCount++;
          }

          // Auto-stop only after speech was heard and 2s of silence follows (~120 frames at 60fps)
          if (speechDetected && silenceCount > 120) {
            stopRecording();
            return;
          }

          if (mediaRecorderRef.current?.state === "recording") {
            requestAnimationFrame(checkSilence);
          }
        }

        checkSilence();
      } catch (e) {
        console.log("Silence detection not available, manual stop required");
      }
    } catch {
      setError("Microphone access denied");
      setState("idle");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setState("transcribing");
  }

  async function transcribe(blob: Blob) {
    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voice/transcribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) throw new Error("Transcription failed");
      const { transcript } = await res.json();

      if (transcript.trim()) {
        onTranscript(transcript.trim());
      } else {
        setError("Couldn't hear anything. Try again.");
      }
    } catch {
      setError("Transcription failed. Try again.");
    }
    setState("idle");
  }

  async function speakText(text: string) {
    setState("speaking");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voice/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Reuse or create audio element with Safari/mobile support
      const audio = audioRef.current || new Audio();
      audio.src = url;
      audio.crossOrigin = "anonymous";

      // Slow down playback for calm, meditative listening (0.75 = 25% slower)
      audio.playbackRate = 0.75;

      audio.onended = () => { setState("idle"); URL.revokeObjectURL(url); };
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        setState("idle");
        URL.revokeObjectURL(url);
      };

      audioRef.current = audio;

      // Mobile/Safari: Play with error handling
      try {
        await audio.play();
      } catch (playError) {
        console.error("Play failed:", playError);
        setState("idle");
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("TTS error:", err);
      setState("idle");
    }
  }

  // Keep window reference fresh on every render so it never holds a stale closure
  const speakRef = useRef(speakText);
  useEffect(() => { speakRef.current = speakText; });
  useEffect(() => {
    (window as Window & { safeshoulderSpeak?: (t: string) => void }).safeshoulderSpeak =
      (t: string) => speakRef.current(t);
    return () => { delete (window as Window & { safeshoulderSpeak?: (t: string) => void }).safeshoulderSpeak; };
  }, []);

  function handleClick() {
    if (state === "idle") startRecording();
    else if (state === "recording") stopRecording();
    else if (state === "speaking") {
      audioRef.current?.pause();
      setState("idle");
    }
  }

  const d = dark;

  const buttonColors = {
    idle: d ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600",
    recording: "bg-red-500 hover:bg-red-600 text-white animate-pulse",
    transcribing: d ? "bg-gray-800 text-gray-400" : "bg-slate-100 text-slate-400",
    speaking: "bg-indigo-500 hover:bg-indigo-600 text-white",
  };

  const icons = {
    idle: <Mic size={18} strokeWidth={2} />,
    recording: <Square size={18} strokeWidth={2} />,
    transcribing: <Loader2 size={18} strokeWidth={2} className="animate-spin" />,
    speaking: <Volume2 size={18} strokeWidth={2} />,
  };

  const tooltips = {
    idle: "Click to speak",
    recording: "Recording… click to stop",
    transcribing: "Transcribing…",
    speaking: "Playing response… click to stop",
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        disabled={disabled || state === "transcribing"}
        title={tooltips[state]}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${buttonColors[state]} disabled:opacity-40`}
      >
        {icons[state]}
      </button>
      {/* Waveform bars when recording */}
      {state === "recording" && (
        <div className="flex items-end gap-0.5 h-3 mt-1">
          {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-red-400 rounded-full"
              style={{
                height: `${h * 3}px`,
                animation: `wave 0.8s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1 max-w-[120px] text-center">{error}</p>}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2.5); }
        }
      `}</style>
    </div>
  );
}
