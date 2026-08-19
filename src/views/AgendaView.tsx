import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Clock, Video, UserCheck, CheckCircle2 } from 'lucide-react';
import { CalendarEvent } from '../types';

interface AgendaViewProps {
  events?: CalendarEvent[];
  onAddEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent?: (id: string) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ events = [], onAddEvent, onDeleteEvent }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [type, setType] = useState<'Apresentação' | 'Alinhamento' | 'Fechamento' | 'Outro'>('Apresentação');
  const [meetUrl, setMeetUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (onAddEvent) {
      onAddEvent({
        title: title.trim(),
        client: client.trim() || 'Cliente Prospect',
        date,
        time,
        type,
        meetUrl: meetUrl.trim() || 'https://meet.google.com/new',
        status: 'Agendado',
      });
    }

    setShowModal(false);
    setTitle('');
    setClient('');
    setMeetUrl('');
  };

  const sortedEvents = [...events].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  return (
    <div className="space-y-6 text-neutral-200 font-sans max-w-7xl mx-auto pb-16">
      {/* Notice & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-neutral-300 font-bold text-xs">
            <CalendarIcon className="w-4 h-4 text-white" /> AGENDA E REUNIÕES COM CLIENTES
          </div>
          <h2 className="text-lg font-extrabold text-white">Cronograma de Pitches & Alinhamentos</h2>
          <p className="text-xs text-neutral-400">
            Organize reuniões de demonstração da plataforma, onboarding e fechamento de contratos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md whitespace-nowrap cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" /> + Agendar Reunião
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedEvents.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-neutral-500 bg-[#0e0e0e] border border-neutral-800 rounded-2xl">
            Nenhuma reunião agendada na agenda.
          </div>
        ) : (
          sortedEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 hover:border-neutral-700 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded font-bold bg-neutral-900 border border-neutral-700 text-neutral-200">
                    {ev.type}
                  </span>
                  <span className="text-neutral-400 font-bold text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    {ev.date} às {ev.time}
                  </span>
                </div>

                <h4 className="font-extrabold text-white text-sm">{ev.title}</h4>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <UserCheck className="w-3.5 h-3.5 text-white" />
                  <span>{ev.client}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                <a
                  href={ev.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-white text-neutral-300 hover:text-black font-bold text-xs flex items-center gap-1.5 border border-neutral-700 transition-colors"
                >
                  <Video className="w-3.5 h-3.5" /> Entrar na Sala
                </a>

                <button
                  onClick={() => onDeleteEvent && onDeleteEvent(ev.id)}
                  className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                  title="Excluir reunião"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e0e0e] border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Agendar Reunião com Cliente</h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Título da Reunião</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Demonstração da Plataforma"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Cliente / Empresa</label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Ex: Cliente Alpha"
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
                <label className="block text-neutral-300 font-bold mb-1">Tipo de Reunião</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-white"
                >
                  <option value="Apresentação">Apresentação & Pitch</option>
                  <option value="Alinhamento">Alinhamento Estratégico</option>
                  <option value="Fechamento">Fechamento de Contrato</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Link do Google Meet / Zoom</label>
                <input
                  type="url"
                  value={meetUrl}
                  onChange={(e) => setMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold cursor-pointer"
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
