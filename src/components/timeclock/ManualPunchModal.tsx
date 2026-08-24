import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Clock,
  Calendar,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { EmployeeWorkSchedule, TimeClockRecord, TimeClockType } from '../../types';

interface ManualPunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<TimeClockRecord>) => Promise<void>;
  employeeWorkSchedules?: EmployeeWorkSchedule[];
  currentAdminName?: string;
}

export const ManualPunchModal: React.FC<ManualPunchModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeWorkSchedules = [],
  currentAdminName = 'Administrador Master',
}) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
    employeeWorkSchedules[0]?.id || ''
  );
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState('');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [type, setType] = useState<TimeClockType>('entry');
  const [status, setStatus] = useState<'regular' | 'late' | 'overtime' | 'early_departure'>('regular');
  const [scheduledTime, setScheduledTime] = useState('08:00');
  const [justification, setJustification] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedSchedule = employeeWorkSchedules.find((s) => s.id === selectedScheduleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const empName = selectedSchedule?.userName || customName.trim();
    const empEmail = selectedSchedule?.userEmail || customEmail.trim();
    const empRole = selectedSchedule?.userRole || customRole.trim() || 'Colaborador';

    if (!empName || !empEmail) {
      setErrorMessage('Por favor, selecione ou informe o colaborador.');
      return;
    }

    if (!date || !time) {
      setErrorMessage('Informe a data e o horário do ponto.');
      return;
    }

    if (!justification.trim()) {
      setErrorMessage('A justificativa administrativa é obrigatória para inclusão manual.');
      return;
    }

    let typeLabel = '1. Entrada da Manhã';
    if (type === 'lunch_start') typeLabel = '2. Saída Almoço';
    else if (type === 'lunch_end') typeLabel = '3. Retorno Almoço';
    else if (type === 'exit') typeLabel = '4. Saída Expediente';
    else if (type === 'overtime_in') typeLabel = '5. Início Horas Extras';
    else if (type === 'overtime_out') typeLabel = '6. Término Horas Extras';

    const cleanTime = time.length === 5 ? `${time}:00` : time;
    const isoTimestamp = `${date}T${cleanTime}.000Z`;

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const securityHash = `MANUAL-AUDIT-${empName.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;

    try {
      setSaving(true);
      const newRecord: Partial<TimeClockRecord> = {
        id: `punch-manual-${Date.now()}`,
        userId: empEmail,
        userEmail: empEmail,
        userName: empName,
        userRole: empRole,
        type,
        typeLabel,
        date,
        time: cleanTime,
        timestamp: isoTimestamp,
        status,
        scheduledTime: scheduledTime || undefined,
        notes: notes ? `${justification} | ${notes}` : justification,
        editReason: justification,
        securityHash,
        deviceInfo: `Inclusão Manual pelo Gestor (${currentAdminName})`,
        isManuallyEdited: true,
        editedBy: currentAdminName,
        editedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await onSave(newRecord);
      onClose();
    } catch (err: any) {
      console.error('Erro ao adicionar ponto manual:', err);
      setErrorMessage('Erro ao salvar o ponto. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Adicionar Ponto Manual
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Master Admin
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Inclusão retroativa ou correção de batida esquecida por colaborador.
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

        {/* Audit Warning */}
        <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs flex items-start gap-2.5 text-neutral-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">Auditoria de Segurança Ativa</span>
            O registro será criado com status auditado e vinculado à assinatura do Gestor Master (
            <strong className="text-emerald-400">{currentAdminName}</strong>).
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Collaborator */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              Colaborador da Agência
            </label>
            <select
              value={selectedScheduleId}
              onChange={(e) => {
                setSelectedScheduleId(e.target.value);
                const s = employeeWorkSchedules.find((x) => x.id === e.target.value);
                if (s) {
                  setScheduledTime(s.entryTime);
                }
              }}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
            >
              {employeeWorkSchedules.map((sched) => (
                <option key={sched.id} value={sched.id}>
                  {sched.userName} ({sched.userRole}) - {sched.userEmail}
                </option>
              ))}
              <option value="custom">+ Outro Colaborador (Digitar Manualmente)</option>
            </select>
          </div>

          {selectedScheduleId === 'custom' && (
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Nome do colaborador"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="email@empresa.com"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Cargo Oficial</label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Ex: Gestor de Tráfego, Designer..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Data do Ponto
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                Horário da Batida
              </label>
              <input
                type="time"
                step="1"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white font-mono font-bold"
              />
            </div>
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">Tipo da Batida</label>
              <select
                value={type}
                onChange={(e) => {
                  const t = e.target.value as TimeClockType;
                  setType(t);
                  if (selectedSchedule) {
                    if (t === 'entry') setScheduledTime(selectedSchedule.entryTime);
                    else if (t === 'lunch_start') setScheduledTime(selectedSchedule.lunchStartTime);
                    else if (t === 'lunch_end') setScheduledTime(selectedSchedule.lunchEndTime);
                    else if (t === 'exit') setScheduledTime(selectedSchedule.exitTime);
                  }
                }}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="entry">1. Entrada da Manhã</option>
                <option value="lunch_start">2. Saída Almoço</option>
                <option value="lunch_end">3. Retorno Almoço</option>
                <option value="exit">4. Saída Expediente</option>
                <option value="overtime_in">5. Início Horas Extras</option>
                <option value="overtime_out">6. Término Horas Extras</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">Status de Conformidade</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'regular' | 'late' | 'overtime' | 'early_departure')
                }
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="regular">Regular (No Horário)</option>
                <option value="late">Atraso</option>
                <option value="overtime">Horas Extras Autorizadas</option>
                <option value="early_departure">Saída Antecipada</option>
              </select>
            </div>
          </div>

          {/* Scheduled Reference Time */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1.5">
              Horário Previsto na Escala
            </label>
            <input
              type="text"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              placeholder="08:00"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
            />
          </div>

          {/* Justification Required */}
          <div>
            <label className="text-xs font-bold text-amber-300 block mb-1.5 flex items-center justify-between">
              <span>Justificativa Administrativa (Obrigatória) *</span>
              <span className="text-[10px] text-neutral-400 font-normal">Auditado</span>
            </label>
            <textarea
              required
              rows={2}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Ex: Registro manual realizado após confirmação de presença em evento corporativo / reunião externa..."
              className="w-full bg-neutral-950 border border-amber-800/60 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-black transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>{saving ? 'Registrando...' : 'Registrar Ponto Manual'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
