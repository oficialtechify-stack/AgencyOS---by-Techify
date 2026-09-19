import React, { useEffect, useState } from 'react';
import { Clock, Lock } from 'lucide-react';

interface Props {
  trialEndsAt: string;
  onExpire?: () => void;
}

export function TrialCountdownBanner({ trialEndsAt, onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(trialEndsAt).getTime() - new Date().getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [trialEndsAt, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center justify-between text-red-400">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-sm">Seu período de teste de 14 dias expirou.</span>
        </div>
        <button className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-500 transition cursor-pointer">
          Assinar um Plano Agora
        </button>
      </div>
    );
  }

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between text-emerald-400">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span>Período de Teste Grátis Ativo (14 Dias):</span>
      </div>
      <div className="flex gap-2 text-xs font-bold text-white">
        <span className="bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
          {timeLeft.days}d
        </span>
        <span className="bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
          {timeLeft.hours}h
        </span>
        <span className="bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
          {timeLeft.minutes}m
        </span>
        <span className="bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30 text-emerald-400">
          {timeLeft.seconds}s
        </span>
      </div>
    </div>
  );
}

export default TrialCountdownBanner;
