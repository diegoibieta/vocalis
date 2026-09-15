import React from 'react';
import { ShieldCheck, Sparkles, Zap, RotateCcw, Volume2, Cpu } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

export const Header: React.FC<{ onOpenHelp: () => void }> = ({ onOpenHelp }) => {
  const { metrics, activeLanguage, setActiveLanguage, resetAllData } = useAgent();

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Core Concept */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Volume2 className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                  Vocalis
                </h1>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Zero Tokens
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Agente de voz local con autoaprendizaje continuo
              </p>
            </div>
          </div>

          <button
            onClick={onOpenHelp}
            className="md:hidden text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Comandos
          </button>
        </div>

        {/* Real-time stats & badges */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Privacy & Zero-Token Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="font-medium">100% Local</span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">0 Tokens API</span>
          </div>

          {/* Cognitive Growth Level */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Nivel {metrics.experienceLevel}</span>
            <span className="font-semibold text-[11px] bg-indigo-200/60 dark:bg-indigo-900/60 px-1.5 py-0.2 rounded">
              {metrics.localAccuracyScore}% Precisión
            </span>
          </div>

          {/* Latency badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>&lt; 5ms</span>
          </div>

          {/* Language selector */}
          <select
            aria-label="Idioma de reconocimiento"
            value={activeLanguage}
            onChange={(e) => setActiveLanguage(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="es-ES">Español (ES)</option>
            <option value="es-MX">Español (MX)</option>
            <option value="en-US">English (US)</option>
          </select>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="hidden md:inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Cpu className="h-3.5 w-3.5" />
            Guía de Comandos
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              if (window.confirm('¿Reiniciar datos de prueba y memoria local?')) {
                resetAllData();
              }
            }}
            title="Reiniciar datos locales de prueba"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
