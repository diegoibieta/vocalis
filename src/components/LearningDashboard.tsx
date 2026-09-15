import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  TrendingUp,
  Download,
  Database,
  Layers,
  BookOpen,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { LearnedRule } from '../types';

export const LearningDashboard: React.FC = () => {
  const {
    metrics,
    learnedRules,
    selfHealingLogs,
    userMemories,
    addNewRule,
    deleteRule,
    addMemoryFact,
    deleteMemoryFact,
  } = useAgent();

  const [activeTab, setActiveTab] = useState<'metrics' | 'healing' | 'rules' | 'memory'>('metrics');

  // New Rule Form State
  const [newTrigger, setNewTrigger] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [enableDnd, setEnableDnd] = useState(true);
  const [playMusicAction, setPlayMusicAction] = useState(true);

  // New Memory Fact Form State
  const [memKey, setMemKey] = useState('');
  const [memValue, setMemValue] = useState('');

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger.trim()) return;

    const actions: LearnedRule['actions'] = [];
    if (enableDnd) {
      actions.push({ type: 'device', payload: { doNotDisturb: true } });
    }
    if (playMusicAction) {
      actions.push({ type: 'music', payload: { trackId: 'tr1', play: true } });
    }

    addNewRule(
      newTrigger,
      newDesc || `Rutina aprendida para "${newTrigger}"`,
      actions
    );
    setNewTrigger('');
    setNewDesc('');
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memKey.trim() || !memValue.trim()) return;
    addMemoryFact(memKey, memValue, 'preference');
    setMemKey('');
    setMemValue('');
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      metrics,
      learnedRules,
      userMemories,
      selfHealingLogs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocalis_local_memory_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-sm flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Autoaprendizaje Continuo & Privacidad Local
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evolución autónoma de capacidades sin consumo de tokens en consola
            </p>
          </div>
        </div>

        <button
          onClick={handleExportBackup}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar Memoria JSON
        </button>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Tokens Consumed */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <span>Tokens a Consola</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">0</span>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">100% Cero Gasto</p>
          </div>
        </div>

        {/* Metric 2: Estimated Savings */}
        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-800 dark:text-indigo-300 text-xs font-semibold">
            <span>Ahorro Estimado</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-400">
              {metrics.tokensSavedEstimate.toLocaleString()}
            </span>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-500 mt-0.5">
              ~${metrics.moneySavedUsd} USD evitados
            </p>
          </div>
        </div>

        {/* Metric 3: Accuracy & Level */}
        <div className="p-4 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-violet-800 dark:text-violet-300 text-xs font-semibold">
            <span>Nivel Cognitivo</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-violet-700 dark:text-violet-400">
              Nivel {metrics.experienceLevel}
            </span>
            <p className="text-[10px] text-violet-600 dark:text-violet-500 mt-0.5">
              {metrics.localAccuracyScore}% precisión local
            </p>
          </div>
        </div>

        {/* Metric 4: Self-Healing & Rules */}
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <span>Auto-Correcciones</span>
            <Zap className="h-4 w-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">
              {metrics.selfHealedIssuesCount}
            </span>
            <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-0.5">
              {learnedRules.length} reglas activas
            </p>
          </div>
        </div>
      </div>

      {/* Subtabs for Learning Details */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'metrics'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Diagnóstico de Arquitectura
        </button>
        <button
          onClick={() => setActiveTab('healing')}
          className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'healing'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Auto-Corrección & Problemas
          <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded-full text-[10px]">
            {selfHealingLogs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'rules'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Reglas Aprendidas
          <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.2 rounded-full text-[10px]">
            {learnedRules.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'memory'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Memoria Semántica
          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded-full text-[10px]">
            {userMemories.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Diagnóstico de Arquitectura */}
      {activeTab === 'metrics' && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              ¿Cómo funciona el Crecimiento Continuo sin gastar Tokens?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              A diferencia de asistentes que envían cada palabra a la nube generando costos por token y
              riesgos de privacidad, <strong>Vocalis</strong> opera con un <em>motor de análisis sintáctico local</em>,
              reconocimiento de voz en navegador y almacenamiento persistente en tu celular (IndexedDB &amp; LocalStorage).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60">
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">
                  1. Detección de Fallos
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Si un comando tiene ambigüedad o falta información, el agente pregunta y registra la solución.
                </p>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                  2. Expansión de Sinonimia
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Aprende apodos (ej: "Charly" = "Carlos Gómez") y modismos locales con coincidencia difusa Levenshtein.
                </p>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-violet-600 dark:text-violet-400 block mb-1">
                  3. Automatización de Hábitos
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Crea rutinas compuestas ("cuando diga modo estudio activa no molestar y pon música").
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Auto-Corrección & Problemas (Self-Healing Log) */}
      {activeTab === 'healing' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registro de ambigüedades o errores que el agente detectó y aprendió a resolver automáticamente:
          </p>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {selfHealingLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-xs flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      "{log.originalQuery}"
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Auto-Resuelto
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  <strong>Diagnóstico:</strong> {log.diagnosis}
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 text-[11px] bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-900/60">
                  <strong>Aprendizaje permanente:</strong> {log.resolution}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Reglas y Atajos Aprendidos */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Reglas personalizadas que se ejecutan automáticamente al decir la frase clave:
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {learnedRules.map((rule) => (
              <div
                key={rule.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                      "{rule.triggerPhrase}"
                    </span>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      title="Eliminar regla"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{rule.description}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                  <span>Usado {rule.usageCount} veces</span>
                  <span className="font-mono">Creado: {rule.createdAt}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Form to teach a new rule */}
          <form
            onSubmit={handleCreateRule}
            className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 text-xs space-y-3"
          >
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Enseñar nueva regla o atajo al agente
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                placeholder="Frase clave (ej: modo lectura)"
                className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Descripción de la acción"
                className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDnd}
                  onChange={(e) => setEnableDnd(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Activar No Molestar</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={playMusicAction}
                  onChange={(e) => setPlayMusicAction(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Reproducir Música Focus</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={!newTrigger.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold cursor-pointer"
            >
              Guardar Regla en Memoria
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Memoria Semántica en Dispositivo */}
      {activeTab === 'memory' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hechos y preferencias recordadas localmente. Pregúntale por voz: "¿Cuál es mi bebida favorita?"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {userMemories.map((mem) => (
              <div
                key={mem.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex flex-col justify-between gap-1.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] uppercase">
                      {mem.key}
                    </span>
                    <button
                      onClick={() => deleteMemoryFact(mem.id)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{mem.value}</p>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">Aprendido: {mem.learnedAt}</span>
              </div>
            ))}
          </div>

          {/* Add Memory Fact Form */}
          <form
            onSubmit={handleAddMemory}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex flex-col sm:flex-row gap-2 items-center"
          >
            <input
              type="text"
              value={memKey}
              onChange={(e) => setMemKey(e.target.value)}
              placeholder="Etiqueta (ej: Cumpleaños, Café favorito)"
              className="flex-1 w-full bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={memValue}
              onChange={(e) => setMemValue(e.target.value)}
              placeholder="Valor a recordar..."
              className="flex-1 w-full bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!memKey.trim() || !memValue.trim()}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold whitespace-nowrap cursor-pointer"
            >
              Recordar Dato
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
