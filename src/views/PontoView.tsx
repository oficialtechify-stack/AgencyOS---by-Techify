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
  Printer,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  Check,
  Coffee,
  LogOut,
  LogIn,
  RotateCcw,
  Building,
  Info,
  Sliders,
  Lock,
  Trash2,
  X,
} from 'lucide-react';
import { EmployeeWorkSchedule, TimeClockRecord, TimeClockType } from '../types';
import { FirestoreUserProfile } from '../lib/firebase';
import { isLeader, isUserMasterAdmin } from '../lib/permissions';
import { EmployeeScheduleModal } from '../components/timeclock/EmployeeScheduleModal';
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
  onOpenPunchModal: () => void;
  onSaveSchedule?: (schedule: EmployeeWorkSchedule) => Promise<void>;
  onDeleteSchedule?: (id: string) => Promise<void>;
}

export const PontoView: React.FC<PontoViewProps> = ({
  userProfile,
  timeClockRecords = [],
  employeeWorkSchedules = [],
  onPunchTimeClock: _onPunchTimeClock,
  onDeleteTimeClockRecord,
  onOpenPunchModal,
  onSaveSchedule = async () => {},
  onDeleteSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<'meu-ponto' | 'equipe' | 'escalas'>('meu-ponto');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<TimeClockRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isUserLeader = isLeader(userProfile);
  const isMaster = isUserMasterAdmin(userProfile);
  const canManageSchedules = isUserLeader || isMaster;

  const userEmail = userProfile?.email || 'rickmarketing81@gmail.com';
  const userName = userProfile?.name || 'Marcos Henrique';
  const userRole = userProfile?.role || 'Diretor Executivo / Master';

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
      `"${r.securityHash || ''}"`,
      `"${r.deviceInfo || ''}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
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
                Alô Seguro & Auditado
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStatusBadge.color}`}
              >
                {currentStatusBadge.text}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1">
              Registro estrito de 1 ponto por vez na sequência legal, com horário vinculado por
              colaborador e auditoria de Nome e Cargo.
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
              <span>Ajustar Escalas & Horários</span>
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
          <div className="text-2xl font-black text-white">{monthlyRecords.length}</div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Registros auditados em {selectedMonth}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
            <span>Escala Vinculada</span>
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm font-black text-white font-mono">
            {mySchedule.entryTime} → {mySchedule.lunchStartTime} → {mySchedule.exitTime}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Tolerância: ±{mySchedule.toleranceMinutes} min (Trava:{' '}
            {mySchedule.strictEnforcement ? 'Ativa' : 'Off'})
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold mb-2">
            <span>Identificação & Auditoria</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xs font-black text-white truncate">{userName}</div>
          <div className="text-[11px] text-neutral-400 truncate">{userRole}</div>
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

        {canManageSchedules && (
          <button
            onClick={() => setActiveTab('equipe')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'equipe'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Painel da Equipe & Presença ({Object.keys(teamTodayGrouped).length} Ativos Hoje)</span>
          </button>
        )}

        {canManageSchedules && (
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
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Espelho</span>
              </button>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <span className="font-extrabold text-white text-sm">
                Registros de Ponto ({monthlyRecords.length})
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {userName} ({userRole})
              </span>
            </div>

            {monthlyRecords.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 text-xs space-y-2">
                <Clock className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                <p className="font-bold text-neutral-400">
                  Nenhum registro encontrado para este mês.
                </p>
                <p>Clique em "Bater Ponto Agora" para iniciar o registro da sua jornada.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-[10px] uppercase font-black text-neutral-400 tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="p-3.5 pl-5">Data</th>
                      <th className="p-3.5">Horário Real</th>
                      <th className="p-3.5">Horário Previsto</th>
                      <th className="p-3.5">Tipo do Ponto</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Localização GPS</th>
                      <th className="p-3.5">Hash Auditado</th>
                      <th className="p-3.5 pr-5 text-right">Ação</th>
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
                          <td className="p-3.5 pl-5 font-bold text-white font-mono flex items-center gap-2">
                            <span>{r.date}</span>
                            {isToday && (
                              <span className="text-[9px] bg-white text-black px-1.5 py-0.5 rounded font-black">
                                HOJE
                              </span>
                            )}
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
                            <button
                              type="button"
                              onClick={() => setRecordToDelete(r)}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Apagar este ponto errado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline text-[11px]">Apagar</span>
                            </button>
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

      {/* Tab: Controle da Equipe (Líderes & Administradores) */}
      {activeTab === 'equipe' && canManageSchedules && (
        <div className="space-y-6">
          {/* Team Members Today Presence Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Status da Equipe Hoje ({todayStr})
              </h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                Gerenciar Horários da Equipe
              </button>
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

          {/* Full Audit Filter and Table */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por colaborador (Nome), cargo ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white w-full sm:w-80 focus:outline-none focus:border-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="entry">Apenas Entradas</option>
                <option value="lunch_start">Apenas Saída Almoço</option>
                <option value="lunch_end">Apenas Retorno Almoço</option>
                <option value="exit">Apenas Saídas</option>
              </select>
            </div>
          </div>

          {/* All Team Records Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <span className="font-extrabold text-white text-sm">
                Auditoria de Registros de Ponto ({timeClockRecords.length})
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Identificação Completa: Nome + Cargo
              </span>
            </div>

            {timeClockRecords.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 text-xs">
                Nenhum ponto registrado por colaboradores ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950 text-[10px] uppercase font-black text-neutral-400 tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="p-3.5 pl-5">Colaborador (Nome & E-mail)</th>
                      <th className="p-3.5">Cargo Oficial</th>
                      <th className="p-3.5">Data & Horário</th>
                      <th className="p-3.5">Registro</th>
                      <th className="p-3.5">Horário Vinculado</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Localização GPS</th>
                      <th className="p-3.5">Hash Auditado</th>
                      <th className="p-3.5 pr-5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-sans">
                    {timeClockRecords
                      .filter((r) => {
                        if (filterType !== 'todos' && r.type !== filterType) return false;
                        if (searchTerm) {
                          const term = searchTerm.toLowerCase();
                          const matches =
                            (r.userName || '').toLowerCase().includes(term) ||
                            (r.userEmail || '').toLowerCase().includes(term) ||
                            (r.userRole || '').toLowerCase().includes(term);
                          if (!matches) return false;
                        }
                        return true;
                      })
                      .map((r) => {
                        const badge = getRoleBadgeStyle(r.userRole, r.leadershipRole);
                        return (
                          <tr key={r.id} className="hover:bg-neutral-800/40 transition-colors">
                            <td className="p-3.5 pl-5 font-bold text-white">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  {(r.userName || 'U')[0].toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-xs">
                                    {r.userName || 'Colaborador'}
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
                              <div>{r.date}</div>
                              <div className="text-white font-black">{r.time}</div>
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
                              {r.securityHash}
                            </td>
                            <td className="p-3.5 pr-5 text-right">
                              <button
                                type="button"
                                onClick={() => setRecordToDelete(r)}
                                className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/60 transition-all cursor-pointer inline-flex items-center gap-1"
                                title="Apagar este ponto errado"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-[11px]">Apagar</span>
                              </button>
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

      {/* Tab: Gestão de Escalas Vinculadas */}
      {activeTab === 'escalas' && canManageSchedules && (
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

      {/* Modal de Confirmação para Apagar Ponto Errado */}
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
              Tem certeza que deseja apagar permanentemente este registro de ponto errado? O colaborador poderá registrar novamente a batida correta.
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
