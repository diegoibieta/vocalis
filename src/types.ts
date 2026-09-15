export type Priority = 'low' | 'medium' | 'high';
export type AppTab = 'messages' | 'tasks' | 'music' | 'calendar' | 'notes' | 'device';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  relationship: string;
  aliases: string[]; // e.g. ["Mamá", "Madre", "Mami"]
  lastActive: string;
}

export interface Message {
  id: string;
  contactId: string;
  sender: 'user' | 'contact' | 'assistant';
  platform: 'whatsapp' | 'telegram' | 'sms';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category: 'personal' | 'trabajo' | 'hogar' | 'salud';
  dueDate?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  durationMinutes: number;
  location?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number; // in seconds
  url?: string;
  coverColor: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DeviceState {
  wifi: boolean;
  bluetooth: boolean;
  flashlight: boolean;
  darkMode: boolean;
  doNotDisturb: boolean;
  volume: number; // 0 - 100
  brightness: number; // 0 - 100
  battery: number; // percentage
  isCharging: boolean;
}

// Continuous Learning & Zero-Token Self-Healing Engine Types
export interface LearnedRule {
  id: string;
  triggerPhrase: string; // e.g. "modo estudio"
  description: string;
  actions: {
    type: 'device' | 'music' | 'task' | 'message' | 'note';
    payload: Record<string, any>;
  }[];
  usageCount: number;
  createdAt: string;
  learnedFrom: 'user_explicit' | 'auto_discovered_habit';
}

export interface SelfHealingLog {
  id: string;
  originalQuery: string;
  issue: 'ambiguous_contact' | 'missing_slot' | 'unrecognized_intent' | 'execution_error';
  diagnosis: string;
  resolution: string;
  status: 'resolved' | 'pending_confirmation';
  learnedFix?: {
    alias?: { entityType: string; original: string; mappedTo: string };
    ruleId?: string;
  };
  timestamp: string;
}

export interface UserMemoryFact {
  id: string;
  key: string;
  value: string;
  category: 'preference' | 'personal' | 'work' | 'contact';
  confidence: number;
  learnedAt: string;
}

export interface RoutineHabit {
  id: string;
  pattern: string; // e.g. "Revisar tareas en las mañanas"
  occurrences: number;
  suggestedAction: string;
  accepted: boolean;
}

export interface AgentMetrics {
  totalInteractions: number;
  tokensConsumed: number; // always 0
  tokensSavedEstimate: number; // calculated based on cloud equivalent (~1500 tokens/call)
  moneySavedUsd: number;
  localAccuracyScore: number; // 0-100%
  learnedAliasesCount: number;
  learnedRulesCount: number;
  selfHealedIssuesCount: number;
  experienceLevel: number; // 1 to 10
}

export type IntentType =
  | 'SEND_MESSAGE'
  | 'CREATE_TASK'
  | 'COMPLETE_TASK'
  | 'LIST_TASKS'
  | 'PLAY_MUSIC'
  | 'PAUSE_MUSIC'
  | 'NEXT_MUSIC'
  | 'PREV_MUSIC'
  | 'SET_VOLUME'
  | 'DEVICE_CONTROL'
  | 'CREATE_NOTE'
  | 'CREATE_EVENT'
  | 'REMEMBER_FACT'
  | 'QUERY_MEMORY'
  | 'LEARN_COMMAND'
  | 'QUERY_STATUS'
  | 'UNKNOWN';

export interface ParsedIntent {
  intent: IntentType;
  confidence: number; // 0 to 1
  rawText: string;
  slots: Record<string, any>;
  suggestedFeedback?: string;
  needsClarification?: boolean;
  clarificationPrompt?: string;
}

export interface ExecutionResult {
  success: boolean;
  message: string;
  actionTaken?: string;
  feedbackVoice?: string;
  affectedApp?: AppTab;
  selfLearned?: boolean;
  learnedInfo?: string;
  needsClarification?: boolean;
}
