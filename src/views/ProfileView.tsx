import React, { useState } from 'react';
import {
  User,
  Camera,
  Mail,
  Phone,
  Instagram,
  Briefcase,
  Building2,
  Clock,
  ShieldCheck,
  Sparkles,
  Check,
  X,
  Upload,
  QrCode,
  Calendar,
  Layers,
  Save,
  MessageSquare,
  Globe,
  Share2,
} from 'lucide-react';
import { FirestoreUserProfile, cleanAvatarUrl } from '../lib/firebase';
import { TimeClockRecord } from '../types';
import { compressAvatarImage } from '../lib/imageCompressor';

interface ProfileViewProps {
  userProfile?: FirestoreUserProfile | null;
  timeClockRecords?: TimeClockRecord[];
  onUpdateProfile: (data: Partial<FirestoreUserProfile>) => Promise<void>;
  onNavigateToChat?: () => void;
  onNavigateToPonto?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  timeClockRecords = [],
  onUpdateProfile,
  onNavigateToChat,
  onNavigateToPonto,
}) => {
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(cleanAvatarUrl(userProfile?.avatarUrl) || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [whatsapp, setWhatsapp] = useState(userProfile?.whatsapp || '');
  const [instagram, setInstagram] = useState(userProfile?.instagram || '');
  const [role, setRole] = useState(userProfile?.role || 'Especialista Digital');
  const [department, setDepartment] = useState<string>(userProfile?.department || 'marketing');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [workStatus, setWorkStatus] = useState<'online' | 'busy' | 'lunch' | 'away' | 'offline'>(
    userProfile?.workStatus || 'online'
  );
  const [customStatus, setCustomStatus] = useState(userProfile?.customStatus || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Synchronize state when userProfile prop updates (only if not currently editing)
  React.useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.email) setEmail(userProfile.email);
      setAvatarUrl(cleanAvatarUrl(userProfile.avatarUrl));
      if (userProfile.phone !== undefined) setPhone(userProfile.phone);
      if (userProfile.whatsapp !== undefined) setWhatsapp(userProfile.whatsapp);
      if (userProfile.instagram !== undefined) setInstagram(userProfile.instagram);
      if (userProfile.role !== undefined) setRole(userProfile.role);
      if (userProfile.department) setDepartment(userProfile.department);
      if (userProfile.bio !== undefined) setBio(userProfile.bio);
      if (userProfile.workStatus) setWorkStatus(userProfile.workStatus);
      if (userProfile.customStatus !== undefined) setCustomStatus(userProfile.customStatus);
    }
  }, [userProfile?.email, userProfile?.avatarUrl, userProfile?.name, userProfile?.role, userProfile?.department]);

  // Departments list
  const departments = [
    { id: 'marketing', label: 'Marketing & Lançamentos', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { id: 'design', label: 'Criação & Design', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { id: 'prospeccao', label: 'Prospecção & Vendas', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'trafego', label: 'Tráfego & Performance', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { id: 'gestao', label: 'Gestão & Diretoria', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { id: 'suporte', label: 'Suporte & CS', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { id: 'desenvolvimento', label: 'Tech & Desenvolvimento', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  ];

  // Today time clock calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayRecords = timeClockRecords.filter(
    (r) =>
      r.date === todayStr &&
      (r.userEmail || '').toLowerCase().trim() === (userProfile?.email || '').toLowerCase().trim()
  );

  const processFile = async (file: File) => {
    setIsProcessingPhoto(true);
    setFeedback(null);
    try {
      // Compress and optimize image to 360x360 JPEG with high quality (~25KB payload)
      const compressedDataUrl = await compressAvatarImage(file, 360, 0.85);
      setAvatarUrl(compressedDataUrl);
      setFeedback({
        type: 'success',
        text: 'Foto carregada e otimizada com sucesso! Clique em "Salvar Alterações" para gravar no sistema.',
      });
    } catch (err: any) {
      console.error('Erro ao processar foto:', err);
      setFeedback({ type: 'error', text: 'Não foi possível carregar esta imagem. Tente outro formato.' });
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await onUpdateProfile({
        name: name.trim(),
        avatarUrl: avatarUrl.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim(),
        role: role.trim(),
        department,
        bio: bio.trim(),
        workStatus,
        customStatus: customStatus.trim(),
      });

      setFeedback({
        type: 'success',
        text: 'Perfil e foto salvos permanentemente no banco de dados com sucesso!',
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Erro ao salvar alterações do perfil.' });
    } finally {
      setIsSaving(false);
    }
  };

  const currentDept = departments.find((d) => d.id === department) || departments[0];

  return (
    <div className="min-h-screen bg-[#070707] text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-600/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Meu Perfil & Crachá de Colaborador
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-black text-purple-300 uppercase tracking-wider">
                Techify Identity
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Personalize sua foto oficial, cargo, setor de atuação, status de trabalho e compartilhe seu crachá profissional.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>

          {onNavigateToChat && (
            <button
              type="button"
              onClick={onNavigateToChat}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Abrir Chat da Empresa</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between animate-fade-in shadow-xl ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <X className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Edit Form (Left) + Digital Badge Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Dados Pessoais & Profissionais
              </h2>
            </div>

            {/* Avatar Upload Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFile = e.dataTransfer.files?.[0];
                  if (droppedFile) processFile(droppedFile);
                }}
                className="relative group shrink-0"
              >
                <div className="w-24 h-24 rounded-2xl bg-neutral-800 border-2 border-neutral-700 overflow-hidden flex items-center justify-center shadow-lg relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-10 h-10 text-neutral-500" />
                  )}
                  {isProcessingPhoto && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-[10px] text-white">
                      <span className="animate-spin w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full mb-1" />
                      <span>Processando</span>
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-[10px] font-bold text-white cursor-pointer transition-opacity">
                  <Camera className="w-5 h-5 mb-1" />
                  <span>Trocar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <strong className="text-xs font-bold text-white block">Foto de Perfil do Colaborador</strong>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Envie ou arraste uma foto profissional para identificação no Chat da Empresa, Ponto Eletrônico e Demandas da Prospecção.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                  <label className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isProcessingPhoto ? 'Processando Foto...' : 'Upload do Aparelho'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Info Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  E-mail Corporativo (Login)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Cargo / Especialidade *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gestor de Tráfego Sênior, Closer SDR, Designer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Setor / Departamento *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="(81) 99999-9999"
                    value={phone || whatsapp}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setWhatsapp(e.target.value);
                    }}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Instagram Profissional
                </label>
                <div className="relative">
                  <Instagram className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="@seu.perfil"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Status de Atividade no Chat
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'online', label: '🟢 Disponível', desc: 'Pronto para colaborar' },
                    { id: 'busy', label: '🔴 Focado / Ocupado', desc: 'Em produção profunda' },
                    { id: 'lunch', label: '🟡 Em Almoço', desc: 'Intervalo de refeição' },
                    { id: 'away', label: '⚪ Ausente', desc: 'Em reunião externa' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setWorkStatus(st.id as any)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        workStatus === st.id
                          ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <strong className="text-xs block">{st.label}</strong>
                      <span className="text-[10px] text-neutral-500 block truncate">{st.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Bio / Apresentação Pessoal
                </label>
                <textarea
                  rows={3}
                  placeholder="Conte um pouco sobre suas habilidades, foco na agência e metas..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Salvando Alterações...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Digital Badge & Live Work Status Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Digital Badge (Crachá Digital) */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#161616] to-[#0a0a0a] border-2 border-neutral-800 shadow-2xl relative overflow-hidden group">
            {/* Ambient decorative glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Badge Header */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black font-black text-xs">
                    T
                  </div>
                  <div>
                    <span className="text-[11px] font-black tracking-wider text-white uppercase block">
                      TECHIFY AGENCYOS
                    </span>
                    <span className="text-[9px] text-neutral-400 font-bold tracking-widest uppercase">
                      CRACHÁ OFICIAL DE COLABORADOR
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ativo
                </span>
              </div>

              {/* Photo & Role */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-neutral-800 border-2 border-purple-500/40 overflow-hidden flex items-center justify-center shrink-0 shadow-xl">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-8 h-8 text-neutral-500" />
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <h3 className="text-base font-black text-white truncate leading-tight">
                    {name || 'Nome do Colaborador'}
                  </h3>
                  <div className="text-xs font-bold text-purple-400 truncate">
                    {role || 'Especialista Digital'}
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${currentDept.color}`}
                  >
                    {currentDept.label}
                  </span>
                </div>
              </div>

              {/* Bio block */}
              {bio && (
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-[11px] text-neutral-300 italic leading-relaxed">
                  "{bio}"
                </div>
              )}

              {/* Badge Footer Meta */}
              <div className="pt-3 border-t border-neutral-800/80 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-neutral-500 text-[10px] block">Agência</span>
                  <strong className="text-white truncate block">
                    {userProfile?.agencyName || 'Techify Digital'}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Instagram</span>
                  <strong className="text-neutral-300 truncate block">
                    {instagram || '@techify'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Today TimeClock Summary Card */}
          <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Status de Ponto Hoje ({todayStr.split('-').reverse().join('/')})
                </h3>
              </div>
              {onNavigateToPonto && (
                <button
                  onClick={onNavigateToPonto}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  Ver Espelho Completo →
                </button>
              )}
            </div>

            {myTodayRecords.length === 0 ? (
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-center text-xs text-neutral-400">
                Nenhum ponto registrado hoje ainda.
              </div>
            ) : (
              <div className="space-y-2">
                {myTodayRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {rec.typeLabel || rec.type}
                    </span>
                    <span className="font-mono font-bold text-neutral-300">{rec.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
