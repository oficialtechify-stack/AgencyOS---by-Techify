import { useEffect, useRef } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function usePresence(userId?: string | null, userEmail?: string | null) {
  const isOnlineRef = useRef(false);

  useEffect(() => {
    const targetId = userId || (userEmail ? userEmail.replace(/[^a-zA-Z0-9_-]/g, '_') : null);
    if (!targetId) return;

    const userRef = doc(db, 'users', targetId);

    // 1. Define como online ao entrar no sistema
    const setOnline = async () => {
      try {
        await setDoc(
          userRef,
          {
            status: 'online',
            isOnline: true,
            workStatus: 'online',
            lastSeen: serverTimestamp(),
            lastActiveAt: new Date().toISOString(),
          },
          { merge: true }
        );
        isOnlineRef.current = true;
      } catch (err) {
        console.warn('Erro ao definir status online no Firestore:', err);
      }
    };

    // 2. Define como offline ao sair
    const setOffline = async () => {
      try {
        await setDoc(
          userRef,
          {
            status: 'offline',
            isOnline: false,
            workStatus: 'offline',
            lastSeen: serverTimestamp(),
            lastActiveAt: new Date().toISOString(),
          },
          { merge: true }
        );
        isOnlineRef.current = false;
      } catch (err) {
        console.warn('Erro ao definir status offline no Firestore:', err);
      }
    };

    setOnline();

    // Heartbeat periódico a cada 35 segundos para manter status ativo e lastSeen atualizado
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setOnline();
      }
    }, 35000);

    // Detecta quando a janela é fechada ou o usuário sai
    const handleUnload = () => {
      setOffline();
    };

    // Detecta alternância de abas/visibilidade
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setOnline();
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      handleUnload();
    };
  }, [userId, userEmail]);
}
