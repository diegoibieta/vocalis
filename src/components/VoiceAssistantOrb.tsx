import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';

const PRESET_QUICK_COMMANDS = [
  'Envía un mensaje a mamá que voy en camino por WhatsApp',
  'Anota tarea comprar café y fruta con prioridad alta',
  'Pon música Midnight Focus para estudiar',
  'Activa modo no molestar y pon el brillo al 60%',
  '¿Cuántos tokens he ahorrado y cuál es mi nivel?',
  'Recuerda que mi clave del gimnasio es 4482',
  'Cuando diga modo descanso pon volumen al 30%',
];

export const VoiceAssistantOrb: React.FC = () => {
  const {
    isListening,
    isSpeaking,
    isProcessingLocal,
    audioLevel,
    lastTranscript,
    interimTranscript,
    agentSpeech,
    agentThought,
    lastResult,
    toggleVoiceListening,
    processUserInput,
    speakText,
    stopSpeech,
  } = useAgent();

  const [textInput, setTextInput] = useState('');

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const text = textInput;
    setTextInput('');
    processUserInput(text);
  };

  const handlePresetClick = (cmd: string) => {
    processUserInput(cmd);
  };

  // Determine visual style of the orb
  let orbStatus = 'En reposo';
  let orbBgClass = 'from-indigo-500/20 via-slate-800/40 to-slate-900/60 border-indigo-500/30';
  let orbGlowClass = 'bg-indigo-500/20';

  if (isListening) {
    orbStatus = 'Escuchando tu voz...';
    orbBgClass = 'from-rose-500/30 via-pink-600/20 to-purple-900/50 border-rose-400/60 shadow-rose-500/30';
    orbGlowClass = 'bg-rose-500/40 animate-ping';
  } else if (isProcessingLocal) {
    orbStatus = 'Procesando localmente (0 tokens)...';
    orbBgClass = 'from-cyan-500/30 via-teal-600/20 to-blue-900/50 border-cyan-400/60';
    orbGlowClass = 'bg-cyan-500/30 animate-pulse';
  } else if (isSpeaking) {
    orbStatus = 'Respondiendo por voz...';
    orbBgClass = 'from-violet-500/30 via-purple-600/20 to-indigo-950/60 border-violet-400/60 shadow-violet-500/30';
    orbGlowClass = 'bg-violet-500/30';
  }

  // Calculate dynamic scale from audio level
  const pulseScale = 1 + (isListening ? audioLevel * 0.45 : isSpeaking ? 0.08 : 0);

  return (
    <div className="w-full bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-sm flex flex-col items-center relative overflow-hidden transition-all">
      {/* Background ambient lighting */}
      <div
        className={`absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-500 ${orbGlowClass}`}
      />

      {/* Top status bar */}
      <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 z-10">
        <div className="flex items-center gap-1.5 font-medium">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isListening
                ? 'bg-rose-500 animate-ping'
                : isSpeaking
                ? 'bg-violet-500 animate-pulse'
                : 'bg-emerald-500'
            }`}
          />
          <span className="text-slate-700 dark:text-slate-200">{orbStatus}</span>
        </div>

        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button
              onClick={stopSpeech}
              className="flex items-center gap-1 text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium cursor-pointer"
            >
              <VolumeX className="h-3.5 w-3.5" />
              <span>Silenciar</span>
            </button>
          )}
          <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono">
            Modo: 100% Offline
          </span>
        </div>
      </div>

      {/* Voice Orb Graphic & Button */}
      <div className="my-3 flex flex-col items-center justify-center relative">
        {/* Concentric audio waves */}
        {isListening && (
          <>
            <div
              className="absolute w-44 h-44 rounded-full border border-rose-500/20 animate-ping"
              style={{ animationDuration: '2s' }}
            />
            <div
              className="absolute w-52 h-52 rounded-full border border-rose-500/10 animate-ping"
              style={{ animationDuration: '3s' }}
            />
          </>
        )}

        <button
          onClick={toggleVoiceListening}
          style={{ transform: `scale(${pulseScale})` }}
          className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center relative z-10 transition-all duration-150 shadow-xl border cursor-pointer ${
            isListening
              ? 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white border-rose-300 shadow-rose-500/40 ring-4 ring-rose-500/20'
              : isSpeaking
              ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white border-violet-300 shadow-violet-500/40 ring-4 ring-violet-500/20'
              : 'bg-gradient-to-tr from-indigo-600 to-slate-900 text-white border-indigo-400/40 hover:border-indigo-400 shadow-indigo-500/30 hover:scale-105'
          }`}
          title={isListening ? 'Click para detener escucha' : 'Click para hablar'}
        >
          {isListening ? (
            <Mic className="h-10 w-10 animate-bounce" />
          ) : isSpeaking ? (
            <Volume2 className="h-10 w-10 animate-pulse" />
          ) : isProcessingLocal ? (
            <RotateCw className="h-10 w-10 animate-spin" />
          ) : (
            <Mic className="h-10 w-10" />
          )}
          <span className="text-[11px] font-semibold tracking-wider uppercase mt-1 opacity-90">
            {isListening ? 'Detener' : 'Hablar'}
          </span>
        </button>

        {/* Real-time sound wave bars */}
        <div className="flex items-center gap-1.5 mt-4 h-6">
          {[0.2, 0.4, 0.7, 1.0, 0.8, 0.5, 0.3, 0.6, 0.9, 0.4, 0.2].map((weight, idx) => {
            const barHeight = isListening
              ? Math.max(4, audioLevel * 24 * weight)
              : isSpeaking
              ? Math.max(4, Math.sin(Date.now() / 150 + idx) * 12 + 10)
              : 4;
            return (
              <div
                key={idx}
                style={{ height: `${barHeight}px` }}
                className={`w-1 rounded-full transition-all duration-75 ${
                  isListening
                    ? 'bg-rose-500'
                    : isSpeaking
                    ? 'bg-violet-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Transcript & Agent Voice Response Bubble */}
      <div className="w-full max-w-2xl mt-2 flex flex-col gap-2 z-10">
        {/* User Speech Transcription */}
        {(lastTranscript || interimTranscript) && (
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">Tú:</span>
            <p className="flex-1 italic">
              "{lastTranscript || interimTranscript}"
              {interimTranscript && <span className="inline-block w-1.5 h-3 ml-1 bg-indigo-500 animate-pulse" />}
            </p>
          </div>
        )}

        {/* Agent Speech Output & Cognitive Thoughts */}
        <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Vocalis:</span>
            </div>
            {agentSpeech && (
              <button
                onClick={() => speakText(agentSpeech)}
                className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="h-3 w-3" />
                Escuchar de nuevo
              </button>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            {agentSpeech}
          </p>

          {/* Engine Thought & Self-Healing Indicator */}
          {agentThought && (
            <div className="pt-2 mt-1 border-t border-indigo-200/50 dark:border-indigo-900/50 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between">
              <span className="truncate">🧠 {agentThought}</span>
              {lastResult?.selfLearned && (
                <span className="shrink-0 font-sans font-semibold text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Auto-Aprendido
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual Direct Input Bar */}
      <form onSubmit={handleSendText} className="w-full max-w-2xl mt-4 flex items-center gap-2 z-10">
        <div className="relative flex-1">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Escribe un comando o dicta con el micrófono arriba..."
            className="w-full text-xs md:text-sm rounded-xl pl-4 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          />
          {textInput && (
            <button
              type="button"
              onClick={() => setTextInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!textInput.trim() || isProcessingLocal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Ejecutar</span>
        </button>
      </form>

      {/* Suggested Quick Triggers */}
      <div className="w-full max-w-2xl mt-3.5 z-10">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
          <span>Prueba rápida (o dicta por voz):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_QUICK_COMMANDS.map((cmd, i) => (
            <button
              key={i}
              onClick={() => handlePresetClick(cmd)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700/80 transition-colors text-left truncate max-w-xs cursor-pointer"
            >
              "{cmd}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
