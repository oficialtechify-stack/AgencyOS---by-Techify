import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  User,
  X,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Lock,
  Sparkles,
} from 'lucide-react';
import { EmployeeWorkSchedule } from '../../types';
import { getRoleBadgeStyle } from '../../lib/timeClockUtils';

interface EmployeeScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: EmployeeWorkSchedule[];
  onSaveSchedule: (schedule: EmployeeWorkSchedule) => Promise<void>;
  onDeleteSchedule?: (id: string) => Promise<void>;
}

export const EmployeeScheduleModal: React.FC<EmployeeScheduleModalProps> = ({
  isOpen,
  onClose,
  schedules,
  onSaveSchedule,
  onDeleteSchedule,
}) => {
  const [selectedSchedule, setSelectedSchedule] = useState<EmployeeWorkSchedule | null>(
    schedules[0] || null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('Colaborador');
  const [entryTime, setEntryTime] = useState('08:00');
  const [lunchStartTime, setLunchStartTime] = useState('12:00');
  const [lunchEndTime, setLunchEndTime] = useState('13:00');
  const [exitTime, setExitTime] = useState('17:00');
  const [toleranceMinutes, setToleranceMinutes] = useState(15);
  const [strictEnforcement, setStrictEnforcement] = useState(true);
  const [minIntervalMinutes, setMinIntervalMinutes] = useState(5);
  const [allowOvertime, setAllowOvertime] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSelect = (s: EmployeeWorkSchedule) => {
    setSelectedSchedule(s);
    setIsCreating(false);
    setUserEmail(s.userEmail);
    setUserName(s.userName);
    setUserRole(s.userRole);
    setEntryTime(s.entryTime || '08:00');
    setLunchStartTime(s.lunchStartTime || '12:00');
    setLunchEndTime(s.lunchEndTime || '13:00');
    setExitTime(s.exitTime || '17:00');
    setToleranceMinutes(s.toleranceMinutes ?? 15);
    setStrictEnforcement(s.strictEnforcement ?? true);
    setMinIntervalMinutes(s.minIntervalMinutes ?? 5);
    setAllowOvertime(s.allowOvertime ?? false);
    setNotes(s.notes || '');
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedSchedule(null);
    setUserEmail('');
    setUserName('');
    setUserRole('Gestor de Tráfego');
    setEntryTime('08:00');
    setLunchStartTime('12:00');
    setLunchEndTime('13:00');
    setExitTime('17:00');
    setToleranceMinutes(15);
    setStrictEnforcement(true);
    setMinIntervalMinutes(5);
    setAllowOvertime(false);
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      alert('Preencha o e-mail do colaborador.');
      return;
    }
    setSaving(true);
    setSuccessMsg(null);

    const updated: EmployeeWorkSchedule = {
      id: selectedSchedule?.id || `sched-${Date.now()}`,
      userEmail: userEmail.trim().toLowerCase(),
      userName: userName.trim() || 'Colaborador',
      userRole: userRole.trim() || 'Equipe',
      entryTime,
      lunchStartTime,
      lunchEndTime,
      exitTime,
      toleranceMinutes: Number(toleranceMinutes),
      strictEnforcement,
      minIntervalMinutes: Number(minIntervalMinutes),
      workDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
      allowOvertime,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSaveSchedule(updated);
      setSuccessMsg('✅ Escala e horários vinculados salvos com sucesso!');
      setSelectedSchedule(updated);
      setIsCreating(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Error saving schedule:', err);
      alert('Erro ao salvar escala: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0c10] border border-neutral-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col text-neutral-200 font-sans my-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center font-black shadow-md">
              <Clock className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Gestão de Horários e Escalas por Colaborador</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Bloqueio Estrito
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Defina a hora certa exata de entrada, almoço e saída para cada colaborador com trava anti-fraude.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
          {/* Left Column: List of Schedules */}
          <div className="w-full lg:w-80 border-r border-neutral-800 bg-neutral-950/40 p-4 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Colaboradores ({schedules.length})
              </span>
              <button
                type="button"
                onClick={handleStartCreate}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-black flex items-center gap-1 cursor-pointer shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Vincular Novo
              </button>
            </div>

            <div className="space-y-2">
              {schedules.map((s) => {
                const isSelected = !isCreating && selectedSchedule?.id === s.id;
                const badge = getRoleBadgeStyle(s.userRole, s.leadershipRole);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelect(s)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-800/90 border-white text-white shadow-md'
                        : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-300 hover:bg-neutral-800/40 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-white truncate max-w-[160px]">
                        {s.userName}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${badge.bg} ${badge.text} ${badge.border}`}>
                        {s.userRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mb-2">{s.userEmail}</p>

                    <div className="flex items-center justify-between text-[11px] font-mono bg-black/40 px-2 py-1 rounded-lg border border-neutral-800">
                      <span>{s.entryTime || '08:00'}</span>
                      <span className="text-neutral-500">→</span>
                      <span>{s.lunchStartTime || '12:00'}</span>
                      <span className="text-neutral-500">→</span>
                      <span>{s.exitTime || '17:00'}</span>
                    </div>

                    {s.strictEnforcement && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                        <Lock className="w-3 h-3" />
                        Trava de horário ativada (±{s.toleranceMinutes}m)
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Edit / Create Form */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto">
            {successMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  {isCreating ? 'Vincular Horário a Novo Colaborador' : `Configurar Horários: ${userName || userEmail}`}
                </h4>
                {!isCreating && onDeleteSchedule && selectedSchedule && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Deseja remover a escala personalizada de ${userName}?`)) {
                        onDeleteSchedule(selectedSchedule.id);
                        setSelectedSchedule(null);
                      }
                    }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover Escala
                  </button>
                )}
              </div>

              {/* Colaborador Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                    Nome Completo do Funcionário *
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ex: Carlos Oliveira"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                    E-mail Cadastrado *
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="colaborador@agencyos.com"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                    Cargo / Função Oficial *
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
                  >
                    <option value="Diretor Executivo / Master">Diretor Executivo / Master</option>
                    <option value="Líder de Marketing & Tráfego">Líder de Marketing & Tráfego</option>
                    <option value="Líder de Prospecção / SDR">Líder de Prospecção / SDR</option>
                    <option value="Líder de Design & Criação">Líder de Design & Criação</option>
                    <option value="Gestor de Tráfego Pago">Gestor de Tráfego Pago</option>
                    <option value="SDR / Pré-vendas">SDR / Pré-vendas</option>
                    <option value="Closer Comercial B2B">Closer Comercial B2B</option>
                    <option value="Designer Gráfico">Designer Gráfico</option>
                    <option value="Social Media & Copywriter">Social Media & Copywriter</option>
                    <option value="Assistente de Operações">Assistente de Operações</option>
                  </select>
                </div>
              </div>

              {/* Shift Schedule Grid */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Jornada de Trabalho Vinculada (Hora Certa Obrigatória)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1">
                      1. Entrada da Manhã
                    </label>
                    <input
                      type="time"
                      value={entryTime}
                      onChange={(e) => setEntryTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-mono text-white text-center focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1">
                      2. Saída Almoço
                    </label>
                    <input
                      type="time"
                      value={lunchStartTime}
                      onChange={(e) => setLunchStartTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-mono text-white text-center focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1">
                      3. Retorno Almoço
                    </label>
                    <input
                      type="time"
                      value={lunchEndTime}
                      onChange={(e) => setLunchEndTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-mono text-white text-center focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1">
                      4. Saída Expediente
                    </label>
                    <input
                      type="time"
                      value={exitTime}
                      onChange={(e) => setExitTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-mono text-white text-center focus:outline-none focus:border-white"
                    />
                  </div>
                </div>
              </div>

              {/* Security & Strict Punch Rules */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Travas de Segurança e Anti-Fraude
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1">
                      Tolerância de Janela (± minutos)
                    </label>
                    <select
                      value={toleranceMinutes}
                      onChange={(e) => setToleranceMinutes(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
                    >
                      <option value={5}>± 5 minutos (Super Rígido)</option>
                      <option value={10}>± 10 minutos (Recomendado)</option>
                      <option value={15}>± 15 minutos (Padrão CLT)</option>
                      <option value={30}>± 30 minutos (Flexível)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 mb-1">
                      Intervalo Mínimo entre Batidas Consecutivas
                    </label>
                    <select
                      value={minIntervalMinutes}
                      onChange={(e) => setMinIntervalMinutes(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
                    >
                      <option value={3}>3 minutos</option>
                      <option value={5}>5 minutos (Recomendado)</option>
                      <option value={10}>10 minutos</option>
                      <option value={15}>15 minutos</option>
                    </select>
                  </div>
                </div>

                {/* Checkbox Strict Enforcement */}
                <label className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-neutral-800 cursor-pointer hover:border-neutral-700">
                  <input
                    type="checkbox"
                    checked={strictEnforcement}
                    onChange={(e) => setStrictEnforcement(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-white bg-neutral-900 border-neutral-700 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Bloqueio Estrito: Só permitir bater na hora vinculada
                    </span>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">
                      Se desativado, permite bater fora do horário marcando como atraso/adiantado. Se ativado,
                      o sistema bloqueia o registro fora da janela configurada.
                    </span>
                  </div>
                </label>

                {/* Checkbox Allow Overtime */}
                <label className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-neutral-800 cursor-pointer hover:border-neutral-700">
                  <input
                    type="checkbox"
                    checked={allowOvertime}
                    onChange={(e) => setAllowOvertime(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-white bg-neutral-900 border-neutral-700 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Permitir Registro de Horas Extras após expediente
                    </span>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">
                      Habilita o 5º e 6º botões de Início e Fim de Hora Extra para este colaborador.
                    </span>
                  </div>
                </label>
              </div>

              {/* Submit Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer transition-all"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Salvando...' : 'Salvar Escala Vinculada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
