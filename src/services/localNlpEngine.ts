import { Contact, IntentType, LearnedRule, ParsedIntent, Task } from '../types';

// Helper for fuzzy string matching (Levenshtein distance)
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = [];
  for (let i = 0; i <= bn; i++) matrix[i] = [i];
  for (let j = 0; j <= an; j++) matrix[0][j] = j;

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

export function cleanText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents for fuzzy matching
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchContact(
  rawName: string,
  contacts: Contact[],
  learnedAliases: Record<string, string> = {}
): Contact | null {
  const cleaned = cleanText(rawName);
  if (!cleaned) return null;

  // Check learned aliases first
  if (learnedAliases[cleaned]) {
    const aliasedId = learnedAliases[cleaned];
    const found = contacts.find((c) => c.id === aliasedId || cleanText(c.name) === cleanText(aliasedId));
    if (found) return found;
  }

  // Exact match on name or aliases
  for (const c of contacts) {
    if (cleanText(c.name) === cleaned) return c;
    if (cleanText(c.relationship) === cleaned) return c;
    for (const a of c.aliases) {
      if (cleanText(a) === cleaned) return c;
    }
  }

  // Partial substring match
  for (const c of contacts) {
    if (cleanText(c.name).includes(cleaned) || cleaned.includes(cleanText(c.name))) return c;
    for (const a of c.aliases) {
      if (cleanText(a).includes(cleaned) || cleaned.includes(cleanText(a))) return c;
    }
  }

  // Fuzzy Levenshtein match (distance <= 2)
  let bestMatch: Contact | null = null;
  let minDistance = 999;
  for (const c of contacts) {
    const distName = levenshteinDistance(cleanText(c.name), cleaned);
    if (distName <= 2 && distName < minDistance) {
      minDistance = distName;
      bestMatch = c;
    }
    for (const a of c.aliases) {
      const distAlias = levenshteinDistance(cleanText(a), cleaned);
      if (distAlias <= 2 && distAlias < minDistance) {
        minDistance = distAlias;
        bestMatch = c;
      }
    }
  }

  return bestMatch;
}

export class LocalNlpEngine {
  private contacts: Contact[];
  private customRules: LearnedRule[];
  private learnedAliases: Record<string, string>;

  constructor(
    contacts: Contact[] = [],
    customRules: LearnedRule[] = [],
    learnedAliases: Record<string, string> = {}
  ) {
    this.contacts = contacts;
    this.customRules = customRules;
    this.learnedAliases = learnedAliases;
  }

  public updateContext(
    contacts: Contact[],
    customRules: LearnedRule[],
    learnedAliases: Record<string, string>
  ) {
    this.contacts = contacts;
    this.customRules = customRules;
    this.learnedAliases = learnedAliases;
  }

