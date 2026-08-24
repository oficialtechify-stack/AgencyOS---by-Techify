import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  Calendar,
  User,
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  Filter,
  Search,
  Check,
  Coffee,
  LogOut,
  LogIn,
  RotateCcw,
  Sliders,
  Lock,
  Trash2,
  Edit3,
  Eye,
  PlusCircle,
  X,
  Smartphone,
  Flame,
} from 'lucide-react';
import { EmployeeWorkSchedule, TimeClockRecord, TimeClockType } from '../types';
import { FirestoreUserProfile } from '../lib/firebase';
import { isUserMasterAdmin } from '../lib/permissions';
import { EmployeeScheduleModal } from '../components/timeclock/EmployeeScheduleModal';
import { EditTimeClockModal } from '../components/timeclock/EditTimeClockModal';
import { ManualPunchModal } from '../components/timeclock/ManualPunchModal';
import { InspectTimeClockModal } from '../components/timeclock/InspectTimeClockModal';
import {
  DEFAULT_WORK_SCHEDULES,
  getEmployeeSchedule,
  getRoleBadgeStyle,
  getStrictSequentialStatus,
} from '../lib/timeClockUtils';

interface PontoViewProps {
  userProfile?: FirestoreUserProfile | null;
  timeClockRecords?: TimeClockRecord[];
  employeeWorkSchedules?: EmployeeWorkSchedule[];
  onPunchTimeClock: (record: Partial<TimeClockRecord>) => Promise<void>;
  onDeleteTimeClockRecord?: (id: string) => Promise<void>;
  onUpdateTimeClockRecord?: (id: string, updatedData: Partial<TimeClockRecord>) => Promise<void>;
  onOpenPunchModal: () => void;
  onSaveSchedule?: (schedule: EmployeeWorkSchedule) => Promise<void>;
  onDeleteSchedule?: (id: string) => Promise<void>;
}

