import {
  CalendarEvent,
  Contact,
  DeviceState,
  LearnedRule,
  Message,
  Note,
  SelfHealingLog,
  Track,
  UserMemoryFact,
} from '../types';

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Mamá (Carmen)',
    phone: '+52 55 1234 5678',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    relationship: 'mamá',
    aliases: ['mama', 'mami', 'madre', 'carmen'],
    lastActive: 'Hace 5 min',
  },
  {
    id: 'c2',
    name: 'Carlos Gómez',
    phone: '+52 55 9876 5432',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    relationship: 'amigo',
    aliases: ['carlos', 'charly', 'gomez'],
    lastActive: 'Hace 20 min',
  },
  {
    id: 'c3',
    name: 'Roberto (Jefe)',
    phone: '+52 55 4567 8901',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    relationship: 'jefe',
    aliases: ['jefe', 'roberto', 'director', 'robert'],
    lastActive: 'Hace 1 hora',
  },
  {
    id: 'c4',
    name: 'Sofía Valdés',
    phone: '+52 55 3344 5566',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    relationship: 'compañera',
    aliases: ['sofia', 'sofi'],
    lastActive: 'Ayer',
  },
  {
    id: 'c5',
    name: 'Dr. Morales (Clínica)',
    phone: '+52 55 7788 9900',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    relationship: 'médico',
    aliases: ['doctor', 'medico', 'clinica', 'morales'],
    lastActive: 'Hace 3 días',
  },
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    contactId: 'c1',
    sender: 'contact',
    platform: 'whatsapp',
    text: 'Hola hijo, ¿vienes a cenar hoy? Avísame con tiempo.',
    timestamp: '11:30 AM',
    status: 'read',
  },
  {
    id: 'm2',
    contactId: 'c1',
    sender: 'user',
    platform: 'whatsapp',
    text: '¡Hola mamá! Sí, saliendo de la oficina paso a verte.',
    timestamp: '11:35 AM',
    status: 'read',
  },
  {
    id: 'm3',
    contactId: 'c2',
    sender: 'contact',
    platform: 'telegram',
    text: '¿Viste el partido anoche? Increíble la jugada final.',
    timestamp: '10:15 AM',
    status: 'read',
  },
  {
    id: 'm4',
    contactId: 'c3',
    sender: 'contact',
    platform: 'whatsapp',
    text: 'Por favor prepara el reporte de métricas para la reunión de mañana.',
    timestamp: '09:00 AM',
    status: 'read',
  },
];

export const INITIAL_TASKS = [
  {
    id: 't1',
    title: 'Revisar informe de métricas trimestrales',
    completed: false,
    priority: 'high' as const,
    category: 'trabajo' as const,
    dueDate: 'Hoy, 5:00 PM',
    createdAt: '2026-08-27T08:00:00Z',
  },
  {
    id: 't2',
    title: 'Comprar café en grano y frutas',
    completed: false,
    priority: 'medium' as const,
    category: 'hogar' as const,
    dueDate: 'Hoy',
    createdAt: '2026-08-27T09:15:00Z',
  },
  {
    id: 't3',
    title: 'Tomar vitamina C y 2L de agua',
    completed: true,
    priority: 'low' as const,
    category: 'salud' as const,
    dueDate: 'Diario',
    createdAt: '2026-08-27T07:30:00Z',
  },
  {
    id: 't4',
    title: 'Confirmar cita dental del viernes',
    completed: false,
    priority: 'medium' as const,
    category: 'salud' as const,
    dueDate: 'Mañana',
    createdAt: '2026-08-27T10:00:00Z',
  },
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Daily Standup con Equipo Dev',
    time: '09:30 AM',
    date: 'Hoy',
    durationMinutes: 30,
    location: 'Google Meet',
  },
  {
    id: 'e2',
    title: 'Reunión de Estrategia con Roberto',
    time: '03:00 PM',
    date: 'Hoy',
    durationMinutes: 45,
    location: 'Sala 402',
  },
  {
    id: 'e3',
    title: 'Sesión de Entrenamiento Gimnasio',
    time: '07:00 PM',
    date: 'Hoy',
    durationMinutes: 60,
    location: 'Sport Club',
  },
];

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'tr1',
    title: 'Midnight Focus Chillout',
    artist: 'Lofi Beats Co.',
    genre: 'Lofi / Study',
    duration: 184,
    coverColor: 'from-indigo-600 to-violet-800',
  },
  {
    id: 'tr2',
    title: 'Ambient Deep Flow',
    artist: 'Neural Soundscapes',
    genre: 'Electronic Ambient',
    duration: 210,
    coverColor: 'from-emerald-600 to-teal-900',
  },
  {
    id: 'tr3',
    title: 'Morning Sun Acoustic',
    artist: 'Warm Waves Collective',
    genre: 'Acoustic / Relax',
    duration: 165,
    coverColor: 'from-amber-500 to-orange-700',
  },
  {
    id: 'tr4',
    title: 'Synthwave Neon Drive',
    artist: 'Retrofutura',
    genre: 'Synthwave',
    duration: 240,
    coverColor: 'from-fuchsia-600 to-pink-900',
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'n1',
    title: 'Ideas de Proyecto Local-First',
    content:
      'Garantizar que todo el procesamiento corra en el dispositivo del usuario. Cero costo de API, total privacidad y latencia cero.',
    tags: ['Arquitectura', 'Privacidad', 'IA'],
    createdAt: '2026-08-26 14:00',
    updatedAt: '2026-08-26 14:00',
  },
  {
    id: 'n2',
    title: 'Contraseña y accesos rápidos',
    content: 'Código de acceso casillero: 7492. Tarjeta del gimnasio guardada en la mochila.',
    tags: ['Personal', 'Claves'],
    createdAt: '2026-08-25 10:20',
    updatedAt: '2026-08-25 10:20',
  },
];

