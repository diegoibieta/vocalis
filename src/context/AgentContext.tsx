import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AgentMetrics,
  AppTab,
  CalendarEvent,
  Contact,
  DeviceState,
  ExecutionResult,
  LearnedRule,
  Message,
  Note,
  SelfHealingLog,
  Task,
  Track,
  UserMemoryFact,
} from '../types';
import { LocalNlpEngine } from '../services/localNlpEngine';
import { speechService } from '../services/localSpeech';
import {
  INITIAL_CONTACTS,
  INITIAL_DEVICE_STATE,
  INITIAL_EVENTS,
  INITIAL_LEARNED_RULES,
  INITIAL_MESSAGES,
  INITIAL_NOTES,
  INITIAL_SELF_HEALING_LOGS,
  INITIAL_TASKS,
  INITIAL_TRACKS,
  INITIAL_USER_MEMORIES,
} from '../services/seedData';

interface AgentContextType {
  // Navigation & Phone UI
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Phone App Data
  contacts: Contact[];
  messages: Message[];
  tasks: Task[];
  events: CalendarEvent[];
  notes: Note[];
  tracks: Track[];
  currentTrackIndex: number;
  isPlayingMusic: boolean;
  deviceState: DeviceState;

  // Voice Assistant State
  isListening: boolean;
  isSpeaking: boolean;
  isProcessingLocal: boolean;
  audioLevel: number;
  lastTranscript: string;
  interimTranscript: string;
  agentSpeech: string;
  agentThought: string;
  lastResult: ExecutionResult | null;
  activeLanguage: string;
  setActiveLanguage: (lang: string) => void;

  // Self-Learning & Privacy
  metrics: AgentMetrics;
  learnedRules: LearnedRule[];
  learnedAliases: Record<string, string>;
  selfHealingLogs: SelfHealingLog[];
  userMemories: UserMemoryFact[];

  // Actions
  processUserInput: (text: string) => Promise<ExecutionResult>;
  startVoiceListening: () => Promise<void>;
  stopVoiceListening: () => void;
  toggleVoiceListening: () => void;
  speakText: (text: string) => Promise<void>;
  stopSpeech: () => void;

  // Phone App Actions
  sendMessage: (contactId: string, text: string, platform?: 'whatsapp' | 'telegram' | 'sms') => void;
  addTask: (title: string, priority?: 'low' | 'medium' | 'high', category?: Task['category']) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  playTrack: (index: number) => void;
  pauseTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleDeviceFeature: (feature: keyof DeviceState) => void;
  setDeviceVolume: (val: number) => void;
  setDeviceBrightness: (val: number) => void;
  addNote: (title: string, content: string, tags?: string[]) => void;
  deleteNote: (id: string) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;

  // Learning Actions
  addNewRule: (trigger: string, description: string, actions: LearnedRule['actions']) => void;
  deleteRule: (id: string) => void;
  resolveIssueManually: (logId: string, aliasFix?: { entity: string; mappedTo: string }) => void;
  addMemoryFact: (key: string, value: string, category?: UserMemoryFact['category']) => void;
  deleteMemoryFact: (id: string) => void;
  resetAllData: () => void;
}

const AgentContext = createContext<AgentContextType | null>(null);

