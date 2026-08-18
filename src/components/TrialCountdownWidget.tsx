import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { FirestoreUserProfile } from '../lib/firebase';

interface TrialCountdownWidgetProps {
  userProfile: FirestoreUserProfile | null;
  onOpenUpgradeModal: () => void;
}

export const TrialCountdownWidget: React.FC<TrialCountdownWidgetProps> = ({
  userProfile,
  onOpenUpgradeModal,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 14, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    if (!userProfile) return;

    // If already subscribed to a paid plan
    if (userProfile.plan !== 'Trial Gratuito') {
      return;
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const target = userProfile.trialEndsAt || (now + 14 * 24 * 60 * 60 * 1000);
      const diff = Math.max(0, target - now);

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [userProfile]);

  if (!userProfile) return null;

  // Paid Plan Active State
  if (userProfile.plan !== 'Trial Gratuito') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#142618] border border-[#22c55e]/40 shadow-[0_0_15px_rgba(34,197,94,0.15)] text-xs font-bold text-[#22c55e]">
        <ShieldCheck className="w-4 h-4 text-[#22c55e] animate-pulse" />
        <span>Plano {userProfile.plan} • Ativo 🟢</span>
      </div>
    );
  }

  // Expired Trial State
  if (timeLeft.isExpired) {
    return (
      <button
        onClick={onOpenUpgradeModal}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 text-xs font-extrabold text-red-400 hover:bg-red-900 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-bounce"
      >
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <span>Teste de 14 Dias Expirado — Assinar Agora</span>
      </button>
    );
  }

  // Active Trial Timer State
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181d2c] border border-[#22c55e]/30 shadow-[0_0_12px_rgba(34,197,94,0.12)] text-xs font-medium text-gray-200">
        <Clock className="w-4 h-4 text-[#22c55e] animate-spin-slow shrink-0" />
        <div className="flex items-center gap-1 font-mono font-extrabold text-[#39e01e]">
          <span className="text-gray-400 text-[11px] font-sans">Teste 14 dias:</span>
          <span>{timeLeft.days}d</span>
          <span className="text-gray-500">:</span>
          <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
          <span className="text-gray-500">:</span>
          <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
          <span className="text-gray-500">:</span>
          <span className="w-5 text-center">{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
      </div>

      <button
        onClick={onOpenUpgradeModal}
        className="px-3 py-1.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-extrabold text-xs flex items-center gap-1 shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all hover:scale-105 shrink-0"
      >
        <Zap className="w-3.5 h-3.5 fill-black" />
        <span className="hidden sm:inline">Fazer Upgrade</span>
      </button>
    </div>
  );
};