  public parse(rawInput: string): ParsedIntent {
    const raw = rawInput.trim();
    const clean = cleanText(raw);

    if (!clean) {
      return {
        intent: 'UNKNOWN',
        confidence: 0,
        rawText: raw,
        slots: {},
        suggestedFeedback: 'No escuché ningún comando. ¿En qué puedo ayudarte?',
      };
    }

    // 1. Check Custom Learned Rules (Priority 1)
    for (const rule of this.customRules) {
      const trigger = cleanText(rule.triggerPhrase);
      if (clean === trigger || clean.includes(trigger) || trigger.includes(clean)) {
        return {
          intent: 'LEARN_COMMAND',
          confidence: 0.98,
          rawText: raw,
          slots: { ruleId: rule.id, rule },
          suggestedFeedback: `Ejecutando regla aprendida: "${rule.triggerPhrase}"`,
        };
      }
    }

    // 2. Explicit Learning / Rule Creation ("cuando diga X pon Y", "aprende que X significa Y")
    if (
      clean.startsWith('cuando diga') ||
      clean.startsWith('aprende que') ||
      clean.startsWith('ensename a') ||
      clean.includes('nueva regla')
    ) {
      return this.parseLearnCommand(raw, clean);
    }

    // 3. Status & Diagnostic Query ("cuantos tokens", "cuanto has aprendido", "estado del agente")
    if (
      clean.includes('tokens') ||
      clean.includes('cuanto has aprendido') ||
      clean.includes('cuanto aprendiste') ||
      clean.includes('estado del sistema') ||
      clean.includes('nivel de inteligencia') ||
      clean.includes('cuanto ahorre')
    ) {
      return {
        intent: 'QUERY_STATUS',
        confidence: 0.95,
        rawText: raw,
        slots: {},
      };
    }

    // 4. Remember Fact ("recuerda que...", "guarda en memoria...")
    if (clean.startsWith('recuerda que') || clean.startsWith('anota que') || clean.startsWith('guarda que')) {
      const factContent = raw.replace(/^(recuerda que|anota que|guarda que)\s+/i, '').trim();
      return {
        intent: 'REMEMBER_FACT',
        confidence: 0.92,
        rawText: raw,
        slots: { fact: factContent },
      };
    }

    // 5. Query Memory ("que recuerdas de...", "cual es mi...")
    if (clean.startsWith('que recuerdas') || clean.startsWith('cual es mi') || clean.startsWith('que sabes de')) {
      return {
        intent: 'QUERY_MEMORY',
        confidence: 0.88,
        rawText: raw,
        slots: { query: raw },
      };
    }

    // 6. Messages (WhatsApp, Telegram, SMS)
    // Examples: "envia un mensaje a mama diciendo que llego tarde", "escribe a juan te veo manana por whatsapp"
    if (
      clean.includes('mensaje') ||
      clean.includes('whatsapp') ||
      clean.includes('telegram') ||
      clean.startsWith('envia a') ||
      clean.startsWith('manda a') ||
      clean.startsWith('escribe a') ||
      clean.startsWith('chatea con')
    ) {
      return this.parseMessageIntent(raw, clean);
    }

    // 7. Tasks & Reminders
    // Examples: "agrega tarea comprar pan", "recuerdame pagar el agua", "marca como hecha la tarea comprar pan", "cuales son mis tareas"
    if (
      clean.includes('tarea') ||
      clean.includes('recordatorio') ||
      clean.startsWith('recuerdame') ||
      clean.startsWith('anota comprar') ||
      clean.startsWith('anota pagar') ||
      clean.startsWith('anota hacer') ||
      clean.includes('pendiente') ||
      clean.includes('que tengo que hacer') ||
      clean.includes('que pendientes tengo')
    ) {
      return this.parseTaskIntent(raw, clean);
    }

    // 8. Music & Media Player
    // Examples: "pon musica", "reproduce lofi", "pausa la musica", "siguiente cancion", "anterior cancion"
    if (
      clean.includes('musica') ||
      clean.includes('cancion') ||
      clean.includes('reproduce') ||
      clean.includes('spotify') ||
      clean.startsWith('pon ') ||
      clean.startsWith('pausa') ||
      clean.startsWith('deten') ||
      clean.startsWith('siguiente') ||
      clean.startsWith('anterior')
    ) {
      return this.parseMusicIntent(raw, clean);
    }

    // 9. Device Controls (WiFi, Bluetooth, Flashlight, Volume, Brightness, DND)
    if (
      clean.includes('linterna') ||
      clean.includes('wifi') ||
      clean.includes('wi-fi') ||
      clean.includes('bluetooth') ||
      clean.includes('volumen') ||
      clean.includes('brillo') ||
      clean.includes('no molestar') ||
      clean.includes('modo oscuro') ||
      clean.includes('modo claro') ||
      clean.includes('silencio') ||
      clean.includes('bateria')
    ) {
      return this.parseDeviceIntent(raw, clean);
    }

    // 10. Notes
    // Examples: "crea una nota lista de compras", "nueva nota ideas para la reunion"
    if (clean.includes('nota') || clean.startsWith('apunta ')) {
      return this.parseNoteIntent(raw, clean);
    }

    // 11. Calendar & Events
    // Examples: "agenda cita médica mañana a las 4pm", "crea evento reunión de equipo el viernes"
    if (clean.includes('agenda') || clean.includes('evento') || clean.includes('cita') || clean.includes('reunion')) {
      return this.parseCalendarIntent(raw, clean);
    }

    // Fallback: Unknown intent -> suggest auto-healing / learning
    return {
      intent: 'UNKNOWN',
      confidence: 0.25,
      rawText: raw,
      slots: { phrase: raw },
      needsClarification: true,
      clarificationPrompt: `No estoy seguro de cómo procesar "${raw}". ¿Quieres que aprenda qué acción ejecutar cuando digas esto?`,
    };
  }

