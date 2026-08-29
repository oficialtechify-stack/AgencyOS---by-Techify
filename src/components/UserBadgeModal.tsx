import React from 'react';
import {
  X,
  User,
  MessageSquare,
  Instagram,
  Mail,
  Phone,
  Clock,
  Sparkles,
  Shield,
  Briefcase,
  Check,
  Copy,
} from 'lucide-react';
import { FirestoreUserProfile, cleanAvatarUrl, resolveUserAvatar } from '../lib/firebase';
import { TimeClockRecord } from '../types';

interface UserBadgeModalProps {
  user: FirestoreUserProfile | null;
  onClose: () => void;
  onStartChat?: (user: FirestoreUserProfile) => void;
  timeClockRecords?: TimeClockRecord[];
}

export const UserBadgeModal: React.FC<UserBadgeModalProps> = ({
  user,
  onClose,
  onStartChat,
  timeClockRecords = [],
}) => {
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  if (!user) return null;

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // Resolve department label and style
  const getDepartmentInfo = (dept?: string, role?: string) => {
    const raw = (dept || role || '').toLowerCase();
    if (raw.includes('design') || raw.includes('criativ') || raw.includes('arte')) {
      return { label: 'Design & Criativos', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' };
    }
    if (raw.includes('mkt') || raw.includes('marketing')) {
      return { label: 'Marketing & Performance', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    }
    if (raw.includes('prospec') || raw.includes('sdr') || raw.includes('closer') || raw.includes('comercial')) {
      return { label: 'Prospecção Comercial', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
    if (raw.includes('trafego') || raw.includes('tráfego') || raw.includes('ads') || raw.includes('gestor')) {
      return { label: 'Tráfego Pago & Ads', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    }
    if (raw.includes('tech') || raw.includes('dev') || raw.includes('sistemas')) {
      return { label: 'Tech & Desenvolvimento', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
    }
    return { label: 'Gestão & Diretoria', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
  };

  const deptInfo = getDepartmentInfo(user.department, user.role);

  // Compute time clock records for today
  const d = new Date();
  const localToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const isoToday = d.toISOString().split('T')[0];
  const targetEmail = (user.email || '').toLowerCase().trim();

  const userTodayRecords = timeClockRecords
    .filter(
      (r) =>
        (r.date === localToday || r.date === isoToday) &&
        (r.userEmail || '').toLowerCase().trim() === targetEmail
    )
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  // Determine presence status
  const getWorkStatusDetails = () => {
    if (user.status === 'blocked' || user.status === 'cancelled') {
      return {
        label: 'Inativo',
        color: 'text-neutral-500 bg-neutral-800 border-neutral-700',
        dot: 'bg-neutral-500',
      };
    }
    if (userTodayRecords.length === 0) {
      if (user.workStatus === 'busy') {
        return {
          label: 'Focado / Ocupado',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          dot: 'bg-rose-400',
        };
      }
      return {
        label: 'Ativo',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        dot: 'bg-emerald-400 animate-pulse',
      };
    }
    const count = userTodayRecords.length;
    if (count % 2 === 1) {
      return {
        label: 'Presente no Trabalho',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        dot: 'bg-emerald-400 animate-pulse',
      };
    } else if (count === 2) {
      return {
        label: 'Em Horário de Almoço',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        dot: 'bg-amber-400',
      };
    } else {
      return {
        label: 'Expediente Finalizado',
        color: 'text-neutral-400 bg-neutral-800 border-neutral-700',
        dot: 'bg-neutral-400',
      };
    }
  };

  const statusDetails = getWorkStatusDetails();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#18181b] via-[#111113] to-[#0a0a0c] border-2 border-purple-500/40 shadow-2xl shadow-purple-950/40 overflow-hidden text-white animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top ambient decorative glow */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge Card Container */}
        <div className="p-6 sm:p-7 relative z-10 space-y-6">
          {/* Header of the Official Badge */}
          <div className="flex items-center justify-between border-b border-neutral-800/90 pb-4 pr-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-black font-black text-sm flex items-center justify-center shadow-lg shrink-0">
                T
              </div>
              <div>
                <span className="text-xs font-black tracking-wider text-white uppercase block">
                  TECHIFY AGENCYOS
                </span>
                <span className="text-[9px] text-neutral-400 font-bold tracking-widest uppercase block">
                  CRACHÁ OFICIAL DE COLABORADOR
                </span>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 border shadow-sm ${statusDetails.color}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusDetails.dot}`} />
              <span>{statusDetails.label}</span>
            </span>
          </div>

          {/* User Main Identity (Avatar + Name + Role + Dept) */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
            {/* Avatar Frame with Glowing Border */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-neutral-800 border-2 border-purple-500/50 overflow-hidden flex items-center justify-center shadow-xl shadow-purple-900/20">
                {resolveUserAvatar(user) ? (
                  <img
                    src={resolveUserAvatar(user)}
                    alt={user.name || 'Colaborador'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-950/60 to-neutral-900 text-purple-200">
                    <span className="text-2xl sm:text-3xl font-black tracking-wider">
                      {(user.name || user.email || 'U')
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </span>
                    <span className="text-[9px] text-neutral-400 mt-1 uppercase font-semibold">Sem Foto</span>
                  </div>
                )}
              </div>
              {user.leadershipRole && user.leadershipRole !== 'membro' && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-purple-600 text-white text-[9px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                  Líder
                </span>
              )}
            </div>

            {/* Name & Role Details */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {user.name || 'Colaborador Sem Nome'}
              </h2>
              <div className="text-sm font-bold text-purple-400">
                {user.role || 'Especialista da Agência'}
              </div>
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${deptInfo.color}`}
                >
                  {deptInfo.label}
                </span>
                {user.plan && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-neutral-900 border border-neutral-800 text-neutral-400">
                    {user.plan}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio Quote (if present) */}
          {user.bio && (
            <div className="p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 text-xs text-neutral-300 italic leading-relaxed relative">
              <span className="text-purple-400 font-serif text-lg leading-none absolute -top-1 left-2">“</span>
              <p className="pl-3">{user.bio}</p>
            </div>
          )}

          {/* Information Grid: Agency, Instagram, Email, Phone */}
          <div className="p-4 rounded-2xl bg-[#0e0e11] border border-neutral-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">
                Agência
              </span>
              <strong className="text-white truncate block mt-0.5">
                {user.agencyName || 'Techify Agência'}
              </strong>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">
                Instagram
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <strong className="text-neutral-200 truncate">
                  {user.instagram ? (user.instagram.startsWith('@') ? user.instagram : `@${user.instagram}`) : 'Não informado'}
                </strong>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">
                E-mail Corporativo
              </span>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-neutral-300 truncate font-mono text-[11px]">
                    {user.email || 'sem email'}
                  </span>
                </div>
                {user.email && (
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(user.email!)}
                    className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                    title="Copiar e-mail"
                  >
                    {copiedEmail ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">
                Contato / WhatsApp
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-neutral-300 truncate font-mono text-[11px]">
                  {user.whatsapp || user.phone || 'Disponível no Chat'}
                </span>
              </div>
            </div>
          </div>

          {/* Today's Time Clock Records (if any recorded) */}
          {userTodayRecords.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-300">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ponto Registrado Hoje ({d.toLocaleDateString('pt-BR')})</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                {userTodayRecords.map((r) => (
                  <div
                    key={r.id}
                    className="p-1.5 px-2 rounded-lg bg-neutral-950 border border-neutral-800 text-center"
                  >
                    <span className="text-[9px] text-neutral-500 block">{r.typeLabel || r.type}</span>
                    <strong className="text-emerald-400 font-mono">{r.time}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              Fechar
            </button>

            {onStartChat && user.email && (
              <button
                type="button"
                onClick={() => {
                  onStartChat(user);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Conversar no Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