export const INITIAL_DEVICE_STATE: DeviceState = {
  wifi: true,
  bluetooth: true,
  flashlight: false,
  darkMode: false,
  doNotDisturb: false,
  volume: 75,
  brightness: 85,
  battery: 92,
  isCharging: false,
};

export const INITIAL_LEARNED_RULES: LearnedRule[] = [
  {
    id: 'r1',
    triggerPhrase: 'modo concentracion',
    description: 'Activa no molestar, ajusta volumen al 50% y reproduce Midnight Focus',
    actions: [
      { type: 'device', payload: { doNotDisturb: true, volume: 50 } },
      { type: 'music', payload: { trackId: 'tr1', play: true } },
    ],
    usageCount: 8,
    createdAt: '2026-08-20',
    learnedFrom: 'user_explicit',
  },
  {
    id: 'r2',
    triggerPhrase: 'buenas noches',
    description: 'Apaga linterna, activa modo oscuro, activa no molestar y baja brillo al 20%',
    actions: [
      { type: 'device', payload: { flashlight: false, darkMode: true, doNotDisturb: true, brightness: 20 } },
      { type: 'music', payload: { pause: true } },
    ],
    usageCount: 14,
    createdAt: '2026-08-22',
    learnedFrom: 'auto_discovered_habit',
  },
  {
    id: 'r3',
    triggerPhrase: 'modo energia',
    description: 'Enciende linterna, sube volumen al 90% y reproduce Synthwave',
    actions: [
      { type: 'device', payload: { flashlight: true, volume: 90 } },
      { type: 'music', payload: { trackId: 'tr4', play: true } },
    ],
    usageCount: 4,
    createdAt: '2026-08-25',
    learnedFrom: 'user_explicit',
  },
];

export const INITIAL_USER_MEMORIES: UserMemoryFact[] = [
  {
    id: 'mem1',
    key: 'Bebida habitual',
    value: 'Café americano con leche de avena',
    category: 'preference',
    confidence: 1.0,
    learnedAt: '2026-08-21',
  },
  {
    id: 'mem2',
    key: 'Horario de concentración',
    value: '09:00 AM a 12:00 PM',
    category: 'work',
    confidence: 0.95,
    learnedAt: '2026-08-23',
  },
  {
    id: 'mem3',
    key: 'Plataforma de mensajería preferida',
    value: 'WhatsApp para familia, Telegram para amigos',
    category: 'preference',
    confidence: 0.98,
    learnedAt: '2026-08-24',
  },
];

export const INITIAL_SELF_HEALING_LOGS: SelfHealingLog[] = [
  {
    id: 'sh1',
    originalQuery: 'Mándale a mamá que ya salí',
    issue: 'ambiguous_contact',
    diagnosis: 'El usuario dijo "mamá" y se asoció con éxito a Carmen mediante alias aprendido.',
    resolution: 'Alias "mamá" -> Contacto Carmen (+52 55 1234 5678) guardado en memoria permanente.',
    status: 'resolved',
    learnedFix: { alias: { entityType: 'contact', original: 'mamá', mappedTo: 'c1' } },
    timestamp: 'Hace 2 horas',
  },
  {
    id: 'sh2',
    originalQuery: 'Baja la luz de la pantalla',
    issue: 'unrecognized_intent',
    diagnosis: 'Frase "luz de la pantalla" mapeada automáticamente al slot de brillo del dispositivo.',
    resolution: 'Regla de sinonimia agregada: "luz de pantalla" = "brillo".',
    status: 'resolved',
    learnedFix: { alias: { entityType: 'device_slot', original: 'luz de pantalla', mappedTo: 'brightness' } },
    timestamp: 'Ayer',
  },
];
