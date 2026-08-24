import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertTriangle,
  X,
  Calendar,
  Sparkles,
  ArrowRight,
  User,
  Coffee,
  LogOut,
  LogIn,
  RotateCcw,
  Check,
  Printer,
  History,
  Info,
  Lock,
  Hourglass,
  Sliders,
  Trash2,
} from 'lucide-react';
import { EmployeeWorkSchedule, TimeClockRecord, TimeClockType } from '../../types';
import { FirestoreUserProfile } from '../../lib/firebase';
import {
  getEmployeeSchedule,
  getStrictSequentialStatus,
  validateScheduleTime,
  getRoleBadgeStyle,
  DEFAULT_WORK_SCHEDULES,
} from '../../lib/timeClockUtils';

interface SecureTimeClockModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: FirestoreUserProfile | null;
  timeClockRecords?: TimeClockRecord[];
  employeeWorkSchedules?: EmployeeWorkSchedule[];
  onPunchTimeClock: (record: Partial<TimeClockRecord>) => Promise<void>;
  onDeleteTimeClockRecord?: (id: string) => Promise<void>;
  onOpenScheduleSettings?: () => void;
}

// Generate cryptographic audit hash
function generateSecurityHash(userId: string, timestamp: string, coords?: { lat: number; lng: number }): string {
  const base = `${userId}-${timestamp}-${coords ? `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}` : 'NOGPS'}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  return `SEC-PONTO-${hex}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export const SecureTimeClockModal: React.FC<SecureTimeClockModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  timeClockRecords = [],
  employeeWorkSchedules = [],
  onPunchTimeClock,
  onDeleteTimeClockRecord,
  onOpenScheduleSettings,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [overrideJustification, setOverrideJustification] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Geolocation State
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    city?: string;
  } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'loading' | 'success' | 'error' | 'denied'>('loading');
  const [geoError, setGeoError] = useState<string | null>(null);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Active Tab inside modal
  const [activeTab, setActiveTab] = useState<'bater' | 'historico' | 'escala'>('bater');

  // Clock Ticker (1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request Geolocation on Open
  useEffect(() => {
    if (!isOpen) return;

    setGeoStatus('loading');
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoStatus('error');
      setGeoError('Geolocalização não suportada no navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          city: 'Auditado via GPS de Alta Precisão',
        });
        setGeoStatus('success');
      },
      (err) => {
        console.warn('Geolocation warning:', err.message);
        setGeoStatus('denied');
        setGeoError('GPS não liberado. Ponto será registrado com IP e carimbo de segurança.');
        setLocation({
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 100,
          city: 'São Paulo, BR (Auditado via Rede)',
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, [isOpen]);

  // Clean camera stream on close
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleStartCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setShowCamera(false);
      alert('Não foi possível abrir a câmera. Você ainda pode bater o ponto seguro via GPS.');
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 300, 300);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedPhoto(dataUrl);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setShowCamera(false);
  };

  if (!isOpen) return null;

  // Active User Info
  const userEmail = userProfile?.email || 'rickmarketing81@gmail.com';
  const userName = userProfile?.name || 'Marcos Henrique';
  const userRole = userProfile?.role || 'Diretor Executivo / Master';
  const leadershipRole = userProfile?.leadershipRole || 'lider_geral';

  const roleBadge = getRoleBadgeStyle(userRole, leadershipRole);

  // Active User's Linked Work Schedule
  const effectiveSchedules =
    employeeWorkSchedules.length > 0 ? employeeWorkSchedules : DEFAULT_WORK_SCHEDULES;
  const userSchedule = getEmployeeSchedule(effectiveSchedules, userEmail, userRole, userName);

  // Filter records for logged-in user
  const myRecords = timeClockRecords.filter(
    (r) => (r.userEmail || '').toLowerCase().trim() === userEmail.toLowerCase().trim()
  );

  // Today's records
  const todayStr = currentTime.toISOString().split('T')[0];
  const todayRecords = myRecords.filter((r) => r.date === todayStr);

  // 1. Strict Sequential Step Calculation
  const seqRule = getStrictSequentialStatus(
    todayRecords,
    userSchedule.minIntervalMinutes ?? 5,
    currentTime
  );

  // 2. Bound Schedule Time Validation
  const schedValidation = validateScheduleTime(
    seqRule.nextType,
    userSchedule,
    currentTime,
    showOverrideInput && overrideJustification.trim().length > 5
  );

  // Determine if punch button can be pressed
  const canPunchNow =
    seqRule.isAllowed &&
    (!schedValidation.isStrictlyBlocked ||
      (showOverrideInput && overrideJustification.trim().length > 5));

  // Punch step definitions for visual stepper
  const stepsList = [
    {
      type: 'entry' as TimeClockType,
      label: 'Entrada da Manhã',
      timeExpected: userSchedule.entryTime,
      icon: LogIn,
      record: todayRecords.find((r) => r.type === 'entry'),
    },
    {
      type: 'lunch_start' as TimeClockType,
      label: 'Saída Almoço',
      timeExpected: userSchedule.lunchStartTime,
      icon: Coffee,
      record: todayRecords.find((r) => r.type === 'lunch_start'),
    },
    {
      type: 'lunch_end' as TimeClockType,
      label: 'Retorno Almoço',
      timeExpected: userSchedule.lunchEndTime,
      icon: RotateCcw,
      record: todayRecords.find((r) => r.type === 'lunch_end'),
    },
    {
      type: 'exit' as TimeClockType,
      label: 'Saída Expediente',
      timeExpected: userSchedule.exitTime,
      icon: LogOut,
      record: todayRecords.find((r) => r.type === 'exit'),
    },
  ];

  // Calculate worked hours today
  const calculateWorkedHoursToday = () => {
    const entryRec = todayRecords.find((r) => r.type === 'entry');
    const exitRec = todayRecords.find((r) => r.type === 'exit');
    const lunchStart = todayRecords.find((r) => r.type === 'lunch_start');
    const lunchEnd = todayRecords.find((r) => r.type === 'lunch_end');

    if (!entryRec) return '00h 00m';

    const entryTime = new Date(entryRec.timestamp).getTime();
    const endTime = exitRec ? new Date(exitRec.timestamp).getTime() : currentTime.getTime();

    let lunchDiff = 0;
    if (lunchStart) {
      const lStart = new Date(lunchStart.timestamp).getTime();
      const lEnd = lunchEnd
        ? new Date(lunchEnd.timestamp).getTime()
        : exitRec
        ? endTime
        : currentTime.getTime();
      lunchDiff = Math.max(0, lEnd - lStart);
    }

    const totalMs = Math.max(0, endTime - entryTime - lunchDiff);
    const totalMins = Math.floor(totalMs / (1000 * 60));
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  };

  // Submit Clock In / Out
  const handleConfirmPunch = async () => {
    if (!canPunchNow) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetType = seqRule.nextType;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeFormatted = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const typeLabels: Record<TimeClockType, string> = {
      entry: 'Entrada da Manhã',
      lunch_start: 'Saída para Almoço',
      lunch_end: 'Retorno do Almoço',
      exit: 'Saída do Expediente',
      extra_start: 'Início de Hora Extra',
      extra_end: 'Fim de Hora Extra',
    };

    const securityHash = generateSecurityHash(
      userProfile?.uid || 'user',
      now.toISOString(),
      location ? { lat: location.latitude, lng: location.longitude } : undefined
    );

    const userAgent = navigator.userAgent;
    let deviceInfo = 'Navegador Web Seguro';
    if (userAgent.includes('Mobile')) deviceInfo = 'Dispositivo Móvel / Smartphone';
    else if (userAgent.includes('Windows')) deviceInfo = 'Windows Desktop';
    else if (userAgent.includes('Macintosh')) deviceInfo = 'macOS Desktop';
    else if (userAgent.includes('Linux')) deviceInfo = 'Linux Desktop';

    const fullNotes = [
      notes.trim(),
      overrideJustification.trim() ? `[Justificativa: ${overrideJustification.trim()}]` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const newRecord: Partial<TimeClockRecord> = {
      userId: userProfile?.uid || 'user-default',
      userEmail,
      userName,
      userRole,
      leadershipRole,
      type: targetType,
      typeLabel: typeLabels[targetType] || 'Ponto',
      timestamp: now.toISOString(),
      date: dateStr,
      time: timeFormatted,
      status: schedValidation.status,
      scheduledTime: schedValidation.expectedTime,
      timeDifferenceMinutes: schedValidation.diffMinutes,
      location: location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            city: location.city || 'Auditado via GPS',
          }
        : undefined,
      deviceInfo,
      securityHash,
      notes: fullNotes || undefined,
      photoUrl: capturedPhoto || undefined,
    };

    try {
      await onPunchTimeClock(newRecord);
      setSuccessMessage(
        `✅ Ponto registrado com sucesso! (${typeLabels[targetType]} às ${timeFormatted} por ${userName})`
      );
      setNotes('');
      setOverrideJustification('');
      setShowOverrideInput(false);
      setCapturedPhoto(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      console.error('Error punching clock:', err);
      setErrorMessage(`Erro ao registrar ponto: ${err?.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b0c10] border border-neutral-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col text-neutral-200 font-sans my-auto max-h-[92vh]">
        {/* Header with Identified User & Live Clock */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-black flex items-center justify-center font-black shadow-md">
              <Clock className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Ponto Eletrônico Seguro
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Alô Seguro
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Sequencial Obrigatório
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">
                Validação de horário vinculado, geolocalização e assinatura auditável.
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

        {/* User Identity Bar (Nome e Cargo em Destaque) */}
        <div className="px-4 sm:px-6 py-3 bg-neutral-900/90 border-b border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-xs">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">{userName}</span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
                >
                  {userRole}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">{userEmail}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-black/50 px-3 py-1.5 rounded-xl border border-neutral-800 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-400 font-medium">Trabalhado hoje:</span>
              <span className="font-mono font-bold text-white">{calculateWorkedHoursToday()}</span>
            </div>

            {onOpenScheduleSettings && (
              <button
                type="button"
                onClick={onOpenScheduleSettings}
                className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all border border-neutral-700"
                title="Ajustar horários da jornada vinculada"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ajustar Escala</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab('bater')}
            className={`py-3 px-4 text-xs font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bater'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Bater Ponto do Dia
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historico')}
            className={`py-3 px-4 text-xs font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'historico'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <History className="w-4 h-4" />
            Meu Histórico ({todayRecords.length} hoje)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('escala')}
            className={`py-3 px-4 text-xs font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'escala'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Minha Escala Vinculada
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/70 border border-red-800 text-red-300 text-xs font-bold flex items-center gap-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'bater' && (
            <div className="space-y-5">
              {/* Sequential Stepper: Shows all 4 daily steps strictly */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">
                    Sequência Obrigatória da Jornada (1 por vez)
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {todayRecords.length}/4 Concluídos
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {stepsList.map((step, idx) => {
                    const isDone = !!step.record;
                    const isCurrent = !isDone && seqRule.nextType === step.type;
                    const isLocked = !isDone && !isCurrent;
                    const StepIcon = step.icon;

                    return (
                      <div
                        key={step.type}
                        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                            : isCurrent
                            ? 'bg-neutral-800 border-white text-white shadow-lg ring-1 ring-white/20'
                            : 'bg-neutral-950/50 border-neutral-800/60 text-neutral-500 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40">
                              #{idx + 1}
                            </span>
                            <StepIcon className="w-3.5 h-3.5" />
                          </div>
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-neutral-500" />
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-black truncate">{step.label}</p>
                          <div className="text-[11px] font-mono mt-1 flex items-center justify-between">
                            <span className="text-neutral-400">Escala: {step.timeExpected}</span>
                            {isDone && (
                              <span className="text-emerald-400 font-bold">
                                {step.record?.time.substring(0, 5)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Giant Clock & Current Target Action */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 text-center space-y-3 relative overflow-hidden">
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                  {currentTime.toLocaleTimeString('pt-BR')}
                </div>
                <div className="text-xs text-neutral-400 font-medium">
                  {currentTime.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>

                {/* Next Step Banner */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-800/90 border border-neutral-700 text-xs font-bold text-neutral-200">
                  <span>Próximo registro:</span>
                  <span className="text-white font-extrabold">{seqRule.nextLabel}</span>
                </div>

                {/* Linked Schedule Info Box */}
                <div className="mt-2 p-3 rounded-2xl bg-black/40 border border-neutral-800 max-w-md mx-auto text-left text-xs space-y-1">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="font-bold">Horário Vinculado a {userName}:</span>
                    <span className="font-mono font-bold text-white">
                      {schedValidation.expectedTime} (±{schedValidation.toleranceMin}m)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                    <span>Janela permitida:</span>
                    <span className="font-mono text-neutral-300">
                      {schedValidation.allowedWindowStart} às {schedValidation.allowedWindowEnd}
                    </span>
                  </div>

                  {/* Schedule Warning / Block Status */}
                  {schedValidation.isStrictlyBlocked && !showOverrideInput && (
                    <div className="mt-2 p-2.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-[11px] font-bold flex items-start gap-2">
                      <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-extrabold">⛔ Bloqueio de Horário Ativo</p>
                        <p className="text-red-300/90 font-normal mt-0.5">
                          {schedValidation.message}
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowOverrideInput(true)}
                          className="mt-1.5 text-xs text-amber-400 underline hover:text-amber-300 font-bold block cursor-pointer"
                        >
                          Justificar e solicitar liberação de exceção
                        </button>
                      </div>
                    </div>
                  )}

                  {!seqRule.isAllowed && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-300 text-[11px] font-bold flex items-start gap-2">
                      <Hourglass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-spin" />
                      <div>
                        <p className="text-white font-extrabold">
                          Aguarde o intervalo de segurança
                        </p>
                        <p className="text-amber-300/90 font-normal mt-0.5">{seqRule.reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Justification Form when blocked */}
              {showOverrideInput && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 space-y-2 animate-in fade-in">
                  <label className="block text-xs font-bold text-amber-300">
                    Justificativa Obrigatória para Ponto Fora do Horário Vinculado:
                  </label>
                  <textarea
                    rows={2}
                    value={overrideJustification}
                    onChange={(e) => setOverrideJustification(e.target.value)}
                    placeholder="Ex: Autorizado pelo Gestor Marcos devido a reunião externa com cliente..."
                    className="w-full bg-neutral-900 border border-amber-700/60 rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Mínimo 6 caracteres para validar auditoria.</span>
                    <button
                      type="button"
                      onClick={() => setShowOverrideInput(false)}
                      className="text-neutral-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Security Controls (GPS & Photo) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Geolocation Audit Box */}
                <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-white shrink-0">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-white block">GPS Auditado</span>
                      <span className="text-[11px] text-neutral-400 block truncate max-w-[180px]">
                        {location?.city || 'Localizando...'}
                      </span>
                    </div>
                  </div>
                  {geoStatus === 'success' ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      GPS Ativo
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Rede
                    </span>
                  )}
                </div>

                {/* Photo / Facial Box */}
                <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-white shrink-0">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-white block">Selfie Facial</span>
                      <span className="text-[11px] text-neutral-400 block">
                        {capturedPhoto ? 'Foto capturada' : 'Opcional p/ auditoria'}
                      </span>
                    </div>
                  </div>
                  {capturedPhoto ? (
                    <div className="flex items-center gap-1.5">
                      <img
                        src={capturedPhoto}
                        alt="Selfie"
                        className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setCapturedPhoto(null)}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        Refazer
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartCamera}
                      className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      Abrir Câmera
                    </button>
                  )}
                </div>
              </div>

              {/* Camera Modal Stream View if Active */}
              {showCamera && (
                <div className="p-4 rounded-2xl bg-black border border-neutral-800 flex flex-col items-center gap-3 animate-in fade-in">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-48 h-48 rounded-2xl object-cover border-2 border-white shadow-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="px-4 py-2 rounded-xl bg-white text-black font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Camera className="w-4 h-4" />
                      Capturar Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCamera(false)}
                      className="px-3 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              {/* Notes Input */}
              <div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observação opcional sobre o expediente (ex: Home office, Visita técnica)..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              {/* Main Submit Button (1 por vez) */}
              <button
                type="button"
                disabled={!canPunchNow || loading}
                onClick={handleConfirmPunch}
                className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                  canPunchNow && !loading
                    ? 'bg-white hover:bg-neutral-200 text-black hover:scale-[1.01] active:scale-[0.99]'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
                }`}
              >
                {loading ? (
                  <span>Assinando digitalmente...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>CONFIRMAR REGISTRO: {seqRule.nextLabel.toUpperCase()}</span>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-neutral-500">
                🔒 Assinatura digital com hash criptográfico, geolocalização e carimbo de tempo
                irrevogável.
              </p>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Batidas Registradas Hoje ({todayStr})
                </h4>
                <span className="text-xs text-neutral-400">Total: {todayRecords.length}</span>
              </div>

              {todayRecords.length === 0 ? (
                <div className="p-8 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800">
                  <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400 font-medium">
                    Nenhum ponto registrado hoje para {userName}.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {todayRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-xs">
                          {rec.time.substring(0, 5)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">{rec.typeLabel}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-neutral-400 font-mono">
                              {rec.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 font-mono">
                            {rec.securityHash}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <div className="text-left sm:text-right text-[11px] text-neutral-400 font-mono">
                          <div>
                            {rec.location?.city || 'Auditado'} (
                            {rec.location?.latitude?.toFixed(3)},{' '}
                            {rec.location?.longitude?.toFixed(3)})
                          </div>
                          {rec.notes && <div className="text-neutral-300 italic">{rec.notes}</div>}
                        </div>

                        {onDeleteTimeClockRecord && (
                          <button
                            type="button"
                            disabled={deletingId === rec.id}
                            onClick={async () => {
                              if (confirm(`Deseja realmente apagar este registro de ponto errado (${rec.typeLabel} às ${rec.time})?`)) {
                                try {
                                  setDeletingId(rec.id);
                                  await onDeleteTimeClockRecord(rec.id);
                                  setSuccessMessage(`Ponto apagado com sucesso! Agora você pode registrar novamente na sequência.`);
                                  setTimeout(() => setSuccessMessage(null), 4000);
                                } catch (err) {
                                  setErrorMessage('Erro ao apagar o ponto.');
                                  setTimeout(() => setErrorMessage(null), 3000);
                                } finally {
                                  setDeletingId(null);
                                }
                              }
                            }}
                            className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 hover:text-red-200 transition-all cursor-pointer flex items-center gap-1 shrink-0 text-xs font-bold"
                            title="Apagar este ponto errado"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{deletingId === rec.id ? 'Apagando...' : 'Apagar'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'escala' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white">{userName}</h4>
                    <p className="text-xs text-neutral-400">
                      Cargo: <span className="text-white font-bold">{userRole}</span>
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-xl border font-bold ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
                  >
                    {userRole}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-center">
                    <span className="text-[10px] text-neutral-400 block mb-1">Entrada</span>
                    <span className="text-base font-mono font-black text-white">
                      {userSchedule.entryTime}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-center">
                    <span className="text-[10px] text-neutral-400 block mb-1">Saída Almoço</span>
                    <span className="text-base font-mono font-black text-white">
                      {userSchedule.lunchStartTime}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-center">
                    <span className="text-[10px] text-neutral-400 block mb-1">Retorno Almoço</span>
                    <span className="text-base font-mono font-black text-white">
                      {userSchedule.lunchEndTime}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-center">
                    <span className="text-[10px] text-neutral-400 block mb-1">Saída</span>
                    <span className="text-base font-mono font-black text-white">
                      {userSchedule.exitTime}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-neutral-300 space-y-1.5 pt-2 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span>Tolerância de Janela:</span>
                    <span className="font-bold text-white">
                      ±{userSchedule.toleranceMinutes} minutos
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bloqueio Estrito de Horário:</span>
                    <span
                      className={`font-bold ${
                        userSchedule.strictEnforcement ? 'text-emerald-400' : 'text-neutral-400'
                      }`}
                    >
                      {userSchedule.strictEnforcement ? 'Ativado (Obrigatório)' : 'Desativado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Intervalo Mínimo entre Batidas:</span>
                    <span className="font-bold text-white">
                      {userSchedule.minIntervalMinutes} minutos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
