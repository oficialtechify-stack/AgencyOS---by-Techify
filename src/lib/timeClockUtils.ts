import { EmployeeWorkSchedule, TimeClockRecord, TimeClockType } from '../types';

export const DEFAULT_WORK_SCHEDULES: EmployeeWorkSchedule[] = [
  {
    id: 'sched-default-1',
    userEmail: 'rickmarketing81@gmail.com',
    userName: 'Marcos Henrique',
    userRole: 'Diretor Executivo / Master',
    leadershipRole: 'lider_geral',
    entryTime: '08:00',
    lunchStartTime: '12:00',
    lunchEndTime: '13:00',
    exitTime: '17:00',
    toleranceMinutes: 15,
    strictEnforcement: true,
    minIntervalMinutes: 5,
    workDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
    allowOvertime: true,
    notes: 'Jornada Padrão de Diretoria (8h diárias)',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sched-default-2',
    userEmail: 'marketing@agencyos.com',
    userName: 'Lucas Silva',
    userRole: 'Líder de Marketing & Tráfego',
    leadershipRole: 'lider_marketing',
    entryTime: '08:30',
    lunchStartTime: '12:30',
    lunchEndTime: '13:30',
    exitTime: '17:30',
    toleranceMinutes: 15,
    strictEnforcement: true,
    minIntervalMinutes: 5,
    workDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
    allowOvertime: true,
    notes: 'Escala Equipe de Marketing e Performance',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sched-default-3',
    userEmail: 'prospeccao@agencyos.com',
    userName: 'Mariana Costa',
    userRole: 'Líder de Prospecção / SDR',
    leadershipRole: 'lider_prospeccao',
    entryTime: '08:00',
    lunchStartTime: '12:00',
    lunchEndTime: '13:00',
    exitTime: '17:00',
    toleranceMinutes: 15,
    strictEnforcement: true,
    minIntervalMinutes: 5,
    workDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
    allowOvertime: false,
    notes: 'Escala Equipe Comercial e Cold Calling',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sched-default-4',
    userEmail: 'design@agencyos.com',
    userName: 'Vitória Santos',
    userRole: 'Líder de Design & Criação',
    leadershipRole: 'lider_design',
    entryTime: '09:00',
    lunchStartTime: '13:00',
    lunchEndTime: '14:00',
    exitTime: '18:00',
    toleranceMinutes: 15,
    strictEnforcement: true,
    minIntervalMinutes: 5,
    workDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
    allowOvertime: true,
    notes: 'Escala Criação e Produção Visual',
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Find or generate a default schedule for an employee
 */
export function getEmployeeSchedule(
  schedules: EmployeeWorkSchedule[] = [],
  userEmail: string,
  userRole?: string,
  userName?: string
): EmployeeWorkSchedule {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  const existing = schedules.find((s) => (s.userEmail || '').toLowerCase().trim() === normalizedEmail);
  if (existing) return existing;

  const defaultMatch = DEFAULT_WORK_SCHEDULES.find(
    (s) => s.userEmail.toLowerCase() === normalizedEmail
  );
  if (defaultMatch) return defaultMatch;

  // Generate fallback schedule
  return {
    id: `sched-auto-${normalizedEmail.replace(/[^a-z0-9]/g, '-') || 'user'}`,
    userEmail: normalizedEmail || 'colaborador@agencyos.com',
    userName: userName || 'Colaborador',
    userRole: userRole || 'Membro da Equipe',
    entryTime: '08:00',
    lunchStartTime: '12:00',
    lunchEndTime: '13:00',
    exitTime: '17:00',
    toleranceMinutes: 15,
    strictEnforcement: true,
    minIntervalMinutes: 5,
    workDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
    allowOvertime: false,
    notes: 'Escala Padrão Vinculada (08:00 às 17:00)',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Converts "HH:mm" string to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/**
 * Converts minutes from midnight to "HH:mm"
 */
export function minutesToTimeString(minutes: number): string {
  const norm = Math.max(0, minutes % (24 * 60));
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface SequentialPunchRule {
  nextType: TimeClockType;
  nextLabel: string;
  isAllowed: boolean;
  stepNumber: number;
  totalSteps: number;
  reason?: string;
  timeRemainingSec?: number;
}

/**
 * Enforces strict sequential punch order:
 * 1. Entrada (Manhã)
 * 2. Saída para Almoço
 * 3. Retorno do Almoço
 * 4. Saída do Expediente
 * 5. Hora Extra (se permitido)
 */
export function getStrictSequentialStatus(
  todayRecords: TimeClockRecord[],
  minIntervalMinutes: number = 5,
  currentDate: Date = new Date()
): SequentialPunchRule {
  // Sort today's records chronologically
  const sorted = [...todayRecords].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const hasEntry = sorted.some((r) => r.type === 'entry');
  const hasLunchStart = sorted.some((r) => r.type === 'lunch_start');
  const hasLunchEnd = sorted.some((r) => r.type === 'lunch_end');
  const hasExit = sorted.some((r) => r.type === 'exit');
  const hasExtraStart = sorted.some((r) => r.type === 'extra_start');
  const hasExtraEnd = sorted.some((r) => r.type === 'extra_end');

  let nextType: TimeClockType = 'entry';
  let nextLabel = '1. Registrar Entrada da Manhã';
  let stepNumber = 1;
  const totalSteps = 4;

  if (!hasEntry) {
    nextType = 'entry';
    nextLabel = '1. Registrar Entrada da Manhã';
    stepNumber = 1;
  } else if (!hasLunchStart) {
    nextType = 'lunch_start';
    nextLabel = '2. Registrar Saída para Almoço';
    stepNumber = 2;
  } else if (!hasLunchEnd) {
    nextType = 'lunch_end';
    nextLabel = '3. Registrar Retorno do Almoço';
    stepNumber = 3;
  } else if (!hasExit) {
    nextType = 'exit';
    nextLabel = '4. Registrar Saída do Expediente';
    stepNumber = 4;
  } else if (!hasExtraStart) {
    nextType = 'extra_start';
    nextLabel = '5. Iniciar Hora Extra (Opcional)';
    stepNumber = 5;
  } else if (!hasExtraEnd) {
    nextType = 'extra_end';
    nextLabel = '6. Finalizar Hora Extra';
    stepNumber = 6;
  } else {
    return {
      nextType: 'extra_start',
      nextLabel: 'Jornada Completa Hoje',
      isAllowed: false,
      stepNumber: 4,
      totalSteps: 4,
      reason: 'Todos os pontos do dia foram registrados e validados com sucesso.',
    };
  }

  // Check minimum interval from last punch
  if (sorted.length > 0) {
    const lastRecord = sorted[sorted.length - 1];
    const lastTime = new Date(lastRecord.timestamp).getTime();
    const elapsedMs = currentDate.getTime() - lastTime;
    const minMs = minIntervalMinutes * 60 * 1000;

    if (elapsedMs < minMs) {
      const remainingMs = minMs - elapsedMs;
      const remainingSec = Math.ceil(remainingMs / 1000);
      const remainingMin = Math.ceil(remainingSec / 60);
      return {
        nextType,
        nextLabel,
        isAllowed: false,
        stepNumber,
        totalSteps,
        timeRemainingSec: remainingSec,
        reason: `Intervalo de segurança anti-fraude: Aguarde ${remainingMin} min (${remainingSec}s) desde o último ponto (${lastRecord.typeLabel} às ${lastRecord.time}).`,
      };
    }
  }

  return {
    nextType,
    nextLabel,
    isAllowed: true,
    stepNumber,
    totalSteps,
  };
}

export interface ScheduleValidationResult {
  isValid: boolean;
  isStrictlyBlocked: boolean;
  expectedTime: string;
  toleranceMin: number;
  allowedWindowStart: string;
  allowedWindowEnd: string;
  currentTimeStr: string;
  diffMinutes: number;
  status: 'regular' | 'late' | 'overtime' | 'early_departure';
  message: string;
}

/**
 * Validates whether the punch is happening within the employee's bound schedule
 */
export function validateScheduleTime(
  type: TimeClockType,
  schedule: EmployeeWorkSchedule,
  currentDate: Date = new Date(),
  overrideStrictCheck: boolean = false
): ScheduleValidationResult {
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  const currentTimeStr = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;

  let targetExpectedStr = schedule.entryTime || '08:00';
  if (type === 'lunch_start') targetExpectedStr = schedule.lunchStartTime || '12:00';
  else if (type === 'lunch_end') targetExpectedStr = schedule.lunchEndTime || '13:00';
  else if (type === 'exit') targetExpectedStr = schedule.exitTime || '17:00';
  else if (type === 'extra_start' || type === 'extra_end') targetExpectedStr = schedule.exitTime || '17:00';

  const expectedMinutes = timeStringToMinutes(targetExpectedStr);
  const tolerance = schedule.toleranceMinutes || 15;
  const windowStartMin = expectedMinutes - tolerance;
  const windowEndMin = expectedMinutes + tolerance;

  const allowedWindowStart = minutesToTimeString(windowStartMin);
  const allowedWindowEnd = minutesToTimeString(windowEndMin);

  const diffMinutes = currentMinutes - expectedMinutes;

  let status: 'regular' | 'late' | 'overtime' | 'early_departure' = 'regular';
  let isValid = true;
  let isStrictlyBlocked = false;
  let message = `Horário dentro da tolerância vinculada (${allowedWindowStart} às ${allowedWindowEnd}).`;

  if (type === 'entry') {
    if (currentMinutes < windowStartMin) {
      status = 'regular';
      if (schedule.strictEnforcement && !overrideStrictCheck) {
        isValid = false;
        isStrictlyBlocked = true;
        message = `Entrada antecipada bloqueada: Seu horário vinculado é ${targetExpectedStr} (Janela: ${allowedWindowStart} às ${allowedWindowEnd}). Horário atual: ${currentTimeStr}.`;
      } else {
        message = `Entrada registrada antes do horário oficial (${targetExpectedStr}).`;
      }
    } else if (currentMinutes > windowEndMin) {
      status = 'late';
      if (schedule.strictEnforcement && !overrideStrictCheck && currentMinutes > windowEndMin + 60) {
        // More than 1 hour late with strict block
        isValid = false;
        isStrictlyBlocked = true;
        message = `Entrada com atraso excessivo bloqueada: Horário oficial era ${targetExpectedStr}. É necessária autorização da liderança.`;
      } else {
        message = `Atraso de ${diffMinutes} min em relação ao horário vinculado (${targetExpectedStr}).`;
      }
    }
  } else if (type === 'lunch_start') {
    if (currentMinutes < windowStartMin) {
      status = 'early_departure';
      if (schedule.strictEnforcement && !overrideStrictCheck) {
        isValid = false;
        isStrictlyBlocked = true;
        message = `Almoço antecipado bloqueado: Seu horário de almoço vinculado é ${targetExpectedStr} (Janela: ${allowedWindowStart} às ${allowedWindowEnd}).`;
      }
    } else if (currentMinutes > windowEndMin) {
      status = 'late';
    }
  } else if (type === 'lunch_end') {
    if (currentMinutes > windowEndMin) {
      status = 'late';
      message = `Retorno de almoço com atraso de ${diffMinutes} min (esperado: ${targetExpectedStr}).`;
    }
  } else if (type === 'exit') {
    if (currentMinutes < windowStartMin) {
      status = 'early_departure';
      if (schedule.strictEnforcement && !overrideStrictCheck) {
        isValid = false;
        isStrictlyBlocked = true;
        message = `Saída antecipada bloqueada: Seu horário de encerramento é ${targetExpectedStr} (Janela: ${allowedWindowStart} às ${allowedWindowEnd}). Horário atual: ${currentTimeStr}.`;
      } else {
        message = `Saída registrada antes do término do expediente (${targetExpectedStr}).`;
      }
    } else if (currentMinutes > windowEndMin) {
      status = 'overtime';
      message = `Saída com hora adicional (${diffMinutes} min após ${targetExpectedStr}).`;
    }
  } else if (type === 'extra_start' || type === 'extra_end') {
    status = 'overtime';
  }

  return {
    isValid,
    isStrictlyBlocked,
    expectedTime: targetExpectedStr,
    toleranceMin: tolerance,
    allowedWindowStart,
    allowedWindowEnd,
    currentTimeStr,
    diffMinutes,
    status,
    message,
  };
}

/**
 * Generate human-friendly role badge with colors
 */
export function getRoleBadgeStyle(role: string = '', leadershipRole?: string): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  const norm = role.toLowerCase();
  const leaderNorm = (leadershipRole || '').toLowerCase();

  if (leaderNorm === 'lider_geral' || norm.includes('master') || norm.includes('diretor') || norm.includes('ceo')) {
    return {
      label: role || 'Diretoria / Master',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    };
  }
  if (leaderNorm === 'lider_marketing' || norm.includes('marketing') || norm.includes('tráfego') || norm.includes('media buyer')) {
    return {
      label: role || 'Marketing & Tráfego',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
    };
  }
  if (leaderNorm === 'lider_prospeccao' || norm.includes('prospec') || norm.includes('sdr') || norm.includes('comercial') || norm.includes('vendas')) {
    return {
      label: role || 'Comercial & SDR',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
    };
  }
  if (leaderNorm === 'lider_design' || norm.includes('design') || norm.includes('criação') || norm.includes('arte') || norm.includes('vídeo')) {
    return {
      label: role || 'Design & Criação',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
    };
  }
  return {
    label: role || 'Colaborador',
    bg: 'bg-neutral-800',
    text: 'text-neutral-300',
    border: 'border-neutral-700',
  };
}
