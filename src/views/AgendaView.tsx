import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  Video,
  UserCheck,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  X,
} from 'lucide-react';
import { CalendarEvent } from '../types';
import {
  listGoogleCalendarEvents,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  convertGoogleEventToAgendaEvent,
} from '../lib/googleCalendar';
import {
  connectGoogleCalendar,
  getCachedGoogleAccessToken,
  setCachedGoogleAccessToken,
  auth,
} from '../lib/firebase';

interface AgendaViewProps {
  events?: CalendarEvent[];
  onAddEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent?: (id: string) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  events = [],
  onAddEvent,
  onDeleteEvent,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [type, setType] = useState<'Apresentação' | 'Alinhamento' | 'Fechamento' | 'Reunião' | 'Entrega' | 'Outro'>('Apresentação');
  const [meetUrl, setMeetUrl] = useState('');
  const [syncWithGoogleCheck, setSyncWithGoogleCheck] = useState(true);

  // Google Calendar Integration State
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(!!getCachedGoogleAccessToken());
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([]);

  // Deletion confirmation modal for destructive operations
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const token = getCachedGoogleAccessToken();
    if (token) {
      setIsGoogleConnected(true);
      fetchGoogleEvents(token);
    }
  }, []);

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    setSyncStatusMsg(null);
    try {
      const token = await connectGoogleCalendar();
      if (token) {
        setIsGoogleConnected(true);
        setSyncStatusMsg('Conectado ao Google Calendar com sucesso!');
        await fetchGoogleEvents(token);
      }
    } catch (err: any) {
      console.error('Falha ao conectar Google Calendar:', err);
      setSyncStatusMsg(
        err?.message?.includes('popup')
          ? 'Pop-up de autenticação bloqueada ou fechada. Tente novamente.'
          : 'Erro ao autenticar com o Google Calendar.'
      );
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogle = () => {
    setCachedGoogleAccessToken(null);
    setIsGoogleConnected(false);
    setGoogleEvents([]);
    setSyncStatusMsg('Google Calendar desconectado nesta sessão.');
  };

  const fetchGoogleEvents = async (token?: string) => {
    const activeToken = token || getCachedGoogleAccessToken();
    if (!activeToken) return;

    setIsSyncing(true);
    try {
      const gEvents = await listGoogleCalendarEvents(activeToken);
      const converted = gEvents.map(convertGoogleEventToAgendaEvent);
      setGoogleEvents(converted);
      setSyncStatusMsg(`Sincronizados ${converted.length} eventos do seu Google Calendar.`);
    } catch (err: any) {
      console.error('Erro ao sincronizar do Google Calendar:', err);
      if (err?.message?.includes('401')) {
        setIsGoogleConnected(false);
        setCachedGoogleAccessToken(null);
        setSyncStatusMsg('Sessão do Google Calendar expirada. Por favor, conecte novamente.');
      } else {
        setSyncStatusMsg('Não foi possível sincronizar os eventos do Google Calendar.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let createdGoogleEventId: string | undefined = undefined;
    let createdHtmlLink: string | undefined = undefined;

    const token = getCachedGoogleAccessToken();
    if (syncWithGoogleCheck && token) {
      try {
        const gEvent = await createGoogleCalendarEvent(token, {
          title: title.trim(),
          client: client.trim() || 'Cliente Prospect',
          date,
          time,
          meetUrl: meetUrl.trim() || 'https://meet.google.com/new',
        });
        createdGoogleEventId = gEvent.id;
        createdHtmlLink = gEvent.htmlLink;
      } catch (err) {
        console.error('Erro ao salvar no Google Calendar:', err);
      }
    }

    if (onAddEvent) {
      onAddEvent({
        title: title.trim(),
        client: client.trim() || 'Cliente Prospect',
        date,
        time,
        type,
        meetUrl: meetUrl.trim() || 'https://meet.google.com/new',
        status: createdGoogleEventId ? 'Sincronizado' : 'Agendado',
        googleEventId: createdGoogleEventId,
        htmlLink: createdHtmlLink,
        syncWithGoogle: !!createdGoogleEventId,
      });
    }

    setShowModal(false);
    setTitle('');
    setClient('');
    setMeetUrl('');

    if (token) {
      fetchGoogleEvents(token);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      const token = getCachedGoogleAccessToken();
      // If event belongs to Google Calendar or was synced with Google
      const gId = eventToDelete.googleEventId || (eventToDelete.id.startsWith('gcal-') ? eventToDelete.id.replace('gcal-', '') : null);

      if (gId && token) {
        try {
          await deleteGoogleCalendarEvent(token, gId);
        } catch (err) {
          console.warn('Erro ao remover do Google Calendar:', err);
        }
      }

      if (eventToDelete.id.startsWith('gcal-')) {
        // Local state event from Google
        setGoogleEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
      } else if (onDeleteEvent) {
        onDeleteEvent(eventToDelete.id);
      }
    } finally {
      setIsDeleting(false);
      setEventToDelete(null);
    }
  };

  // Merge agency local events and fetched google events, avoiding duplicates by googleEventId
  const allEvents = [...events];
  googleEvents.forEach((ge) => {
    const alreadyExists = allEvents.some(
      (e) => e.googleEventId === ge.googleEventId || e.id === ge.id
    );
    if (!alreadyExists) {
      allEvents.push(ge);
    }
  });

  const sortedEvents = [...allEvents].sort(
    (a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  );

  return (
    <div className="space-y-6 text-neutral-200 font-sans max-w-7xl mx-auto pb-16">
      {/* Top Banner / Integration Bar */}
      <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-neutral-300 font-bold text-xs">
              <CalendarIcon className="w-4 h-4 text-white" /> AGENDA E REUNIÕES COM CLIENTES
            </div>
            <h2 className="text-xl font-extrabold text-white">Cronograma & Google Calendar</h2>
            <p className="text-xs text-neutral-400">
              Sincronize reuniões de demonstração, pitches comerciais e fechamentos de contratos diretamente com sua conta Google.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isGoogleConnected ? (
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={isConnectingGoogle}
                className="gsi-material-button px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                <div className="w-4 h-4 shrink-0">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span>{isConnectingGoogle ? 'Conectando...' : 'Conectar Google Calendar'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Google Calendar Conectado</span>
                </div>
                <button
                  type="button"
                  onClick={() => fetchGoogleEvents()}
                  disabled={isSyncing}
                  className="p-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Atualizar eventos do Google Calendar"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectGoogle}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs transition-colors cursor-pointer"
                >
                  Desconectar
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-white text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md whitespace-nowrap cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> + Agendar Reunião
            </button>
          </div>
        </div>

        {syncStatusMsg && (
          <div className="text-xs px-3 py-2 rounded-xl bg-neutral-900/90 border border-neutral-800 text-neutral-300 flex items-center justify-between">
            <span>{syncStatusMsg}</span>
            <button
              type="button"
              onClick={() => setSyncStatusMsg(null)}
              className="text-neutral-500 hover:text-white ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedEvents.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-neutral-400 bg-[#0e0e0e] border border-neutral-800 rounded-2xl space-y-3">
            <CalendarIcon className="w-8 h-8 mx-auto text-neutral-600 stroke-1" />
            <p className="font-semibold text-neutral-300">Nenhuma reunião agendada no momento.</p>
            <p className="text-neutral-500 max-w-sm mx-auto">
              Clique em "+ Agendar Reunião" para marcar um compromisso ou conecte seu Google Calendar para sincronizar seus eventos existentes.
            </p>
          </div>
        ) : (
          sortedEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 hover:border-neutral-700 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="px-2 py-0.5 rounded font-bold bg-neutral-900 border border-neutral-700 text-neutral-200 truncate">
                    {ev.type || 'Reunião'}
                  </span>
                  <div className="flex items-center gap-1.5 text-neutral-400 font-bold text-[11px] shrink-0">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    {ev.date} às {ev.time}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-extrabold text-white text-sm leading-snug">{ev.title}</h4>
                  {(ev.googleEventId || ev.syncWithGoogle || ev.id.startsWith('gcal-')) && (
                    <span
                      title="Sincronizado com o Google Calendar"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/20 shrink-0"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Google
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <UserCheck className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                  <span className="truncate">{ev.client}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800 gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={ev.meetUrl || 'https://meet.google.com/new'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-white text-neutral-300 hover:text-black font-bold text-xs flex items-center gap-1.5 border border-neutral-700 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" /> Entrar na Sala
                  </a>

                  {ev.htmlLink && (
                    <a
                      href={ev.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                      title="Abrir no Google Calendar"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setEventToDelete(ev)}
                  className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                  title="Excluir reunião"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Dialog for Destructive Delete (Mandatory for Workspace APIs) */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#121212] border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Confirmar Exclusão de Reunião</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Você tem certeza de que deseja excluir o compromisso{' '}
              <strong className="text-white">"{eventToDelete.title}"</strong> ({eventToDelete.date} às {eventToDelete.time})?
              {eventToDelete.googleEventId || eventToDelete.id.startsWith('gcal-') ? (
                <span className="block mt-2 text-neutral-400">
                  Esta ação também removerá o evento correspondente do seu <strong>Google Calendar</strong>.
                </span>
              ) : null}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteEvent}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Excluindo...' : 'Confirmar e Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e0e0e] border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Agendar Reunião</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Título da Reunião</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Demonstração da Plataforma / Pitch"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Cliente / Prospect</label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Ex: Clínica Alpha / Dr. Silva"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Tipo de Compromisso</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-white"
                >
                  <option value="Apresentação">Apresentação & Pitch</option>
                  <option value="Alinhamento">Alinhamento Estratégico</option>
                  <option value="Fechamento">Fechamento de Contrato</option>
                  <option value="Reunião">Reunião Geral</option>
                  <option value="Entrega">Entrega de Projeto / Campanha</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Link do Google Meet / Zoom</label>
                <input
                  type="url"
                  value={meetUrl}
                  onChange={(e) => setMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/new"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              {isGoogleConnected && (
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-neutral-300 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncWithGoogleCheck}
                      onChange={(e) => setSyncWithGoogleCheck(e.target.checked)}
                      className="rounded border-neutral-700 text-white focus:ring-0 cursor-pointer"
                    />
                    <span>Sincronizar e criar no meu Google Calendar</span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold cursor-pointer transition-all"
                >
                  Salvar Reunião
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
