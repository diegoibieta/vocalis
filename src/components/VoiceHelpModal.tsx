import React from 'react';
import { X, Mic, MessageSquare, CheckSquare, Music, Sliders, Brain, Sparkles } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceHelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { processUserInput } = useAgent();

  if (!isOpen) return null;

  const categories = [
    {
      title: 'Mensajes & WhatsApp',
      icon: <MessageSquare className="h-4 w-4 text-emerald-500" />,
      examples: [
        'Envía un mensaje a mamá que ya voy en camino por WhatsApp',
        'Escribe a Carlos Gómez te veo en 10 minutos',
        'Mándale a Roberto el informe está listo',
      ],
    },
    {
      title: 'Tareas & Recordatorios',
      icon: <CheckSquare className="h-4 w-4 text-indigo-500" />,
      examples: [
        'Anota tarea comprar frutas y café con prioridad alta',
        'Recuérdame pagar el agua',
        '¿Cuáles son mis tareas pendientes?',
        'Marca como completada la tarea comprar café',
      ],
    },
    {
      title: 'Música & Spotify',
      icon: <Music className="h-4 w-4 text-purple-500" />,
      examples: [
        'Pon música Midnight Focus para estudiar',
        'Pausa la música',
        'Pon la siguiente canción',
        'Vuelve a la canción anterior',
      ],
    },
    {
      title: 'Control del Celular',
      icon: <Sliders className="h-4 w-4 text-amber-500" />,
      examples: [
        'Enciende la linterna',
        'Apaga la linterna',
        'Activa no molestar',
        'Pon el volumen al 90%',
        'Ajusta el brillo de pantalla al 50%',
      ],
    },
    {
      title: 'Autoaprendizaje & Memoria (0 Tokens)',
      icon: <Brain className="h-4 w-4 text-violet-500" />,
      examples: [
        'Cuando diga modo descanso pon volumen al 30%',
        'Recuerda que mi contraseña del locker es 7492',
        '¿Qué recuerdas de mis preferencias?',
        '¿Cuántos tokens he ahorrado en total?',
      ],
    },
  ];

  const handleTestCommand = (cmd: string) => {
    onClose();
    processUserInput(cmd);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Guía de Comandos de Voz
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Haz clic en cualquier comando para probarlo al instante
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <p>
              <strong>100% Procesamiento Local:</strong> Puedes dictar con acento natural o escribir.
              Si el agente detecta un contacto nuevo o una forma diferente de pedir algo, aprenderá
              automáticamente la asociación en tu dispositivo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {cat.icon}
                  <span>{cat.title}</span>
                </div>
                <div className="space-y-1.5">
                  {cat.examples.map((ex, j) => (
                    <button
                      key={j}
                      onClick={() => handleTestCommand(ex)}
                      className="w-full text-left p-2 rounded-lg bg-white dark:bg-slate-900/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-[11px] leading-relaxed cursor-pointer block"
                    >
                      "{ex}"
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
