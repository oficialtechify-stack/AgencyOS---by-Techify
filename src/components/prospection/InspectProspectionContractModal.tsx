import React from 'react';
import {
  X,
  FileText,
  Instagram,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  User,
  Package,
  ExternalLink,
  Video,
  CheckCircle2,
  Image as ImageIcon,
  Share2,
  Sparkles,
} from 'lucide-react';
import { ProspectionClosedContract, ProspectionContractStatus, UserProfile } from '../../types';

interface InspectProspectionContractModalProps {
  contract: ProspectionClosedContract | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onUpdateStatus: (contractId: string, status: ProspectionContractStatus) => void;
  onEdit: (contract: ProspectionClosedContract) => void;
}

export const InspectProspectionContractModal: React.FC<InspectProspectionContractModalProps> = ({
  contract,
  isOpen,
  onClose,
  currentUser,
  onUpdateStatus,
  onEdit,
}) => {
  if (!isOpen || !contract) return null;

  const getInstagramUrl = (handleOrUrl: string) => {
    if (!handleOrUrl) return '#';
    const clean = handleOrUrl.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    const cleanHandle = clean.replace(/^@+/, '').replace(/^instagram\.com\//, '').replace(/\/$/, '');
    return `https://www.instagram.com/${cleanHandle}/`;
  };

  const getWhatsAppUrl = (phone?: string, companyName?: string) => {
    if (!phone) return '#';
    const digits = phone.replace(/\D/g, '');
    const fullNumber = digits.startsWith('55') ? digits : `55${digits}`;
    const text = encodeURIComponent(
      `Olá ${contract.contactPerson || ''}! Tudo bem? Falando da Techify Agency sobre o andamento do seu contrato.`
    );
    return `https://wa.me/${fullNumber}?text=${text}`;
  };

  const getStatusBadge = (st: ProspectionContractStatus) => {
    switch (st) {
      case 'contatado':
        return { label: '📞 Contatado', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'em_analise':
        return { label: '🔍 Em Análise', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'fazer_reuniao':
        return { label: '📅 Fazer Reunião', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'proposta_enviada':
        return { label: '📑 Proposta Enviada', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'contrato_fechado':
        return { label: '💎 Contrato Fechado', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'onboarding_iniciado':
        return { label: '🚀 Onboarding Iniciado', bg: 'bg-green-500/20 text-green-300 border-green-500/40' };
      default:
        return { label: st, bg: 'bg-neutral-800 text-neutral-300 border-neutral-700' };
    }
  };

  const badge = getStatusBadge(contract.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0e0e0e] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-start justify-between bg-neutral-900/60">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badge.bg}`}>
                  {badge.label}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-[10px] font-semibold text-neutral-300">
                  {contract.recurringType}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">{contract.clientName}</h2>
              <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-neutral-500" /> {contract.segment}
                </span>
                <span>•</span>
                <span>{contract.city}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Card de Faturamento e Funcionário que Fechou */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valor do Contrato */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-[11px] font-black uppercase tracking-wider">Valor do Contrato Fechado</span>
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black text-white">
                  R$ {contract.dealValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-xs text-emerald-300 font-semibold">{contract.recurringType}</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-2 pt-2 border-t border-emerald-950 flex items-center justify-between">
                <span>Pagamento: <strong>{contract.paymentMethod || 'Pix'}</strong></span>
                <span>Assinado em: <strong>{contract.signedDate ? new Date(contract.signedDate).toLocaleDateString('pt-BR') : '—'}</strong></span>
              </div>
            </div>

            {/* Funcionário Responsável */}
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-400">
                <span className="text-[11px] font-black uppercase tracking-wider">Convertido por (Prospecção)</span>
                <User className="w-5 h-5" />
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shrink-0">
                  {contract.closingEmployeeName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <strong className="text-sm font-black text-white block truncate">{contract.closingEmployeeName}</strong>
                  <span className="text-xs text-blue-300 font-medium block truncate">{contract.closingEmployeeRole}</span>
                  <span className="text-[11px] text-neutral-400 block truncate">{contract.closingEmployeeEmail}</span>
                </div>
              </div>
              <div className="text-[10px] text-blue-400/80 mt-2 pt-2 border-t border-blue-950 font-bold">
                ⭐ Contabilizado em tempo real na performance do time
              </div>
            </div>
          </div>

          {/* Solução Contratada (Pacote / Serviço) */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
              Solução / Pacote Techify Contratado:
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-sm font-bold text-white">
                  {contract.contractType === 'Pacote Completo' ? contract.packageName : contract.individualService}
                </strong>
                <span className="text-xs text-neutral-400 block">
                  Tipo: {contract.contractType}
                </span>
              </div>
            </div>
          </div>

          {/* Links: Instagram & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={getInstagramUrl(contract.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-pink-950/20 border border-pink-500/30 hover:border-pink-500 text-pink-300 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-pink-400" />
                <div>
                  <span className="text-[10px] text-pink-400 uppercase font-black block">Instagram</span>
                  <span className="text-xs font-bold text-white group-hover:underline">{contract.instagram}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-pink-400" />
            </a>

            {contract.phone ? (
              <a
                href={getWhatsAppUrl(contract.phone, contract.clientName)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-green-950/20 border border-green-500/30 hover:border-green-500 text-green-300 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-green-400" />
                  <div>
                    <span className="text-[10px] text-green-400 uppercase font-black block">WhatsApp</span>
                    <span className="text-xs font-bold text-white group-hover:underline">{contract.phone}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-green-400" />
              </a>
            ) : (
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-500 text-xs flex items-center gap-2">
                <Phone className="w-4 h-4" /> Telefone não informado
              </div>
            )}
          </div>

          {/* Reunião Agendada / Meet Link */}
          {contract.meetingDate && (
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-cyan-400">
                <span className="text-xs font-black uppercase flex items-center gap-1.5">
                  <Video className="w-4 h-4" /> Reunião / Kickoff Agendado
                </span>
                <span className="text-xs font-bold">
                  {new Date(contract.meetingDate).toLocaleDateString('pt-BR')}{' '}
                  {contract.meetingTime ? `às ${contract.meetingTime}` : ''}
                </span>
              </div>
              {contract.meetingLink && (
                <a
                  href={contract.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  <Video className="w-3.5 h-3.5" /> Acessar Sala Google Meet
                </a>
              )}
              {contract.meetingNotes && (
                <p className="text-xs text-neutral-300 mt-1">{contract.meetingNotes}</p>
              )}
            </div>
          )}

          {/* Imagem / Comprovante Anexado */}
          {contract.contractImageUrl && (
            <div className="space-y-2">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                Comprovante / Print do Contrato:
              </span>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
                <img
                  src={contract.contractImageUrl}
                  alt="Comprovante do Contrato"
                  className="max-h-72 w-auto mx-auto rounded-lg object-contain border border-neutral-700 shadow-lg"
                />
              </div>
            </div>
          )}

          {/* Observações */}
          {contract.notes && (
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                Observações do Fechamento:
              </span>
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                {contract.notes}
              </div>
            </div>
          )}

          {/* Alterar Status Rápido */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <span className="text-xs font-bold text-white block">Atualizar Status da Esteira Comercial:</span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { val: 'contatado', label: 'Contatado' },
                  { val: 'em_analise', label: 'Em Análise' },
                  { val: 'fazer_reuniao', label: 'Fazer Reunião' },
                  { val: 'proposta_enviada', label: 'Proposta Enviada' },
                  { val: 'contrato_fechado', label: 'Contrato Fechado' },
                  { val: 'onboarding_iniciado', label: 'Onboarding Iniciado' },
                ] as const
              ).map((st) => (
                <button
                  key={st.val}
                  onClick={() => onUpdateStatus(contract.id, st.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    contract.status === st.val
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-900/80 border-t border-neutral-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <button
            onClick={() => {
              onClose();
              onEdit(contract);
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Editar Dados do Contrato
          </button>
        </div>
      </div>
    </div>
  );
};