  private parseMessageIntent(raw: string, clean: string): ParsedIntent {
    let platform: 'whatsapp' | 'telegram' | 'sms' = 'whatsapp';
    if (clean.includes('telegram')) platform = 'telegram';
    else if (clean.includes('sms') || clean.includes('mensaje de texto')) platform = 'sms';

    // Extract contact candidate and message body
    // Patterns like: "envia un mensaje a [CONTACT] diciendo [BODY]", "escribe a [CONTACT] que [BODY]"
    let targetContact: Contact | null = null;
    let messageText = '';

    // Regex matchers
    const patterns = [
      /(?:envia|manda|escribe|chatea)(?:\s+un\s+mensaje)?(?:\s+por\s+\w+)?\s+a\s+([a-záéíóúñ\s]+?)\s+(?:diciendo|que|con\s+el\s+texto|y\s+dile\s+que)\s+(.+)$/i,
      /(?:envia|manda|escribe)\s+a\s+([a-záéíóúñ\s]+?)\s+(.+)$/i,
      /(?:dile\s+a)\s+([a-záéíóúñ\s]+?)\s+(?:que\s+)(.+)$/i,
      /mensaje\s+para\s+([a-záéíóúñ\s]+?)\s+(?:diciendo\s+|que\s+)?(.+)$/i,
    ];

    for (const pattern of patterns) {
      const match = raw.match(pattern);
      if (match && match[1]) {
        const contactQuery = match[1].replace(/por\s+(whatsapp|telegram|sms)/i, '').trim();
        targetContact = matchContact(contactQuery, this.contacts, this.learnedAliases);
        if (match[2]) {
          messageText = match[2].replace(/por\s+(whatsapp|telegram|sms)/i, '').trim();
        }
        break;
      }
    }

    // If contact not found via regex, attempt direct search in contacts
    if (!targetContact) {
      for (const c of this.contacts) {
        if (clean.includes(cleanText(c.name)) || clean.includes(cleanText(c.relationship))) {
          targetContact = c;
          break;
        }
      }
    }

    // Default message if empty
    if (!messageText && targetContact) {
      messageText = '¡Hola! Te contacto a través de mi asistente de voz.';
    }

    if (!targetContact) {
      return {
        intent: 'SEND_MESSAGE',
        confidence: 0.5,
        rawText: raw,
        slots: { platform, text: messageText, missingContact: true },
        needsClarification: true,
        clarificationPrompt: '¿A qué contacto deseas enviar el mensaje?',
      };
    }

    return {
      intent: 'SEND_MESSAGE',
      confidence: 0.94,
      rawText: raw,
      slots: {
        contact: targetContact,
        platform,
        text: messageText,
      },
    };
  }

