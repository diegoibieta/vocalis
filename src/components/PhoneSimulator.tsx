import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  CheckSquare,
  Music,
  Calendar,
  FileText,
  Sliders,
  Send,
  Plus,
  Trash2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Bluetooth,
  Flashlight,
  Moon,
  Sun,
  BellOff,
  Battery,
  Phone,
  Search,
  CheckCircle,
  Clock,
  Tag,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { AppTab, Contact, Priority, Task } from '../types';

export const PhoneSimulator: React.FC = () => {
  const {
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
  } = useAgent();

  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0] || null);
  const [chatInput, setChatInput] = useState('');
  const [chatPlatform, setChatPlatform] = useState<'whatsapp' | 'telegram' | 'sms'>('whatsapp');

  // Task creation state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('personal');

  // Note creation state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Event creation state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('11:00 AM');

  // Live phone clock
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedContact) return;
    sendMessage(selectedContact.id, chatInput, chatPlatform);
    setChatInput('');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, newTaskPriority, newTaskCategory);
    setNewTaskTitle('');
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;
    addNote(newNoteTitle || 'Nota sin título', newNoteContent || '', ['Voz', 'Personal']);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    addEvent({
      title: newEventTitle,
      time: newEventTime,
      date: 'Hoy',
      durationMinutes: 45,
    });
    setNewEventTitle('');
  };

  // Filter messages for selected contact
  const currentMessages = messages.filter((m) => m.contactId === selectedContact?.id);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Smartphone Frame Container */}
      <div className="w-full max-w-md bg-slate-900 text-slate-100 rounded-[38px] p-3 shadow-2xl border-4 border-slate-700/60 relative overflow-hidden flex flex-col min-h-[640px] max-h-[720px]">
        {/* Flashlight screen effect if active */}
        {deviceState.flashlight && (
          <div className="absolute inset-0 bg-amber-100/10 pointer-events-none z-40 border-4 border-amber-300/40 rounded-[34px] animate-pulse" />
        )}

        {/* Top Phone Header / Dynamic Island & Status Bar */}
        <div className="w-full pt-1.5 pb-2 px-4 flex items-center justify-between text-xs select-none border-b border-slate-800 shrink-0">
          <span className="font-semibold text-slate-200 tracking-tight">{currentTime || '12:00 PM'}</span>

          {/* Dynamic Island Pill */}
          <div className="h-4 w-24 bg-black rounded-full flex items-center justify-center gap-1.5 px-2">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Status Icons */}
          <div className="flex items-center gap-1.5 text-slate-300">
            {deviceState.doNotDisturb && <BellOff className="h-3 w-3 text-rose-400" />}
            {deviceState.wifi ? (
              <Wifi className="h-3 w-3 text-emerald-400" />
            ) : (
              <WifiOff className="h-3 w-3 text-slate-500" />
            )}
            {deviceState.bluetooth && <Bluetooth className="h-3 w-3 text-indigo-400" />}
            <div className="flex items-center gap-0.5 text-[10px] font-mono">
              <span>{deviceState.battery}%</span>
              <Battery className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* App Content Window */}
        <div className="flex-1 overflow-y-auto p-3 bg-slate-950/70 rounded-2xl my-2 flex flex-col">
          {/* TAB 1: MENSAJES */}
          {activeTab === 'messages' && (
            <div className="flex-1 flex flex-col">
              {/* Contact header picker */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 shrink-0">
                {contacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs shrink-0 transition-colors cursor-pointer ${
                      selectedContact?.id === c.id
                        ? 'bg-indigo-600 text-white font-medium shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <img src={c.avatar} alt={c.name} className="w-4 h-4 rounded-full object-cover" />
                    <span>{c.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Chat Header info */}
              {selectedContact && (
                <div className="py-2 px-1 flex items-center justify-between border-b border-slate-800/80 shrink-0">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedContact.avatar}
                      alt={selectedContact.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-white leading-tight">
                        {selectedContact.name}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {selectedContact.relationship} • {selectedContact.phone}
                      </p>
                    </div>
                  </div>

                  {/* Platform tag */}
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold uppercase">
                      {chatPlatform}
                    </span>
                  </div>
                </div>
              )}

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 flex flex-col justify-end">
                {currentMessages.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No hay mensajes recientes con este contacto.
                    <p className="text-[11px] text-indigo-400 mt-1">
                      Di por voz: "Envía un mensaje a {selectedContact?.name.split(' ')[0]}..."
                    </p>
                  </div>
                ) : (
                  currentMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[82%] text-xs ${
                        m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      <div
                        className={`px-3 py-2 rounded-2xl ${
                          m.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-xs'
                            : 'bg-slate-800 text-slate-200 rounded-tl-xs border border-slate-700'
                        }`}
                      >
                        <p className="leading-relaxed">{m.text}</p>
                      </div>
                      <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                        {m.timestamp} • {m.platform}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChatMessage} className="pt-2 border-t border-slate-800 flex gap-1.5 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Escribir a ${selectedContact?.name.split(' ')[0]}...`}
                  className="flex-1 bg-slate-900 text-xs text-white rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: TAREAS */}
          {activeTab === 'tasks' && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Tareas & Recordatorios
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {tasks.filter((t) => !t.completed).length} pendientes
                  </span>
                </div>
                <span className="text-[10px] bg-slate-800 text-indigo-400 px-2 py-0.5 rounded-full font-mono">
                  Sincronizado Local
                </span>
              </div>

              {/* Task list */}
              <div className="flex-1 overflow-y-auto py-2.5 space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-xl border transition-all flex items-start justify-between gap-2 text-xs ${
                      task.completed
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-0.5 h-4 w-4 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-600 hover:border-indigo-400'
                        }`}
                      >
                        {task.completed && <CheckCircle className="h-3 w-3" />}
                      </button>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                          <span
                            className={`px-1.5 py-0.2 rounded font-semibold uppercase ${
                              task.priority === 'high'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : task.priority === 'medium'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-slate-500">#{task.category}</span>
                          {task.dueDate && <span className="text-slate-400">• {task.dueDate}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-600 hover:text-rose-400 p-1 cursor-pointer"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick Add Task Form */}
              <form onSubmit={handleCreateTask} className="pt-2 border-t border-slate-800 flex gap-1.5 shrink-0">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Añadir tarea (o dicta por voz)..."
                  className="flex-1 bg-slate-900 text-xs text-white rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <select
                  aria-label="Prioridad de la tarea"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                  className="bg-slate-900 text-[11px] text-slate-300 rounded-xl px-2 py-2 border border-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: MUSICA & SPOTIFY */}
          {activeTab === 'music' && (
            <div className="flex-1 flex flex-col justify-between">
              {/* Media Art & Player */}
              <div className="flex flex-col items-center py-3">
                <div
                  className={`w-36 h-36 rounded-2xl bg-gradient-to-tr ${currentTrack.coverColor} shadow-lg flex flex-col items-center justify-center p-4 relative overflow-hidden transition-all duration-300`}
                >
                  <Music className={`h-12 w-12 text-white/90 ${isPlayingMusic ? 'animate-bounce' : ''}`} />
                  {isPlayingMusic && (
                    <div className="absolute bottom-2 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-white/80 rounded-full animate-pulse"
                          style={{ height: `${Math.random() * 12 + 6}px`, animationDelay: `${i * 100}ms` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-center mt-3">
                  <h4 className="text-sm font-bold text-white">{currentTrack.title}</h4>
                  <p className="text-xs text-slate-400">{currentTrack.artist}</p>
                  <span className="inline-block mt-1 text-[10px] text-indigo-300 bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded-full font-medium">
                    {currentTrack.genre}
                  </span>
                </div>
              </div>

              {/* Progress bar simulation */}
              <div className="w-full px-2">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: isPlayingMusic ? '48%' : '20%' }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>{isPlayingMusic ? '1:24' : '0:00'}</span>
                  <span>
                    {Math.floor(currentTrack.duration / 60)}:
                    {(currentTrack.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-center gap-4 py-2">
                <button
                  onClick={prevTrack}
                  className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <SkipBack className="h-5 w-5" />
                </button>
                <button
                  onClick={isPlayingMusic ? pauseTrack : () => playTrack(currentTrackIndex)}
                  className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer"
                >
                  {isPlayingMusic ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
                </button>
                <button
                  onClick={nextTrack}
                  className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <SkipForward className="h-5 w-5" />
                </button>
              </div>

              {/* Track Playlist list */}
              <div className="border-t border-slate-800 pt-2 space-y-1 overflow-y-auto max-h-32">
                {tracks.map((track, idx) => (
                  <button
                    key={track.id}
                    onClick={() => playTrack(idx)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      currentTrackIndex === idx
                        ? 'bg-indigo-950/70 text-indigo-300 font-semibold'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] text-slate-600 font-mono">{idx + 1}</span>
                      <span className="truncate">{track.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CALENDARIO */}
          {activeTab === 'calendar' && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Agenda del Día
                </h3>
                <span className="text-[10px] text-slate-400">Hoy, 27 de Agosto</span>
              </div>

              <div className="flex-1 overflow-y-auto py-2 space-y-2">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2.5 text-xs"
                  >
                    <div className="px-2 py-1 bg-indigo-950 text-indigo-300 rounded-lg text-center font-mono shrink-0">
                      <span className="block font-bold leading-none">{ev.time.split(' ')[0]}</span>
                      <span className="text-[9px] text-slate-400">{ev.time.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-200">{ev.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {ev.durationMinutes} min • {ev.location || 'Local'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Event Add form */}
              <form onSubmit={handleCreateEvent} className="pt-2 border-t border-slate-800 flex gap-1.5 shrink-0">
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Nuevo evento..."
                  className="flex-1 bg-slate-900 text-xs text-white rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  placeholder="Hora"
                  className="w-20 bg-slate-900 text-xs text-white rounded-xl px-2 py-2 border border-slate-800 text-center"
                />
                <button
                  type="submit"
                  disabled={!newEventTitle.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: NOTAS */}
          {activeTab === 'notes' && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Notas Privadas
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono">100% En Dispositivo</span>
              </div>

              <div className="flex-1 overflow-y-auto py-2 space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-1 text-xs relative group"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-200">{note.title}</h4>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-slate-600 hover:text-rose-400 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{note.content}</p>
                    <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-800/60 text-[9px] text-slate-500">
                      <div className="flex items-center gap-1">
                        {note.tags.map((t, i) => (
                          <span key={i} className="bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span>{note.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleCreateNote} className="pt-2 border-t border-slate-800 flex flex-col gap-1.5 shrink-0">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Título de la nota..."
                  className="w-full bg-slate-900 text-xs text-white rounded-xl px-3 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Contenido de la nota..."
                    className="flex-1 bg-slate-900 text-xs text-white rounded-xl px-3 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteTitle.trim() && !newNoteContent.trim()}
                    className="px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: CENTRO DE CONTROL DEL DISPOSITIVO */}
          {activeTab === 'device' && (
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
                  Centro de Control
                </h3>

                {/* 2x2 Toggle Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {/* Wi-Fi */}
                  <button
                    onClick={() => toggleDeviceFeature('wifi')}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      deviceState.wifi
                        ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      <span className="text-xs font-semibold">Wi-Fi</span>
                    </div>
                    <span className="text-[10px] font-mono">{deviceState.wifi ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Bluetooth */}
                  <button
                    onClick={() => toggleDeviceFeature('bluetooth')}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      deviceState.bluetooth
                        ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Bluetooth className="h-4 w-4" />
                      <span className="text-xs font-semibold">Bluetooth</span>
                    </div>
                    <span className="text-[10px] font-mono">{deviceState.bluetooth ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Linterna */}
                  <button
                    onClick={() => toggleDeviceFeature('flashlight')}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      deviceState.flashlight
                        ? 'bg-amber-500/30 border-amber-400 text-amber-300 ring-2 ring-amber-400/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Flashlight className="h-4 w-4" />
                      <span className="text-xs font-semibold">Linterna</span>
                    </div>
                    <span className="text-[10px] font-mono">{deviceState.flashlight ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* No Molestar */}
                  <button
                    onClick={() => toggleDeviceFeature('doNotDisturb')}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      deviceState.doNotDisturb
                        ? 'bg-purple-600/30 border-purple-500/60 text-purple-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BellOff className="h-4 w-4" />
                      <span className="text-xs font-semibold">No Molestar</span>
                    </div>
                    <span className="text-[10px] font-mono">{deviceState.doNotDisturb ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                {/* Sliders for Volume & Brightness */}
                <div className="mt-4 space-y-3">
                  {/* Volume */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Volume2 className="h-4 w-4 text-indigo-400" />
                        <span>Volumen Multimedia</span>
                      </div>
                      <span className="font-mono text-[11px]">{deviceState.volume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={deviceState.volume}
                      onChange={(e) => setDeviceVolume(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Brightness */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Sun className="h-4 w-4 text-amber-400" />
                        <span>Brillo de Pantalla</span>
                      </div>
                      <span className="font-mono text-[11px]">{deviceState.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={deviceState.brightness}
                      onChange={(e) => setDeviceBrightness(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center mt-2">
                Controlable por voz: "Enciende la linterna", "Sube el volumen al 90%".
              </p>
            </div>
          )}
        </div>

        {/* Bottom Phone App Dock / Switcher */}
        <div className="w-full pt-1 px-2 flex items-center justify-around border-t border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('messages')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
              activeTab === 'messages' ? 'text-indigo-400 bg-slate-800' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-[9px] font-medium">Chats</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
              activeTab === 'tasks' ? 'text-indigo-400 bg-slate-800' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span className="text-[9px] font-medium">Tareas</span>
          </button>

          <button
            onClick={() => setActiveTab('music')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
              activeTab === 'music' ? 'text-indigo-400 bg-slate-800' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Music className="h-4 w-4" />
            <span className="text-[9px] font-medium">Música</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
              activeTab === 'calendar' ? 'text-indigo-400 bg-slate-800' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span className="text-[9px] font-medium">Agenda</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
              activeTab === 'notes' ? 'text-indigo-400 bg-slate-800' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span className="text-[9px] font-medium">Notas</span>
          </button>

          <button
            onClick={() => setActiveTab('device')}
            className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
              activeTab === 'device' ? 'text-indigo-400 bg-slate-800' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span className="text-[9px] font-medium">Control</span>
          </button>
        </div>
      </div>
    </div>
  );
};