export const PontoView: React.FC<PontoViewProps> = ({
  userProfile,
  timeClockRecords = [],
  employeeWorkSchedules = [],
  onPunchTimeClock,
  onDeleteTimeClockRecord,
  onUpdateTimeClockRecord,
  onOpenPunchModal,
  onSaveSchedule = async () => {},
  onDeleteSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<'meu-ponto' | 'equipe' | 'escalas'>('meu-ponto');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterEmployee, setFilterEmployee] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showManualPunchModal, setShowManualPunchModal] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<TimeClockRecord | null>(null);
  const [recordToInspect, setRecordToInspect] = useState<TimeClockRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<TimeClockRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Exclusive Master Admin Permission check
  const userEmail = userProfile?.email || 'rickmarketing81@gmail.com';
  const userName = userProfile?.name || 'Marcos Henrique';
  const userRole = userProfile?.role || 'Diretor Executivo / Master';

  const isMaster = isUserMasterAdmin(userProfile, userEmail);
  const canEditOrAlter = isMaster;
  const canManageSchedules = isMaster;

  const effectiveSchedules =
    employeeWorkSchedules.length > 0 ? employeeWorkSchedules : DEFAULT_WORK_SCHEDULES;

  const mySchedule = getEmployeeSchedule(effectiveSchedules, userEmail, userRole, userName);

  const myRecords = timeClockRecords.filter(
    (r) => (r.userEmail || '').toLowerCase().trim() === userEmail.toLowerCase().trim()
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayRecords = myRecords.filter((r) => r.date === todayStr);

  const seqRule = getStrictSequentialStatus(
    myTodayRecords,
    mySchedule.minIntervalMinutes ?? 5,
    new Date()
  );

  const hasEntry = myTodayRecords.some((r) => r.type === 'entry');
  const hasLunchStart = myTodayRecords.some((r) => r.type === 'lunch_start');
  const hasLunchEnd = myTodayRecords.some((r) => r.type === 'lunch_end');
  const hasExit = myTodayRecords.some((r) => r.type === 'exit');

  // Next logical punch icon and label
  const nextPunchLabel = seqRule.nextLabel;

  // Status badge
  let currentStatusBadge = {
    text: 'Jornada Não Iniciada',
    color: 'bg-neutral-800 text-neutral-400 border-neutral-700',
  };
  if (hasExit) {
    currentStatusBadge = {
      text: 'Expediente Concluído',
      color: 'bg-blue-950 text-blue-300 border-blue-800',
    };
  } else if (hasLunchStart && !hasLunchEnd) {
    currentStatusBadge = {
      text: 'Em Intervalo / Almoço',
      color: 'bg-amber-950 text-amber-300 border-amber-800',
    };
  } else if (hasEntry) {
    currentStatusBadge = {
      text: 'Em Expediente Ativo',
      color: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    };
  }

  const monthlyRecords = myRecords.filter((r) => (r.date || '').startsWith(selectedMonth));

  // Team summary group
  const teamTodayGrouped = timeClockRecords
    .filter((r) => r.date === todayStr)
    .reduce<Record<string, TimeClockRecord[]>>((acc, curr) => {
      const email = (curr.userEmail || 'desconhecido').toLowerCase();
      if (!acc[email]) acc[email] = [];
      acc[email].push(curr);
      return acc;
    }, {});

  // Extract unique employees for filter dropdown
  const uniqueEmployeesMap = new Map<string, { email: string; name: string; role: string }>();
  effectiveSchedules.forEach((s) => {
    if (s.userEmail) {
      uniqueEmployeesMap.set(s.userEmail.toLowerCase(), {
        email: s.userEmail,
        name: s.userName,
        role: s.userRole,
      });
    }
  });
  timeClockRecords.forEach((r) => {
    if (r.userEmail) {
      const emailLower = r.userEmail.toLowerCase();
      if (!uniqueEmployeesMap.has(emailLower)) {
        uniqueEmployeesMap.set(emailLower, {
          email: r.userEmail,
          name: r.userName || 'Colaborador',
          role: r.userRole || 'Equipe',
        });
      }
    }
  });
  const uniqueEmployees = Array.from(uniqueEmployeesMap.values());

  // Overall Statistics for Master Admin
  const totalPunches = timeClockRecords.length;
  const latePunches = timeClockRecords.filter((r) => r.status === 'late').length;
  const overtimePunches = timeClockRecords.filter((r) => r.status === 'overtime').length;
  const editedPunches = timeClockRecords.filter((r) => r.isManuallyEdited).length;
  const regularPunches = timeClockRecords.filter((r) => r.status === 'regular').length;
  const punctualityRate = totalPunches > 0 ? Math.round(((totalPunches - latePunches) / totalPunches) * 100) : 100;

  // Filtered Records for Team Tab
  const filteredTeamRecords = timeClockRecords.filter((r) => {
    // Month filter
    if (selectedMonth && !(r.date || '').startsWith(selectedMonth)) return false;

    // Type filter
    if (filterType !== 'todos' && r.type !== filterType) return false;

    // Employee filter
    if (filterEmployee !== 'todos' && (r.userEmail || '').toLowerCase() !== filterEmployee.toLowerCase()) {
      return false;
    }

    // Status filter
    if (filterStatus === 'edited') {
      if (!r.isManuallyEdited) return false;
    } else if (filterStatus !== 'todos') {
      if (r.status !== filterStatus) return false;
    }

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matches =
        (r.userName || '').toLowerCase().includes(term) ||
        (r.userEmail || '').toLowerCase().includes(term) ||
        (r.userRole || '').toLowerCase().includes(term) ||
        (r.securityHash || '').toLowerCase().includes(term) ||
        (r.location?.city || '').toLowerCase().includes(term) ||
        (r.notes || '').toLowerCase().includes(term) ||
        (r.editReason || '').toLowerCase().includes(term);
      if (!matches) return false;
    }

    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const recordsToExport = activeTab === 'meu-ponto' ? myRecords : timeClockRecords;
    if (recordsToExport.length === 0) {
      alert('Nenhum registro para exportar.');
      return;
    }

    const headers = [
      'Data',
      'Horario',
      'Colaborador_Nome',
      'Colaborador_Email',
      'Cargo_Oficial',
      'Tipo_Ponto',
      'Horario_Vinculado',
      'Status_Conformidade',
      'Editado_Manualmente',
      'Editado_Por',
      'Hash_Auditoria',
      'Dispositivo',
      'Observacoes',
    ];
    const rows = recordsToExport.map((r) => [
      r.date,
      r.time,
      `"${r.userName || ''}"`,
      `"${r.userEmail || ''}"`,
      `"${r.userRole || ''}"`,
      `"${r.typeLabel || r.type}"`,
      `"${r.scheduledTime || ''}"`,
      `"${r.status || 'regular'}"`,
      `"${r.isManuallyEdited ? 'SIM' : 'NAO'}"`,
      `"${r.editedBy || ''}"`,
      `"${r.securityHash || ''}"`,
      `"${r.deviceInfo || ''}"`,
      `"${(r.notes || r.editReason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `espelho_ponto_auditado_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stepsList = [
    {
      type: 'entry' as TimeClockType,
      label: '1. Entrada da Manhã',
      timeExpected: mySchedule.entryTime,
      icon: LogIn,
      record: myTodayRecords.find((r) => r.type === 'entry'),
    },
    {
      type: 'lunch_start' as TimeClockType,
      label: '2. Saída Almoço',
      timeExpected: mySchedule.lunchStartTime,
      icon: Coffee,
      record: myTodayRecords.find((r) => r.type === 'lunch_start'),
    },
    {
      type: 'lunch_end' as TimeClockType,
      label: '3. Retorno Almoço',
      timeExpected: mySchedule.lunchEndTime,
      icon: RotateCcw,
      record: myTodayRecords.find((r) => r.type === 'lunch_end'),
    },
    {
      type: 'exit' as TimeClockType,
      label: '4. Saída Expediente',
      timeExpected: mySchedule.exitTime,
      icon: LogOut,
      record: myTodayRecords.find((r) => r.type === 'exit'),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black shadow-lg">
            <Clock className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ponto Eletrônico Seguro
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Auditado por GPS & Biometria
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStatusBadge.color}`}
              >
                {currentStatusBadge.text}
              </span>
              {isMaster && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Controle Master (Edição & Exclusão Exclusivas)
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1">
              Todos os colaboradores registram ponto com 1 clique. Somente o Gestor Master pode alterar e editar registros.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {canManageSchedules && (
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              title="Ajustar e vincular horários para cada funcionário"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Ajustar Escalas</span>
            </button>
          )}

          {canEditOrAlter && (
            <button
              type="button"
              onClick={() => setShowManualPunchModal(true)}
              className="px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-300 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              title="Adicionar ponto retroativo ou manual para qualquer colaborador"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>+ Ponto Manual</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPunchModal}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-neutral-200 text-black font-black text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Bater Ponto Agora</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
            <span>Meu Status Hoje</span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-lg font-black text-white">
            {hasExit ? 'Expediente Encerrado' : hasEntry ? 'Em Expediente' : 'Pendente Entrada'}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Entrada vinculada:{' '}
            <strong className="text-white font-mono">{mySchedule.entryTime}</strong>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
            <span>Pontos no Mês</span>
            <Calendar className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {isMaster ? timeClockRecords.filter((r) => (r.date || '').startsWith(selectedMonth)).length : monthlyRecords.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {isMaster ? `Total geral na agência (${selectedMonth})` : `Meus registros em ${selectedMonth}`}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
            <span>{isMaster ? 'Pontualidade da Agência' : 'Minha Escala Vinculada'}</span>
            <Lock className="w-4 h-4 text-white" />
          </div>
          {isMaster ? (
            <>
              <div className="text-2xl font-black text-emerald-400">{punctualityRate}%</div>
              <div className="text-[11px] text-neutral-400 mt-1">
                {latePunches} atrasos registrados • {overtimePunches} horas extras
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-black text-white font-mono">
                {mySchedule.entryTime} → {mySchedule.lunchStartTime} → {mySchedule.exitTime}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Tolerância: ±{mySchedule.toleranceMinutes} min (Trava:{' '}
                {mySchedule.strictEnforcement ? 'Ativa' : 'Off'})
              </div>
            </>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
            <span>Identificação & Auditoria</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xs font-black text-white truncate">{userName}</div>
          <div className="text-[11px] text-neutral-400 truncate">
            {userRole} {isMaster && '• Permissão Master'}
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-neutral-800 gap-3">
        <button
          onClick={() => setActiveTab('meu-ponto')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'meu-ponto'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Meu Espelho de Ponto</span>
        </button>

        {isMaster && (
          <button
            onClick={() => setActiveTab('equipe')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'equipe'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Todos os Pontos da Agência ({timeClockRecords.length} Registros • {Object.keys(teamTodayGrouped).length} Ativos Hoje)</span>
          </button>
        )}

        {isMaster && (
          <button
            onClick={() => setActiveTab('escalas')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'escalas'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Escalas Vinculadas ({effectiveSchedules.length})</span>
          </button>
        )}
      </div>

      {/* Tab: Meu Espelho de Ponto */}
      {activeTab === 'meu-ponto' && (
        <div className="space-y-5">
          {/* Stepper Card (Sequência Obrigatória 1 a 1) */}
          <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black text-white uppercase tracking-wider block">
                  Sequência do Dia: 1 por vez na ordem legal
                </span>
                <span className="text-xs text-neutral-400">
                  Próximo registro disponível:{' '}
                  <strong className="text-white font-bold">{nextPunchLabel}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={onOpenPunchModal}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Bater: {nextPunchLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {stepsList.map((step, idx) => {
                const isDone = !!step.record;
                const isCurrent = !isDone && seqRule.nextType === step.type;
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.type}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : isCurrent
                        ? 'bg-neutral-800 border-white text-white shadow-md ring-1 ring-white/20'
                        : 'bg-neutral-950/50 border-neutral-800/50 text-neutral-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40">
                        Passo #{idx + 1}
                      </span>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-neutral-500" />
                      )}
                    </div>
                    <div className="text-xs font-black truncate">{step.label}</div>
                    <div className="text-[11px] font-mono text-neutral-400 mt-1 flex justify-between">
                      <span>Previsto: {step.timeExpected}</span>
                      {isDone && (
                        <span className="text-emerald-400 font-bold">
                          {step.record?.time.substring(0, 5)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table Header Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-300">Mês de Referência:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono"
              />
            </div>

            <div className="text-xs text-neutral-400">
              Total de registros no mês:{' '}
              <strong className="text-white font-mono">{monthlyRecords.length}</strong>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
            {monthlyRecords.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 text-xs">
                Nenhum ponto registrado em {selectedMonth}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-[10px] uppercase font-black text-neutral-400 tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="p-3.5 pl-5">Data</th>
                      <th className="p-3.5">Horário Batido</th>
                      <th className="p-3.5">Horário Vinculado</th>
                      <th className="p-3.5">Tipo do Ponto</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Localização</th>
                      <th className="p-3.5">Hash de Segurança</th>
                      <th className="p-3.5 pr-5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-sans">
                    {monthlyRecords.map((r) => {
                      const isToday = r.date === todayStr;
                      return (
                        <tr
                          key={r.id}
                          className={`hover:bg-neutral-800/40 transition-colors ${
                            isToday ? 'bg-neutral-800/20' : ''
                          }`}
                        >
                          <td className="p-3.5 pl-5 font-bold text-white font-mono">
                            <div className="flex items-center gap-2">
                              <span>{r.date}</span>
                              {isToday && (
                                <span className="text-[9px] bg-white text-black px-1.5 py-0.5 rounded font-black">
                                  HOJE
                                </span>
                              )}
                              {r.isManuallyEdited && (
                                <span
                                  className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold"
                                  title={`Editado por ${r.editedBy || 'Master'}`}
                                >
                                  EDITADO
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 font-mono font-black text-white text-sm">
                            {r.time}
                          </td>
                          <td className="p-3.5 font-mono text-neutral-400">
                            {r.scheduledTime || '--:--'}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1.5 font-bold text-white">
                              {r.typeLabel || r.type}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {r.status === 'late' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 border border-amber-800 text-amber-300">
                                Atraso
                              </span>
                            ) : r.status === 'overtime' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-950 border border-blue-800 text-blue-300">
                                Hora Extra
                              </span>
                            ) : r.status === 'early_departure' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-950 border border-purple-800 text-purple-300">
                                Saída Antecipada
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-800 border border-neutral-700 text-neutral-300">
                                Regular
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-neutral-400">
                            {r.location ? (
                              <span className="flex items-center gap-1 text-[11px] text-neutral-300">
                                <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                                {r.location.city || 'GPS'}
                              </span>
                            ) : (
                              <span className="text-[11px] text-neutral-500">Auditado (Rede)</span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono text-[10px] text-neutral-400 font-bold">
                            {r.securityHash}
                          </td>
                          <td className="p-3.5 pr-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setRecordToInspect(r)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
                                title="Inspecionar detalhes de auditoria"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {canEditOrAlter && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setRecordToEdit(r)}
                                    className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-amber-950/40 border border-amber-900/40 transition-all cursor-pointer flex items-center gap-1"
                                    title="Editar horário e dados deste ponto (Master Admin)"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline text-[11px] font-bold">Editar</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setRecordToDelete(r)}
                                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-all cursor-pointer flex items-center gap-1"
                                    title="Apagar este ponto errado (Master Admin)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline text-[11px]">Apagar</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Controle Geral da Equipe & Todos os Pontos (Master Admin) */}
      {activeTab === 'equipe' && isMaster && (
        <div className="space-y-6">
          {/* Team Members Today Presence Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Presença da Equipe Hoje ({todayStr})</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {Object.keys(teamTodayGrouped).length} com registro ativo
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualPunchModal(true)}
                  className="text-xs text-amber-300 hover:text-amber-100 bg-amber-950/50 hover:bg-amber-900/50 border border-amber-800 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  + Ponto Manual
                </button>

                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className="text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 px-3 py-1 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Gerenciar Escalas
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {effectiveSchedules.map((sched) => {
                const userRecords = timeClockRecords.filter(
                  (r) =>
                    (r.userEmail || '').toLowerCase() === sched.userEmail.toLowerCase() &&
                    r.date === todayStr
                );
                const entry = userRecords.find((r) => r.type === 'entry');
                const lunchS = userRecords.find((r) => r.type === 'lunch_start');
                const lunchE = userRecords.find((r) => r.type === 'lunch_end');
                const exit = userRecords.find((r) => r.type === 'exit');
                const badge = getRoleBadgeStyle(sched.userRole, sched.leadershipRole);

                let statusText = 'Pendente';
                let statusColor = 'bg-neutral-800 text-neutral-400 border-neutral-700';
                if (exit) {
                  statusText = 'Expediente Encerrado';
                  statusColor = 'bg-blue-950 text-blue-300 border-blue-800';
                } else if (lunchS && !lunchE) {
                  statusText = 'Em Almoço';
                  statusColor = 'bg-amber-950 text-amber-300 border-amber-800';
                } else if (entry) {
                  statusText = 'Presente / Trabalhando';
                  statusColor = 'bg-emerald-950 text-emerald-300 border-emerald-800';
                }

                return (
                  <div
                    key={sched.id}
                    className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-3 shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-xs shrink-0">
                            {sched.userName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white">{sched.userName}</h4>
                            <p className="text-[10px] text-neutral-400 truncate max-w-[150px]">
                              {sched.userEmail}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {sched.userRole}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}
                        >
                          {statusText}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          Escala: {sched.entryTime} - {sched.exitTime}
                        </span>
                      </div>
                    </div>

                    {/* Today's Punch Timeline */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono bg-black/40 p-2 rounded-xl border border-neutral-800/80">
                      <div>
                        <span className="text-neutral-500 block text-[9px]">Entrada</span>
                        <span
                          className={`font-bold ${
                            entry ? 'text-emerald-400' : 'text-neutral-600'
                          }`}
                        >
                          {entry ? entry.time.substring(0, 5) : '--:--'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[9px]">Almoço</span>
                        <span
                          className={`font-bold ${
                            lunchS ? 'text-amber-400' : 'text-neutral-600'
                          }`}
                        >
                          {lunchS ? lunchS.time.substring(0, 5) : '--:--'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[9px]">Retorno</span>
                        <span
                          className={`font-bold ${
                            lunchE ? 'text-amber-400' : 'text-neutral-600'
                          }`}
                        >
                          {lunchE ? lunchE.time.substring(0, 5) : '--:--'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[9px]">Saída</span>
                        <span
                          className={`font-bold ${exit ? 'text-blue-400' : 'text-neutral-600'}`}
                        >
                          {exit ? exit.time.substring(0, 5) : '--:--'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Audit Filter and Table Controls */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por colaborador (Nome), cargo, e-mail, hash ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white w-full focus:outline-none focus:border-white"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Employee Dropdown */}
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="todos">Todos os Colaboradores</option>
                {uniqueEmployees.map((emp) => (
                  <option key={emp.email} value={emp.email}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>

              {/* Status Dropdown */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="todos">Todos os Status</option>
                <option value="regular">No Horário / Regular</option>
                <option value="late">Atrasos</option>
                <option value="overtime">Horas Extras</option>
                <option value="early_departure">Saídas Antecipadas</option>
                <option value="edited">Apenas Editados Manualmente</option>
              </select>

              {/* Type Dropdown */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="entry">1. Entrada</option>
                <option value="lunch_start">2. Saída Almoço</option>
                <option value="lunch_end">3. Retorno Almoço</option>
                <option value="exit">4. Saída Expediente</option>
                <option value="overtime_in">5. Início Horas Extras</option>
                <option value="overtime_out">6. Término Horas Extras</option>
              </select>

              {/* Month */}
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
              />
            </div>
          </div>

          {/* All Team Records Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <span className="font-extrabold text-white text-sm flex items-center gap-2">
                <span>Auditoria Consolidada de Pontos</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                  {filteredTeamRecords.length} de {timeClockRecords.length} registros
                </span>
              </span>
              <span className="text-xs text-amber-400 font-mono flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Painel Master Exclusivo (Editar & Apagar Liberados)
              </span>
            </div>

            {filteredTeamRecords.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 text-xs">
                Nenhum registro de ponto encontrado com os filtros selecionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-[10px] uppercase font-black text-neutral-400 tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="p-3.5 pl-5">Colaborador</th>
                      <th className="p-3.5">Cargo Oficial</th>
                      <th className="p-3.5">Data & Horário</th>
                      <th className="p-3.5">Tipo da Batida</th>
                      <th className="p-3.5">Horário Vinculado</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Localização GPS</th>
                      <th className="p-3.5">Hash de Segurança</th>
                      <th className="p-3.5 pr-5 text-right">Ações Master</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-sans">
                    {filteredTeamRecords.map((r) => {
                      const badge = getRoleBadgeStyle(r.userRole, r.leadershipRole);
                      return (
                        <tr key={r.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="p-3.5 pl-5 font-bold text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {(r.userName || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                  <span>{r.userName || 'Colaborador'}</span>
                                  {r.isManuallyEdited && (
                                    <span
                                      className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-bold"
                                      title={`Editado por ${r.editedBy || 'Master'}`}
                                    >
                                      EDITADO
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-neutral-400 font-normal">
                                  {r.userEmail}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {r.userRole || 'Equipe'}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-neutral-300">
                            <div className="text-neutral-400 text-[11px]">{r.date}</div>
                            <div className="text-white font-black text-sm">{r.time}</div>
                          </td>
                          <td className="p-3.5 font-bold text-white">
                            {r.typeLabel || r.type}
                          </td>
                          <td className="p-3.5 font-mono text-neutral-400">
                            {r.scheduledTime || '--:--'}
                          </td>
                          <td className="p-3.5">
                            {r.status === 'late' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 border border-amber-800 text-amber-300">
                                Atraso
                              </span>
                            ) : r.status === 'overtime' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-950 border border-blue-800 text-blue-300">
                                Hora Extra
                              </span>
                            ) : r.status === 'early_departure' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-950 border border-purple-800 text-purple-300">
                                Saída Antecipada
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-800 border border-neutral-700 text-neutral-300">
                                Regular
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-neutral-400 text-[11px]">
                            {r.location ? r.location.city || 'GPS Ativo' : 'Auditado'}
                          </td>
                          <td className="p-3.5 font-mono text-[10px] text-neutral-400 font-bold">
                            <span className="truncate max-w-[120px] block" title={r.securityHash}>
                              {r.securityHash}
                            </span>
                          </td>
                          <td className="p-3.5 pr-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspecionar */}
                              <button
                                type="button"
                                onClick={() => setRecordToInspect(r)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
                                title="Inspecionar metadados de auditoria"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Editar (Master Only) */}
                              <button
                                type="button"
                                onClick={() => setRecordToEdit(r)}
                                className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-amber-950/50 border border-amber-800/60 transition-all cursor-pointer flex items-center gap-1"
                                title="Editar horário e dados deste ponto"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold">Editar</span>
                              </button>

                              {/* Apagar (Master Only) */}
                              <button
                                type="button"
                                onClick={() => setRecordToDelete(r)}
                                className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-all cursor-pointer flex items-center gap-1"
                                title="Apagar este ponto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Apagar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Gestão de Escalas Vinculadas (Master Admin) */}
      {activeTab === 'escalas' && isMaster && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Jornadas e Horários Vinculados por Colaborador
              </h3>
              <p className="text-xs text-neutral-400">
                Configure os horários exatos em que cada colaborador pode registrar seu ponto.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Abrir Gerenciador de Escalas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {effectiveSchedules.map((s) => {
              const badge = getRoleBadgeStyle(s.userRole, s.leadershipRole);
              return (
                <div
                  key={s.id}
                  className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3 shadow-md hover:border-neutral-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-white">{s.userName}</h4>
                      <p className="text-xs text-neutral-400">{s.userEmail}</p>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {s.userRole}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-neutral-800 text-xs font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-400 font-sans">1. Entrada:</span>
                      <span className="font-bold text-white">{s.entryTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400 font-sans">2. Saída Almoço:</span>
                      <span className="font-bold text-white">{s.lunchStartTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400 font-sans">3. Retorno Almoço:</span>
                      <span className="font-bold text-white">{s.lunchEndTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400 font-sans">4. Saída Expediente:</span>
                      <span className="font-bold text-white">{s.exitTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                    <span>Tolerância: ±{s.toleranceMinutes}m</span>
                    <span
                      className={`font-bold ${
                        s.strictEnforcement ? 'text-amber-400' : 'text-neutral-500'
                      }`}
                    >
                      {s.strictEnforcement ? 'Trava Estrita ON' : 'Trava OFF'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Employee Schedule Modal */}
      <EmployeeScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        schedules={effectiveSchedules}
        onSaveSchedule={onSaveSchedule}
        onDeleteSchedule={onDeleteSchedule}
      />

      {/* Edit Time Clock Record Modal (Master Admin) */}
      <EditTimeClockModal
        record={recordToEdit}
        onClose={() => setRecordToEdit(null)}
        onSave={async (id, updatedData) => {
          if (onUpdateTimeClockRecord) {
            await onUpdateTimeClockRecord(id, updatedData);
          }
        }}
        employeeWorkSchedules={effectiveSchedules}
        currentAdminName={userName}
      />

      {/* Manual Time Clock Record Modal (Master Admin) */}
      <ManualPunchModal
        isOpen={showManualPunchModal}
        onClose={() => setShowManualPunchModal(false)}
        onSave={async (newRecord) => {
          await onPunchTimeClock(newRecord);
        }}
        employeeWorkSchedules={effectiveSchedules}
        currentAdminName={userName}
      />

      {/* Inspect Record Modal */}
      <InspectTimeClockModal
        record={recordToInspect}
        onClose={() => setRecordToInspect(null)}
        canEdit={canEditOrAlter}
        onEdit={(rec) => {
          setRecordToInspect(null);
          setRecordToEdit(rec);
        }}
      />

      {/* Modal de Confirmação para Apagar Ponto Errado (Master Admin Only) */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-red-400">
                <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-800/80 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-sm font-black text-white">Apagar Registro de Ponto</h3>
              </div>
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Tem certeza que deseja apagar permanentemente este registro de ponto errado? O colaborador poderá registrar novamente a batida correta na sequência.
            </p>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-400 font-sans">Colaborador:</span>
                <span className="font-bold text-white">{recordToDelete.userName || recordToDelete.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 font-sans">Data & Horário:</span>
                <span className="font-bold text-white">{recordToDelete.date} às {recordToDelete.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 font-sans">Tipo da Batida:</span>
                <span className="font-bold text-amber-400">{recordToDelete.typeLabel || recordToDelete.type}</span>
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-800">
                <span className="font-sans">Hash:</span>
                <span className="truncate max-w-[200px]">{recordToDelete.securityHash}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!recordToDelete) return;
                  try {
                    setIsDeleting(true);
                    if (onDeleteTimeClockRecord) {
                      await onDeleteTimeClockRecord(recordToDelete.id);
                    }
                    setRecordToDelete(null);
                  } catch (err) {
                    console.error('Erro ao apagar ponto:', err);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Apagando...' : 'Confirmar e Apagar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