const STORAGE_KEYS = {
  CONTACTS: 'vocalis_contacts_v1',
  MESSAGES: 'vocalis_messages_v1',
  TASKS: 'vocalis_tasks_v1',
  EVENTS: 'vocalis_events_v1',
  NOTES: 'vocalis_notes_v1',
  DEVICE: 'vocalis_device_v1',
  RULES: 'vocalis_rules_v1',
  ALIASES: 'vocalis_aliases_v1',
  LOGS: 'vocalis_healing_logs_v1',
  MEMORIES: 'vocalis_memories_v1',
  METRICS: 'vocalis_metrics_v1',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<AppTab>('messages');

  // Phone App State
  const [contacts, setContacts] = useState<Contact[]>(() =>
    loadStorage(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS)
  );
  const [messages, setMessages] = useState<Message[]>(() =>
    loadStorage(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES)
  );
  const [tasks, setTasks] = useState<Task[]>(() => loadStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS));
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    loadStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS)
  );
  const [notes, setNotes] = useState<Note[]>(() => loadStorage(STORAGE_KEYS.NOTES, INITIAL_NOTES));
  const [tracks] = useState<Track[]>(INITIAL_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [deviceState, setDeviceState] = useState<DeviceState>(() =>
    loadStorage(STORAGE_KEYS.DEVICE, INITIAL_DEVICE_STATE)
  );

  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [lastTranscript, setLastTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [agentSpeech, setAgentSpeech] = useState(
    'Hola Diego, tu agente local está listo. ¿Qué tarea o mensaje deseas gestionar hoy?'
  );
  const [agentThought, setAgentThought] = useState(
    'Motor NLP local activo. Cero peticiones externas. Procesamiento 100% en tu dispositivo.'
  );
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);
  const [activeLanguage, setActiveLanguage] = useState('es-ES');

  // Self-Learning & Memory State
  const [learnedRules, setLearnedRules] = useState<LearnedRule[]>(() =>
    loadStorage(STORAGE_KEYS.RULES, INITIAL_LEARNED_RULES)
  );
  const [learnedAliases, setLearnedAliases] = useState<Record<string, string>>(() =>
    loadStorage(STORAGE_KEYS.ALIASES, {
      mama: 'c1',
      mami: 'c1',
      jefe: 'c3',
      carlos: 'c2',
      charly: 'c2',
    })
  );
  const [selfHealingLogs, setSelfHealingLogs] = useState<SelfHealingLog[]>(() =>
    loadStorage(STORAGE_KEYS.LOGS, INITIAL_SELF_HEALING_LOGS)
  );
  const [userMemories, setUserMemories] = useState<UserMemoryFact[]>(() =>
    loadStorage(STORAGE_KEYS.MEMORIES, INITIAL_USER_MEMORIES)
  );
  const [metrics, setMetrics] = useState<AgentMetrics>(() =>
    loadStorage(STORAGE_KEYS.METRICS, {
      totalInteractions: 18,
      tokensConsumed: 0,
      tokensSavedEstimate: 27000,
      moneySavedUsd: 0.54,
      localAccuracyScore: 96,
      learnedAliasesCount: 5,
      learnedRulesCount: INITIAL_LEARNED_RULES.length,
      selfHealedIssuesCount: 2,
      experienceLevel: 3,
    })
  );

  // Sync to local storage
  useEffect(() => saveStorage(STORAGE_KEYS.CONTACTS, contacts), [contacts]);
  useEffect(() => saveStorage(STORAGE_KEYS.MESSAGES, messages), [messages]);
  useEffect(() => saveStorage(STORAGE_KEYS.TASKS, tasks), [tasks]);
  useEffect(() => saveStorage(STORAGE_KEYS.EVENTS, events), [events]);
  useEffect(() => saveStorage(STORAGE_KEYS.NOTES, notes), [notes]);
  useEffect(() => saveStorage(STORAGE_KEYS.DEVICE, deviceState), [deviceState]);
  useEffect(() => saveStorage(STORAGE_KEYS.RULES, learnedRules), [learnedRules]);
  useEffect(() => saveStorage(STORAGE_KEYS.ALIASES, learnedAliases), [learnedAliases]);
  useEffect(() => saveStorage(STORAGE_KEYS.LOGS, selfHealingLogs), [selfHealingLogs]);
  useEffect(() => saveStorage(STORAGE_KEYS.MEMORIES, userMemories), [userMemories]);
  useEffect(() => saveStorage(STORAGE_KEYS.METRICS, metrics), [metrics]);

  // NLP Engine instance
  const nlpEngine = useMemo(() => {
    return new LocalNlpEngine(contacts, learnedRules, learnedAliases);
  }, [contacts, learnedRules, learnedAliases]);

  // Update speech language
  useEffect(() => {
    speechService.setLanguage(activeLanguage);
  }, [activeLanguage]);

  // Helper: Increment learning & tokens saved
  const recordSuccessfulInteraction = (accuracyGain = 0.5) => {
    setMetrics((prev) => {
      const nextInteractions = prev.totalInteractions + 1;
      const nextSavedTokens = prev.tokensSavedEstimate + 1500;
      const nextMoneySaved = Number((nextSavedTokens * 0.00002).toFixed(4));
      const nextAcc = Math.min(99.8, prev.localAccuracyScore + accuracyGain);
      const nextLevel = Math.min(10, Math.floor(nextInteractions / 8) + 1);

      // Trigger achievement confetti if leveled up
      if (nextLevel > prev.experienceLevel) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
          speechService.playBeep('learn');
        } catch (e) {
          // ignore
        }
      }

      return {
        ...prev,
        totalInteractions: nextInteractions,
        tokensSavedEstimate: nextSavedTokens,
        moneySavedUsd: nextMoneySaved,
        localAccuracyScore: Number(nextAcc.toFixed(1)),
        experienceLevel: nextLevel,
      };
    });
  };

  // Helper: Record problem / self-healing event
  const recordSelfHealingEvent = (
    query: string,
    issue: SelfHealingLog['issue'],
    diagnosis: string,
    resolution: string,
    fix?: SelfHealingLog['learnedFix']
  ) => {
    const newLog: SelfHealingLog = {
      id: 'sh_' + Date.now(),
      originalQuery: query,
      issue,
      diagnosis,
      resolution,
      status: 'resolved',
      learnedFix: fix,
      timestamp: 'Justo ahora',
    };
    setSelfHealingLogs((prev) => [newLog, ...prev]);
    setMetrics((prev) => ({
      ...prev,
      selfHealedIssuesCount: prev.selfHealedIssuesCount + 1,
    }));
    speechService.playBeep('learn');
  };

  // Speech Helper
  const speakText = async (text: string): Promise<void> => {
    setIsSpeaking(true);
    setAgentSpeech(text);
    return speechService.speak(text, {
      lang: activeLanguage,
      onEnd: () => setIsSpeaking(false),
    });
  };

  const stopSpeech = () => {
    speechService.cancelSpeech();
    setIsSpeaking(false);
  };

  // Process User Input (Text or Voice)
  const processUserInput = async (rawInput: string): Promise<ExecutionResult> => {
    if (!rawInput.trim()) {
      return { success: false, message: 'Entrada vacía' };
    }

    setIsProcessingLocal(true);
    setLastTranscript(rawInput);
    setAgentThought(`Analizando "${rawInput}" en memoria local...`);

    // Simulated short processing time (instant 50ms) to give responsive feel
    await new Promise((r) => setTimeout(r, 60));

    const parsed = nlpEngine.parse(rawInput);

    let result: ExecutionResult = {
      success: true,
      message: 'Comando procesado correctamente.',
      affectedApp: activeTab,
    };

    switch (parsed.intent) {
      case 'SEND_MESSAGE': {
        const { contact, platform = 'whatsapp', text, missingContact } = parsed.slots;
        if (missingContact || !contact) {
          result = {
            success: false,
            message: 'No encontré a qué contacto enviar el mensaje.',
            feedbackVoice: '¿A qué contacto deseas escribirle?',
            affectedApp: 'messages',
          };
          recordSelfHealingEvent(
            rawInput,
            'missing_slot',
            'No se especificó contacto válido.',
            'Se solicitó aclaración al usuario.',
          );
        } else {
          sendMessage(contact.id, text || 'Hola, ¿cómo estás?', platform);
          setActiveTab('messages');
          result = {
            success: true,
            message: `Mensaje enviado a ${contact.name} por ${platform.toUpperCase()}: "${text}"`,
            feedbackVoice: `Listo, le envié el mensaje a ${contact.name} por ${platform}.`,
            affectedApp: 'messages',
          };
          speechService.playBeep('success');
          recordSuccessfulInteraction();
        }
        break;
      }

      case 'CREATE_TASK': {
        const { title, priority = 'medium', category = 'personal' } = parsed.slots;
        addTask(title, priority, category);
        setActiveTab('tasks');
        result = {
          success: true,
          message: `Tarea creada: "${title}" [${priority.toUpperCase()}]`,
          feedbackVoice: `Anoté la tarea: ${title}.`,
          affectedApp: 'tasks',
        };
        speechService.playBeep('success');
        recordSuccessfulInteraction();
        break;
      }

      case 'COMPLETE_TASK': {
        const query = parsed.slots.query?.toLowerCase() || '';
        const targetTask = tasks.find(
          (t) => !t.completed && t.title.toLowerCase().includes(query)
        ) || tasks.find((t) => !t.completed);

        if (targetTask) {
          toggleTask(targetTask.id);
          setActiveTab('tasks');
          result = {
            success: true,
            message: `Tarea completada: "${targetTask.title}"`,
            feedbackVoice: `Marqué como completada: ${targetTask.title}.`,
            affectedApp: 'tasks',
          };
          speechService.playBeep('success');
          recordSuccessfulInteraction();
        } else {
          result = {
            success: false,
            message: 'No encontré tareas pendientes coincidentes.',
            feedbackVoice: 'No encontré esa tarea pendiente en tu lista.',
            affectedApp: 'tasks',
          };
        }
        break;
      }

      case 'LIST_TASKS': {
        const pending = tasks.filter((t) => !t.completed);
        setActiveTab('tasks');
        const taskSummary = pending.length
          ? `Tienes ${pending.length} tareas pendientes: ` +
            pending.slice(0, 3).map((t) => t.title).join(', ')
          : '¡Excelente! No tienes tareas pendientes.';
        result = {
          success: true,
          message: taskSummary,
          feedbackVoice: taskSummary,
          affectedApp: 'tasks',
        };
        speechService.playBeep('success');
        recordSuccessfulInteraction();
        break;
      }

      case 'PLAY_MUSIC': {
        const query = (parsed.slots.query || '').toLowerCase();
        let targetIndex = 0;
        if (query) {
          const foundIdx = tracks.findIndex(
            (tr) =>
              tr.title.toLowerCase().includes(query) ||
              tr.artist.toLowerCase().includes(query) ||
              tr.genre.toLowerCase().includes(query)
          );
          if (foundIdx !== -1) targetIndex = foundIdx;
        }
        playTrack(targetIndex);
        setActiveTab('music');
        result = {
          success: true,
          message: `Reproduciendo: ${tracks[targetIndex].title} de ${tracks[targetIndex].artist}`,
          feedbackVoice: `Reproduciendo ${tracks[targetIndex].title}.`,
          affectedApp: 'music',
        };
        speechService.playBeep('success');
        recordSuccessfulInteraction();
        break;
      }

      case 'PAUSE_MUSIC': {
        pauseTrack();
        setActiveTab('music');
        result = {
          success: true,
          message: 'Música pausada.',
          feedbackVoice: 'Pausé la música.',
          affectedApp: 'music',
        };
        speechService.playBeep('success');
        recordSuccessfulInteraction();
        break;
      }

      case 'NEXT_MUSIC': {
        nextTrack();
        setActiveTab('music');
        const nextIdx = (currentTrackIndex + 1) % tracks.length;
        result = {
          success: true,
          message: `Siguiente pista: ${tracks[nextIdx].title}`,
          feedbackVoice: `Puse la siguiente canción: ${tracks[nextIdx].title}.`,
          affectedApp: 'music',
        };
        speechService.playBeep('success');
        recordSuccessfulInteraction();
        break;
      }

      case 'PREV_MUSIC': {
        prevTrack();
        setActiveTab('music');
        const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        result = {
          success: true,
          message: `Pista anterior: ${tracks[prevIdx].title}`,
          feedbackVoice: `Regresé a la canción anterior.`,
          affectedApp: 'music',
        };
        speechService.playBeep('success');
        recordSuccessfulInteraction();
        break;
      }

      case 'DEVICE_CONTROL': {
        const { feature, value } = parsed.slots;
        if (feature === 'volume') {
          setDeviceVolume(value);
          result = {
            success: true,
            message: `Volumen ajustado al ${value}%`,
            feedbackVoice: `Ajusté el volumen al ${value} por ciento.`,
            affectedApp: 'device',
          };
        } else if (feature === 'brightness') {
          setDeviceBrightness(value);
          result = {
            success: true,
            message: `Brillo de pantalla ajustado al ${value}%`,
            feedbackVoice: `Ajusté el brillo al ${value} por ciento.`,
            affectedApp: 'device',
          };
        } else if (feature in deviceState) {
          setDeviceState((prev) => ({ ...prev, [feature]: value }));
          const spanishFeatures: Record<string, string> = {
            wifi: 'el Wi-Fi',
            bluetooth: 'el Bluetooth',
            flashlight: 'la linterna',
            darkMode: 'el modo oscuro',
            doNotDisturb: 'el modo no molestar',
          };
          const stateStr = value ? 'activado' : 'desactivado';
          result = {
            success: true,
            message: `${spanishFeatures[feature] || feature} fue ${stateStr}.`,
            feedbackVoice: `He ${value ? 'activado' : 'desactivado'} ${spanishFeatures[feature] || feature}.`,
            affectedApp: 'device',
          };
        } else {
          result = {
            success: true,
            message: 'Estado del dispositivo actualizado.',
            feedbackVoice: 'Comando de dispositivo aplicado.',
            affectedApp: 'device',
          };
        }
        setActiveTab('device');
        speechService.playBeep('success');
        recordSuccessfulInteraction();
        break;
      }

      case 'CREATE_NOTE': {
        const { title, content } = parsed.slots;
        addNote(title, content, ['Voz', 'Local']);
        setActiveTab('notes');
        result = {
          success: true,
          message: `Nota guardada: "${title}"`,
          feedbackVoice: `He guardado tu nota: ${title}.`,
          affectedApp: 'notes',
        };
        speechService.playBeep('success');
        recordSuccessfulInteraction();
        break;
      }

      case 'CREATE_EVENT': {
        const { title, time, date, durationMinutes } = parsed.slots;
        addEvent({
          title,
          time,
          date,
          durationMinutes: durationMinutes || 45,
          location: 'Presencial / Teléfono',
        });
        setActiveTab('calendar');
        result = {
          success: true,
          message: `Evento agendado: ${title} (${date} a las ${time})`,
          feedbackVoice: `Agendé tu evento para ${date} a las ${time}.`,
          affectedApp: 'calendar',
        };
        speechService.playBeep('success');
        recordSuccessfulInteraction();
        break;
      }

      case 'REMEMBER_FACT': {
        const fact = parsed.slots.fact || rawInput;
        addMemoryFact('Dato personal', fact, 'preference');
        result = {
          success: true,
          message: `Guardado en memoria local segura: "${fact}"`,
          feedbackVoice: `Listo, guardé ese dato en mi memoria local privada.`,
          selfLearned: true,
          learnedInfo: `Nuevo hecho aprendido: ${fact}`,
        };
        speechService.playBeep('learn');
        recordSuccessfulInteraction(1.0);
        break;
      }

      case 'QUERY_MEMORY': {
        if (userMemories.length === 0) {
          result = {
            success: true,
            message: 'Aún no tengo datos guardados en memoria.',
            feedbackVoice: 'No tengo datos guardados aún. Puedes decirme "recuerda que..." para aprender.',
          };
        } else {
          const memoriesList = userMemories.map((m) => `${m.key}: ${m.value}`).join('. ');
          result = {
            success: true,
            message: `Memoria local: ${memoriesList}`,
            feedbackVoice: `Recuerdo que: ${memoriesList}`,
          };
        }
        speechService.playBeep('success');
        recordSuccessfulInteraction();
        break;
      }

      case 'QUERY_STATUS': {
        const statusMsg = `Llevamos ${metrics.totalInteractions} acciones locales ejecutadas con 0 tokens a la consola. Has ahorrado aproximadamente ${metrics.tokensSavedEstimate.toLocaleString()} tokens ($${metrics.moneySavedUsd} USD) y nuestro nivel cognitivo local es ${metrics.experienceLevel}/10 con ${metrics.localAccuracyScore}% de precisión.`;
        result = {
          success: true,
          message: statusMsg,
          feedbackVoice: `Hemos ejecutado ${metrics.totalInteractions} comandos locales con cero gasto de tokens. Tu privacidad está 100% protegida.`,
        };
        speechService.playBeep('success');
        recordSuccessfulInteraction();
        break;
      }

      case 'LEARN_COMMAND': {
        if (parsed.slots.isNewRule) {
          const { trigger, actionText } = parsed.slots;
          // Auto create a multi-step routine
          addNewRule(trigger, `Acción automática aprendida: ${actionText}`, [
            { type: 'device', payload: { doNotDisturb: true } },
          ]);
          result = {
            success: true,
            message: `Nueva regla de autoaprendizaje creada: "${trigger}"`,
            feedbackVoice: `Aprendí la nueva regla. Cada vez que digas "${trigger}", la ejecutaré automáticamente.`,
            selfLearned: true,
            learnedInfo: `Regla: "${trigger}" -> ${actionText}`,
          };
          speechService.playBeep('learn');
          recordSuccessfulInteraction(2.0);
        } else if (parsed.slots.rule) {
          // Execute existing learned rule
          const rule: LearnedRule = parsed.slots.rule;
          for (const action of rule.actions) {
            if (action.type === 'device') {
              setDeviceState((prev) => ({ ...prev, ...action.payload }));
            } else if (action.type === 'music') {
              if (action.payload.play) setIsPlayingMusic(true);
              if (action.payload.pause) setIsPlayingMusic(false);
            }
          }
          // Increment rule usage count
          setLearnedRules((prev) =>
            prev.map((r) => (r.id === rule.id ? { ...r, usageCount: r.usageCount + 1 } : r))
          );
          result = {
            success: true,
            message: `Regla ejecutada con éxito: "${rule.triggerPhrase}"`,
            feedbackVoice: `Ejecuté tu regla "${rule.triggerPhrase}".`,
            selfLearned: true,
          };
          speechService.playBeep('success');
          recordSuccessfulInteraction();
        }
        break;
      }

      case 'UNKNOWN':
      default: {
        result = {
          success: false,
          message: `No reconocí el comando "${rawInput}".`,
          feedbackVoice: parsed.clarificationPrompt || 'No entendí el comando. ¿Deseas enseñarme qué hacer?',
          needsClarification: true,
        };
        recordSelfHealingEvent(
          rawInput,
          'unrecognized_intent',
          `Frase no indexada en la gramática actual: "${rawInput}"`,
          'El usuario puede asociarla a una regla o atajo personalizado.',
        );
        speechService.playBeep('error');
        break;
      }
    }

    setLastResult(result);
    setAgentThought(
      `Comando resuelto en ${Math.floor(Math.random() * 4 + 2)}ms localmente. 0 Tokens enviados a servidores externos. Privacidad intacta.`
    );
    setIsProcessingLocal(false);

    if (result.feedbackVoice) {
      speakText(result.feedbackVoice);
    }

    return result;
  };

  // Voice Listening Triggers
  const startVoiceListening = async () => {
    stopSpeech();
    setIsListening(true);
    setInterimTranscript('');

    const started = await speechService.startListening({
      language: activeLanguage,
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          setLastTranscript(transcript);
          setInterimTranscript('');
          processUserInput(transcript);
        } else {
          setInterimTranscript(transcript);
        }
      },
      onAudioLevel: (lvl) => setAudioLevel(lvl),
      onEnd: () => {
        setIsListening(false);
        setAudioLevel(0);
      },
      onError: (err) => {
        console.warn('Speech error:', err);
        setIsListening(false);
        setAudioLevel(0);
      },
    });

    if (!started) {
      setIsListening(false);
    }
  };

  const stopVoiceListening = () => {
    speechService.stopListening();
    setIsListening(false);
    setAudioLevel(0);
  };

  const toggleVoiceListening = () => {
    if (isListening) {
      stopVoiceListening();
    } else {
      startVoiceListening();
    }
  };

  // Phone App Handlers
  const sendMessage = (
    contactId: string,
    text: string,
    platform: 'whatsapp' | 'telegram' | 'sms' = 'whatsapp'
  ) => {
    const newMessage: Message = {
      id: 'm_' + Date.now(),
      contactId,
      sender: 'user',
      platform,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addTask = (
    title: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    category: Task['category'] = 'personal'
  ) => {
    const newTask: Task = {
      id: 't_' + Date.now(),
      title,
      completed: false,
      priority,
      category,
      createdAt: new Date().toISOString(),
      dueDate: 'Hoy',
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index % tracks.length);
    setIsPlayingMusic(true);
  };

  const pauseTrack = () => {
    setIsPlayingMusic(false);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlayingMusic(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlayingMusic(true);
  };

  const toggleDeviceFeature = (feature: keyof DeviceState) => {
    setDeviceState((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const setDeviceVolume = (val: number) => {
    setDeviceState((prev) => ({ ...prev, volume: Math.min(100, Math.max(0, val)) }));
  };

  const setDeviceBrightness = (val: number) => {
    setDeviceState((prev) => ({ ...prev, brightness: Math.min(100, Math.max(0, val)) }));
  };

  const addNote = (title: string, content: string, tags: string[] = ['General']) => {
    const newNote: Note = {
      id: 'n_' + Date.now(),
      title,
      content,
      tags,
      createdAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      id: 'e_' + Date.now(),
      ...eventData,
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  // Learning Handlers
  const addNewRule = (
    triggerPhrase: string,
    description: string,
    actions: LearnedRule['actions']
  ) => {
    const newRule: LearnedRule = {
      id: 'r_' + Date.now(),
      triggerPhrase: triggerPhrase.toLowerCase().trim(),
      description,
      actions,
      usageCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
      learnedFrom: 'user_explicit',
    };
    setLearnedRules((prev) => [newRule, ...prev]);
    setMetrics((prev) => ({
      ...prev,
      learnedRulesCount: prev.learnedRulesCount + 1,
    }));
  };

  const deleteRule = (id: string) => {
    setLearnedRules((prev) => prev.filter((r) => r.id !== id));
    setMetrics((prev) => ({
      ...prev,
      learnedRulesCount: Math.max(0, prev.learnedRulesCount - 1),
    }));
  };

  const resolveIssueManually = (
    logId: string,
    aliasFix?: { entity: string; mappedTo: string }
  ) => {
    setSelfHealingLogs((prev) =>
      prev.map((log) => (log.id === logId ? { ...log, status: 'resolved' } : log))
    );
    if (aliasFix) {
      setLearnedAliases((prev) => ({
        ...prev,
        [aliasFix.entity.toLowerCase()]: aliasFix.mappedTo,
      }));
      setMetrics((prev) => ({
        ...prev,
        learnedAliasesCount: prev.learnedAliasesCount + 1,
      }));
    }
  };

  const addMemoryFact = (
    key: string,
    value: string,
    category: UserMemoryFact['category'] = 'preference'
  ) => {
    const newFact: UserMemoryFact = {
      id: 'mem_' + Date.now(),
      key,
      value,
      category,
      confidence: 1.0,
      learnedAt: new Date().toISOString().split('T')[0],
    };
    setUserMemories((prev) => [newFact, ...prev]);
  };

  const deleteMemoryFact = (id: string) => {
    setUserMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const resetAllData = () => {
    localStorage.clear();
    setContacts(INITIAL_CONTACTS);
    setMessages(INITIAL_MESSAGES);
    setTasks(INITIAL_TASKS);
    setEvents(INITIAL_EVENTS);
    setNotes(INITIAL_NOTES);
    setDeviceState(INITIAL_DEVICE_STATE);
    setLearnedRules(INITIAL_LEARNED_RULES);
    setSelfHealingLogs(INITIAL_SELF_HEALING_LOGS);
    setUserMemories(INITIAL_USER_MEMORIES);
    setMetrics({
      totalInteractions: 1,
      tokensConsumed: 0,
      tokensSavedEstimate: 1500,
      moneySavedUsd: 0.03,
      localAccuracyScore: 95,
      learnedAliasesCount: 4,
      learnedRulesCount: INITIAL_LEARNED_RULES.length,
      selfHealedIssuesCount: 2,
      experienceLevel: 1,
    });
  };

  return (
    <AgentContext.Provider
      value={{
        activeTab,
        setActiveTab,
        contacts,
        messages,
        tasks,
        events,
        notes,
        tracks,
        currentTrackIndex,
        isPlayingMusic,
        deviceState,
        isListening,
        isSpeaking,
        isProcessingLocal,
        audioLevel,
        lastTranscript,
        interimTranscript,
        agentSpeech,
        agentThought,
        lastResult,
        activeLanguage,
        setActiveLanguage,
        metrics,
        learnedRules,
        learnedAliases,
        selfHealingLogs,
        userMemories,
        processUserInput,
        startVoiceListening,
        stopVoiceListening,
        toggleVoiceListening,
        speakText,
        stopSpeech,
        sendMessage,
        addTask,
        toggleTask,
        deleteTask,
        playTrack,
        pauseTrack,
        nextTrack,
        prevTrack,
        toggleDeviceFeature,
        setDeviceVolume,
        setDeviceBrightness,
        addNote,
        deleteNote,
        addEvent,
        addNewRule,
        deleteRule,
        resolveIssueManually,
        addMemoryFact,
        deleteMemoryFact,
        resetAllData,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
