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
    if (onAddTask) {
      onAddTask({
        title: title.trim(),
        client: client.trim() || 'Interno',
        description: description.trim() || 'Sem descrição.',
        status: 'Backlog',
        priority,
      });
    }
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
    <div className="space-y-6 text-neutral-200 font-sans max-w-7xl mx-auto pb-16">
      {/* Top Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {columns.map((col) => (
          <div key={col} className="p-4 rounded-xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
            <div className="text-xs font-bold text-neutral-400">{col}</div>
            <div className="text-2xl font-black text-white">{getTaskCount(col)}</div>
          </div>
        ))}
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Kanban className="w-5 h-5 text-white" /> Projetos & Demandas
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
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
              className="p-3.5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 flex flex-col min-h-[400px] space-y-3"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="font-bold text-white text-xs">{col}</span>
                <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-[10px] text-white font-bold">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="p-4 text-center text-[11px] text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                    Nenhum projeto
                  </div>
                ) : (
                  colTasks.map((t) => {
                    const prev = getPrevStatus(t.status);
                    const next = getNextStatus(t.status);
                    return (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 hover:border-neutral-700 transition-colors shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">
                            {t.client}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-neutral-900 text-neutral-200 border border-neutral-700">
                            {t.priority}
                          </span>
                        </div>

                        <div className="font-bold text-white text-xs">{t.title}</div>
                        <p className="text-[11px] text-neutral-400 leading-snug">{t.description}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                          <div className="flex items-center gap-1">
                            {prev && (
                              <button
                                onClick={() => onUpdateTaskStatus && onUpdateTaskStatus(t.id, prev)}
                                title={`Mover para ${prev}`}
                                className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 cursor-pointer"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {next && (
                              <button
                                onClick={() => onUpdateTaskStatus && onUpdateTaskStatus(t.id, next)}
                                title={`Mover para ${next}`}
                                className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => onDeleteTask && onDeleteTask(t.id)}
                            className="p-1 text-neutral-500 hover:text-white cursor-pointer"
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
          <div className="w-full max-w-md bg-[#0e0e0e] border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Criar Novo Projeto / Tarefa</h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Título do Projeto</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Refatoração do Funil de Vendas"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Cliente / Conta</label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Ex: Cliente Alpha"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-white"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes da entrega..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
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
