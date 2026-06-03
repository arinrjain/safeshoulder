"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  token: string;
  onTranscript: (text: string) => void;
  onAssistantText: (text: string) => void;
  disabled?: boolean;
  dark?: boolean;
};

type VoiceState = "idle" | "recording" | "transcribing" | "speaking";

export function VoiceButton({ token, onTranscript, onAssistantText, disabled, dark }: Props) {
  const [state, setState] = useState<VoiceState>("idle");
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => { audioRef.current?.pause(); };
  }, []);

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribe(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");
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

      const audioBlob = await res.blob();
      const url = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onended = () => {
          setState("idle");
          URL.revokeObjectURL(url);
        };
        await audioRef.current.play();
      }
    } catch {
      setState("idle");
    }
  }

  // Expose speakText so parent can call it
  useEffect(() => {
    (window as Window & { safeshoulderSpeak?: (t: string) => void }).safeshoulderSpeak = speakText;
  }, [token]);

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
    idle: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-2 17.93A8 8 0 0 1 4.07 13H2a10 10 0 0 0 9 9.93V22h2v-.07A10 10 0 0 0 22 13h-2.07A8 8 0 0 1 14 18.93V17a6 6 0 0 0-4 0v1.93z"/>
      </svg>
    ),
    recording: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="12" height="12" rx="2"/>
      </svg>
    ),
    transcribing: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="animate-spin">
        <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
      </svg>
    ),
    speaking: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
      </svg>
    ),
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
