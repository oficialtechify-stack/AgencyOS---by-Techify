import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  User,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Edit3,
  FileText,
} from 'lucide-react';
import { TimeClockRecord } from '../../types';
import { getRoleBadgeStyle } from '../../lib/timeClockUtils';

interface InspectTimeClockModalProps {
  record: TimeClockRecord | null;
  onClose: () => void;
  onEdit?: (record: TimeClockRecord) => void;
  canEdit?: boolean;
}

export const InspectTimeClockModal: React.FC<InspectTimeClockModalProps> = ({
  record,
  onClose,
  onEdit,
  canEdit = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!record) return null;

  const handleCopyHash = () => {
    if (record.securityHash) {
      navigator.clipboard.writeText(record.securityHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const badge = getRoleBadgeStyle(record.userRole, record.leadershipRole);

  const mapsUrl = record.location?.latitude && record.location?.longitude
    ? `https://www.google.com/maps?q=${record.location.latitude},${record.location.longitude}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Inspeção de Auditoria do Ponto
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                ID: {record.id}
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

        {/* Collaborator Card */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-sm">
              {record.userName?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div>
              <h4 className="text-sm font-black text-white">{record.userName}</h4>
              <p className="text-xs text-neutral-400">{record.userEmail}</p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {record.userRole || 'Colaborador'}
          </span>
        </div>

        {/* Punch Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-[11px] text-neutral-400 block mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Data & Horário Registrado
            </span>
            <div className="text-sm font-black text-white font-mono">
              {record.date} às {record.time}
            </div>
            <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">
              ISO: {record.timestamp}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <span className="text-[11px] text-neutral-400 block mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Tipo & Status
            </span>
            <div className="text-sm font-black text-emerald-400">
              {record.typeLabel || record.type}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded bg-black text-neutral-300 font-mono text-[10px] uppercase font-bold border border-neutral-700">
                {record.status}
              </span>
              {record.scheduledTime && (
                <span className="text-[10px] text-neutral-400 font-mono">
                  Previsto: {record.scheduledTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Security Hash Box */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span className="flex items-center gap-1.5 text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Hash Criptográfico de Segurança
            </span>
            <button
              type="button"
              onClick={handleCopyHash}
              className="text-[11px] text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded-lg transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copiado!' : 'Copiar Hash'}</span>
            </button>
          </div>
          <div className="p-2.5 rounded-xl bg-black/60 font-mono text-[11px] text-emerald-400 break-all border border-emerald-950 select-all">
            {record.securityHash}
          </div>
        </div>

        {/* GPS Geolocation Box */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-neutral-300">
            <span className="flex items-center gap-1.5 text-white">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Geolocalização & Dispositivo
            </span>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Ver no Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-400">
            <div>
              <span className="text-neutral-500 block">Cidade / Local:</span>
              <strong className="text-white">{record.location?.city || 'Auditado via GPS'}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block">Coordenadas:</span>
              <span className="font-mono text-white">
                {record.location?.latitude?.toFixed(5) || 'N/D'},{' '}
                {record.location?.longitude?.toFixed(5) || 'N/D'} (Precisão: ±{record.location?.accuracy || 10}m)
              </span>
            </div>
          </div>
          {record.deviceInfo && (
            <div className="pt-2 border-t border-neutral-900 flex items-center gap-1.5 text-[11px] text-neutral-400">
              <Smartphone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">{record.deviceInfo}</span>
            </div>
          )}
        </div>

        {/* Manual Edit History */}
        {record.isManuallyEdited && (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Registro Alterado Manualmente</span>
            </div>
            <div className="text-neutral-300 space-y-1">
              <div>
                <strong>Alterado por:</strong> {record.editedBy || 'Administrador Master'}
              </div>
              {record.editedAt && (
                <div className="text-[11px] text-neutral-400 font-mono">
                  <strong>Data da Alteração:</strong> {new Date(record.editedAt).toLocaleString('pt-BR')}
                </div>
              )}
              {record.editReason && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-900/40 text-amber-200 mt-1 italic">
                  "{record.editReason}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* General Notes */}
        {record.notes && (
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
            <span className="text-neutral-400 font-bold block mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Observações / Justificativas
            </span>
            <p className="text-neutral-200">{record.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <div>
            {canEdit && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(record);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Este Ponto</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-black transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