  private parseTaskIntent(raw: string, clean: string): ParsedIntent {
    // Check if listing tasks
    if (
      clean.includes('cuales son mis tareas') ||
      clean.includes('que tareas tengo') ||
      clean.includes('mostrar tareas') ||
      clean.includes('lista de tareas') ||
      clean.includes('que tengo pendiente')
    ) {
      return {
        intent: 'LIST_TASKS',
        confidence: 0.95,
        rawText: raw,
        slots: {},
      };
    }

    // Check if completing task
    if (clean.startsWith('completa') || clean.startsWith('marca como') || clean.includes('terminada') || clean.includes('hecha')) {
      const taskQuery = raw
        .replace(/(?:completa|marca como hecha|marca como terminada|marca como completada|termina)(?:\s+la\s+tarea)?/i, '')
        .trim();
      return {
        intent: 'COMPLETE_TASK',
        confidence: 0.9,
        rawText: raw,
        slots: { query: taskQuery },
      };
    }

    // Otherwise create task
    let category: Task['category'] = 'personal';
    if (clean.includes('trabajo') || clean.includes('reunion') || clean.includes('informe') || clean.includes('cliente')) {
      category = 'trabajo';
    } else if (clean.includes('casa') || clean.includes('hogar') || clean.includes('comprar') || clean.includes('supermercado')) {
      category = 'hogar';
    } else if (clean.includes('salud') || clean.includes('medico') || clean.includes('pastilla') || clean.includes('ejercicio')) {
      category = 'salud';
    }

    let priority: Task['priority'] = 'medium';
    if (clean.includes('urgente') || clean.includes('prioridad alta') || clean.includes('importante')) {
      priority = 'high';
    } else if (clean.includes('prioridad baja') || clean.includes('cuando pueda')) {
      priority = 'low';
    }

    let title = raw
      .replace(/^(agrega|anota|crea|nueva|recuerdame|pon)\s+(una\s+)?(tarea|recordatorio)?(\s+de|\s+que|\s+para)?/i, '')
      .replace(/con\s+prioridad\s+(alta|media|baja)/i, '')
      .replace(/urgente/i, '')
      .trim();

    if (!title) {
      title = 'Nueva tarea';
    }

    return {
      intent: 'CREATE_TASK',
      confidence: 0.93,
      rawText: raw,
      slots: {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        priority,
        category,
      },
    };
  }

  private parseMusicIntent(raw: string, clean: string): ParsedIntent {
    if (clean.includes('pausa') || clean.includes('deten') || clean.includes('para la musica') || clean.includes('silencia la musica')) {
      return {
        intent: 'PAUSE_MUSIC',
        confidence: 0.96,
        rawText: raw,
        slots: {},
      };
    }

    if (clean.includes('siguiente') || clean.includes('proxima') || clean.includes('pasa cancion')) {
      return {
        intent: 'NEXT_MUSIC',
        confidence: 0.96,
        rawText: raw,
        slots: {},
      };
    }

    if (clean.includes('anterior') || clean.includes('regresa cancion') || clean.includes('vuelve a la')) {
      return {
        intent: 'PREV_MUSIC',
        confidence: 0.96,
        rawText: raw,
        slots: {},
      };
    }

    // Play music or search track/genre
    let query = raw
      .replace(/^(pon|reproduce|toca|escuchar|abrir|reproducir)\s+(musica|cancion|algo|spotify)?(\s+de|\s+para)?/i, '')
      .trim();

    return {
      intent: 'PLAY_MUSIC',
      confidence: 0.92,
      rawText: raw,
      slots: { query: query || 'chill' },
    };
  }

