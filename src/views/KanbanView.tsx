import React, { useState } from 'react';
import { Kanban, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { KanbanTask } from '../types';

interface KanbanViewProps {
  tasks?: KanbanTask[];
  onAddTask?: (task: Omit<KanbanTask, 'id'>) => void;
  onUpdateTaskStatus?: (id: string, status: KanbanTask['status']) => void;
  onDeleteTask?: (id: string) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks = [],
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta'>('Média');

  const columns: KanbanTask['status'][] = ['Backlog', 'Em Andamento', 'Revisão', 'Concluído'];

  const getTaskCount = (status: KanbanTask['status']) =>
    tasks.filter((t) => t.status === status).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title: title.trim(),
      client: client.trim() || 'Interno',
      description: description.trim() || 'Sem descrição.',
      status: 'Backlog',
      priority,
    });
    setShowModal(false);
    setTitle('');
    setClient('');
    setDescription('');
  };

  const getNextStatus = (current: KanbanTask['status']): KanbanTask['status'] | null => {
    const idx = columns.indexOf(current);
    if (idx < columns.length - 1) return columns[idx + 1];
    return null;
  };

  const getPrevStatus = (current: KanbanTask['status']): KanbanTask['status'] | null => {
    const idx = columns.indexOf(current);
    if (idx > 0) return columns[idx - 1];
    return null;
  };

  return (
    <div className="space-y-6 text-gray-200">
      {/* Top Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {columns.map((col) => (
          <div key={col} className="p-4 rounded-xl bg-[#12141c] border border-[#1e2332] space-y-1">
            <div className="text-xs font-bold text-gray-400">{col}</div>
            <div className="text-2xl font-black text-white">{getTaskCount(col)}</div>
          </div>
        ))}
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Kanban className="w-5 h-5 text-[#22c55e]" /> Projetos & Demandas
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> + Novo Projeto
        </button>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          return (
            <div
              key={col}
              className="p-3.5 rounded-2xl bg-[#12141c] border border-[#1e2332] flex flex-col min-h-[400px] space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#1f2434] pb-2">
                <span className="font-bold text-white text-xs">{col}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#181a26] text-[10px] text-[#22c55e] font-bold">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="p-4 text-center text-[11px] text-gray-600 border border-dashed border-[#1f2434] rounded-xl">
                    Nenhum projeto
                  </div>
                ) : (
                  colTasks.map((t) => {
                    const prev = getPrevStatus(t.status);
                    const next = getNextStatus(t.status);
                    return (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-[#181a26] border border-[#272d3f] space-y-2 hover:border-[#22c55e]/40 transition-colors shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#22c55e] uppercase">
                            {t.client}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              t.priority === 'Alta'
                                ? 'bg-red-950 text-red-400'
                                : t.priority === 'Média'
                                ? 'bg-yellow-950 text-yellow-400'
                                : 'bg-blue-950 text-blue-400'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>

                        <div className="font-bold text-white text-xs">{t.title}</div>
                        <p className="text-[11px] text-gray-400 leading-snug">{t.description}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-[#222736]">
                          <div className="flex items-center gap-1">
                            {prev && (
                              <button
                                onClick={() => onUpdateTaskStatus(t.id, prev)}
                                title={`Mover para ${prev}`}
                                className="p-1 rounded bg-[#202536] hover:bg-[#2c3348] text-gray-300"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {next && (
                              <button
                                onClick={() => onUpdateTaskStatus(t.id, next)}
                                title={`Mover para ${next}`}
                                className="p-1 rounded bg-[#202536] hover:bg-[#2c3348] text-[#22c55e]"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => onDeleteTask(t.id)}
                            className="p-1 text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#11131c] border border-[#22c55e]/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Criar Novo Projeto / Tarefa</h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Título do Projeto</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Refatoração do Funil de Vendas"
                  className="w-full bg-[#181a26] border border-[#2a2f44] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Cliente / Conta</label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Ex: Reteteu Comida Honesta"
                  className="w-full bg-[#181a26] border border-[#2a2f44] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-[#181a26] border border-[#2a2f44] rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes da entrega..."
                  className="w-full bg-[#181a26] border border-[#2a2f44] rounded-xl p-3 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1e2332] text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold"
                >
                  Criar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
