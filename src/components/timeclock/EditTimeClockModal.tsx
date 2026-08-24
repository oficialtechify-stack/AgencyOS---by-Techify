import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Clock,
  Calendar,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { EmployeeWorkSchedule, TimeClockRecord, TimeClockType } from '../../types';

interface EditTimeClockModalProps {
  record: TimeClockRecord | null;
  onClose: () => void;
  onSave: (id: string, updatedData: Partial<TimeClockRecord>) => Promise<void>;
  employeeWorkSchedules?: EmployeeWorkSchedule[];
  currentAdminName?: string;
}

export const EditTimeClockModal: React.FC<EditTimeClockModalProps> = ({
  record,
  onClose,
  onSave,
  employeeWorkSchedules = [],
  currentAdminName = 'Administrador Master',
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<TimeClockType>('entry');
  const [status, setStatus] = useState<'regular' | 'late' | 'overtime' | 'early_departure'>('regular');
  const [scheduledTime, setScheduledTime] = useState('');
  const [editReason, setEditReason] = useState('');
  const [notes, setNotes] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setDate(record.date || '');
      // Format time to HH:mm:ss or HH:mm
      setTime(record.time || '');
      setType(record.type || 'entry');
      setStatus(record.status || 'regular');
      setScheduledTime(record.scheduledTime || '');
      setEditReason(record.editReason || '');
      setNotes(record.notes || '');
      setUserName(record.userName || '');
      setUserEmail(record.userEmail || '');
      setUserRole(record.userRole || '');
      setErrorMessage(null);
    }
  }, [record]);

  if (!record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setErrorMessage('Por favor, informe a data e o horário do ponto.');
      return;
    }

    if (!editReason.trim()) {
      setErrorMessage('Informe a justificativa/motivo desta alteração de ponto.');
      return;
    }

    // Determine typeLabel
    let typeLabel = record.typeLabel;
    if (type === 'entry') typeLabel = '1. Entrada da Manhã';
    else if (type === 'lunch_start') typeLabel = '2. Saída Almoço';
    else if (type === 'lunch_end') typeLabel = '3. Retorno Almoço';
    else if (type === 'exit') typeLabel = '4. Saída Expediente';
    else if (type === 'overtime_in') typeLabel = '5. Início Horas Extras';
    else if (type === 'overtime_out') typeLabel = '6. Término Horas Extras';

    try {
      setSaving(true);
      const updatedFields: Partial<TimeClockRecord> = {
        date,
        time: time.length === 5 ? `${time}:00` : time,
        type,
        typeLabel,
        status,
        scheduledTime: scheduledTime || undefined,
        editReason: editReason.trim(),
        notes: notes.trim(),
        userName,
        userEmail,
        userRole,
        isManuallyEdited: true,
        editedBy: currentAdminName,
        editedAt: new Date().toISOString(),
      };

      await onSave(record.id, updatedFields);
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar edição do ponto:', err);
      setErrorMessage('Erro ao salvar alteração. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Editar Registro de Ponto
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  Master Admin
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Ajuste horários, datas e status de conformidade deste registro.
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
            Esta edição ficará registrada com o carimbo de data e hora do Gestor Master (
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
          {/* Colaborador Info */}
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-3">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Colaborador Vinculado
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Nome do Colaborador</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  placeholder="Nome do colaborador"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">E-mail</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  placeholder="email@empresa.com"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Cargo Oficial</label>
              <input
                type="text"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                placeholder="Ex: Gestor de Tráfego, Designer, SDR..."
              />
            </div>
          </div>

          {/* Date & Time Settings */}
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
                Horário Registrado (HH:mm:ss)
              </label>
              <input
                type="text"
                required
                placeholder="08:00:00"
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
                onChange={(e) => setType(e.target.value as TimeClockType)}
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
                <option value="overtime">Horas Extras</option>
                <option value="early_departure">Saída Antecipada</option>
              </select>
            </div>
          </div>

          {/* Scheduled Time */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1.5">
              Horário Previsto na Escala (Opcional)
            </label>
            <input
              type="text"
              placeholder="08:00"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
            />
          </div>

          {/* Justification of Edit (Required) */}
          <div>
            <label className="text-xs font-bold text-amber-300 block mb-1.5 flex items-center justify-between">
              <span>Motivo / Justificativa da Alteração (Obrigatório) *</span>
              <span className="text-[10px] text-neutral-400 font-normal">Auditado</span>
            </label>
            <textarea
              required
              rows={2}
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="Ex: Correção de batida esquecida pelo colaborador; autorização concedida pela diretoria..."
              className="w-full bg-neutral-950 border border-amber-800/60 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="text-xs font-bold text-neutral-400 block mb-1">
              Observações Gerais (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas gerais sobre o ponto..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
            />
          </div>

          {/* Hash & Security info readonly */}
          <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/60 text-[11px] font-mono text-neutral-500 space-y-1">
            <div className="flex justify-between">
              <span>Hash Original:</span>
              <span className="text-neutral-400 font-bold">{record.securityHash}</span>
            </div>
            {record.isManuallyEdited && (
              <div className="flex justify-between text-amber-400/80">
                <span>Última edição:</span>
                <span>
                  {record.editedBy} ({new Date(record.editedAt || '').toLocaleString('pt-BR')})
                </span>
              </div>
            )}
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
              <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