  private parseDeviceIntent(raw: string, clean: string): ParsedIntent {
    const isEnable =
      clean.includes('enciende') ||
      clean.includes('activa') ||
      clean.includes('prende') ||
      clean.includes('sube') ||
      clean.includes('habilita');
    const isDisable =
      clean.includes('apaga') ||
      clean.includes('desactiva') ||
      clean.includes('baja') ||
      clean.includes('deshabilita') ||
      clean.includes('quita');

    if (clean.includes('linterna')) {
      return {
        intent: 'DEVICE_CONTROL',
        confidence: 0.96,
        rawText: raw,
        slots: { feature: 'flashlight', value: isDisable ? false : true },
      };
    }

    if (clean.includes('wifi') || clean.includes('wi-fi')) {
      return {
        intent: 'DEVICE_CONTROL',
        confidence: 0.96,
        rawText: raw,
        slots: { feature: 'wifi', value: isDisable ? false : true },
      };
    }

    if (clean.includes('bluetooth')) {
      return {
        intent: 'DEVICE_CONTROL',
        confidence: 0.96,
        rawText: raw,
        slots: { feature: 'bluetooth', value: isDisable ? false : true },
      };
    }

    if (clean.includes('no molestar') || clean.includes('silencio')) {
      return {
        intent: 'DEVICE_CONTROL',
        confidence: 0.96,
        rawText: raw,
        slots: { feature: 'doNotDisturb', value: isDisable ? false : true },
      };
    }

    if (clean.includes('modo oscuro')) {
      return {
        intent: 'DEVICE_CONTROL',
        confidence: 0.96,
        rawText: raw,
        slots: { feature: 'darkMode', value: isDisable ? false : true },
      };
    }

    if (clean.includes('modo claro')) {
      return {
        intent: 'DEVICE_CONTROL',
        confidence: 0.96,
        rawText: raw,
        slots: { feature: 'darkMode', value: false },
      };
    }

    // Volume level
    if (clean.includes('volumen')) {
      const match = clean.match(/(\d+)/);
      let volume = 75;
      if (match && match[1]) {
        volume = Math.min(100, Math.max(0, parseInt(match[1], 10)));
      } else if (clean.includes('maximo') || clean.includes('todo')) {
        volume = 100;
      } else if (clean.includes('minimo') || clean.includes('mudo')) {
        volume = 0;
      } else if (clean.includes('sube')) {
        volume = 90;
      } else if (clean.includes('baja')) {
        volume = 30;
      }
      return {
        intent: 'DEVICE_CONTROL',
        confidence: 0.95,
        rawText: raw,
        slots: { feature: 'volume', value: volume },
      };
    }

    // Brightness level
    if (clean.includes('brillo')) {
      const match = clean.match(/(\d+)/);
      let brightness = 80;
      if (match && match[1]) {
        brightness = Math.min(100, Math.max(0, parseInt(match[1], 10)));
      } else if (clean.includes('maximo') || clean.includes('todo')) {
        brightness = 100;
      } else if (clean.includes('minimo')) {
        brightness = 15;
      }
      return {
        intent: 'DEVICE_CONTROL',
        confidence: 0.95,
        rawText: raw,
        slots: { feature: 'brightness', value: brightness },
      };
    }

    return {
      intent: 'DEVICE_CONTROL',
      confidence: 0.7,
      rawText: raw,
      slots: { raw },
    };
  }

  private parseNoteIntent(raw: string, clean: string): ParsedIntent {
    let content = raw
      .replace(/^(crea|nueva|anota|guarda|apunta)\s+(una\s+)?(nota)?(\s+con|\s+de|\s+que)?/i, '')
      .trim();

    return {
      intent: 'CREATE_NOTE',
      confidence: 0.91,
      rawText: raw,
      slots: {
        title: content.slice(0, 30) || 'Nota rápida',
        content: content || 'Nota grabada por voz',
      },
    };
  }

  private parseCalendarIntent(raw: string, clean: string): ParsedIntent {
    let title = raw
      .replace(/^(agenda|crea|agrega)\s+(un\s+)?(evento|cita|reunion)?(\s+de|\s+para|\s+con)?/i, '')
      .trim();

    let time = '10:00 AM';
    if (clean.includes('tarde') || clean.includes('pm')) time = '03:00 PM';
    if (clean.includes('manana') || clean.includes('am')) time = '09:00 AM';

    const matchTime = clean.match(/(\d+)(?::(\d+))?\s*(am|pm)?/);
    if (matchTime) {
      const hour = matchTime[1];
      const min = matchTime[2] || '00';
      const meridian = matchTime[3] ? matchTime[3].toUpperCase() : 'PM';
      time = `${hour}:${min} ${meridian}`;
    }

    return {
      intent: 'CREATE_EVENT',
      confidence: 0.9,
      rawText: raw,
      slots: {
        title: title || 'Nueva reunión',
        time,
        date: clean.includes('manana') ? 'Mañana' : 'Hoy',
        durationMinutes: 45,
      },
    };
  }

  private parseLearnCommand(raw: string, clean: string): ParsedIntent {
    // Pattern: "cuando diga [TRIGGER] [ACTION]"
    const match = raw.match(/cuando\s+diga\s+["']?([^"']+)["']?\s+(?:haz|ejecuta|pon|activa|desactiva|manda)\s+(.+)/i);
    if (match) {
      const trigger = match[1].trim();
      const actionText = match[2].trim();
      return {
        intent: 'LEARN_COMMAND',
        confidence: 0.95,
        rawText: raw,
        slots: {
          isNewRule: true,
          trigger,
          actionText,
        },
      };
    }

    return {
      intent: 'LEARN_COMMAND',
      confidence: 0.8,
      rawText: raw,
      slots: { raw },
    };
  }
}
