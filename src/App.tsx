import React, { useState } from 'react';
import { AgentProvider } from './context/AgentContext';
import { Header } from './components/Header';
import { VoiceAssistantOrb } from './components/VoiceAssistantOrb';
import { PhoneSimulator } from './components/PhoneSimulator';
import { LearningDashboard } from './components/LearningDashboard';
import { VoiceHelpModal } from './components/VoiceHelpModal';

function MainLayout() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Header */}
      <Header onOpenHelp={() => setHelpOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Hero Banner Explaining Zero-Token Local Intelligence */}
        <section aria-label="Información del motor" className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/60 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold tracking-tight text-white">
                Motor de Voz Autónomo • 100% en Dispositivo
              </h2>
            </div>
            <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
              Toda la transcripción, comprensión sintáctica, memoria semántica y control de aplicaciones se procesa
              directamente en tu navegador sin enviar datos a APIs externas. Tu privacidad se mantiene segura y tus costos se mantienen en $0.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
            <button
              onClick={() => setHelpOpen(true)}
              className="w-full md:w-auto px-4 py-2 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 text-xs font-bold transition-all shadow-sm cursor-pointer text-center"
            >
              Ver Comandos de Ejemplo
            </button>
          </div>
        </section>

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Voice Assistant Orb + Continuous Self-Learning Panel */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Interactive Voice Orb & Speech Visualizer */}
            <VoiceAssistantOrb />

            {/* Cognitive Brain & Self-Healing Panel */}
            <LearningDashboard />
          </div>

          {/* Right Column: Simulated Smartphone with Real-Time Synced Apps */}
          <div className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-20">
            <PhoneSimulator />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs">
        <p>
          Vocalis AI • Agente de voz con aprendizaje continuo local. 0 Tokens enviados a servidores. Privacidad total.
        </p>
      </footer>

      {/* Help Modal */}
      <VoiceHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AgentProvider>
      <MainLayout />
    </AgentProvider>
  );
}
