import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, FirestoreUserProfile, resolveUserAvatar, cleanAvatarUrl, AGENCY_REGISTERED_TEAM_MEMBERS } from '../lib/firebase';

export interface ChatUser extends FirestoreUserProfile {
  id: string;
  photoURL?: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: any;
}

export function useChatUsers() {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // onSnapshot escuta em tempo real qualquer mudança na coleção 'users' do Firebase
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const liveUsers: ChatUser[] = [];
        snapshot.forEach((docSnap) => {
          const rawData = docSnap.data() as any;
          const photo = resolveUserAvatar(rawData) || cleanAvatarUrl(rawData.photoURL) || cleanAvatarUrl(rawData.avatarUrl) || cleanAvatarUrl(rawData.avatar) || '';
          const resolvedName =
            (rawData.name && rawData.name.trim()) ||
            (rawData.displayName && rawData.displayName.trim()) ||
            (rawData.fullName && rawData.fullName.trim()) ||
            (rawData.agencyName && rawData.agencyName.trim()) ||
            (rawData.email ? rawData.email.split('@')[0] : 'Colaborador');

          liveUsers.push({
            ...rawData,
            id: docSnap.id,
            uid: docSnap.id,
            name: resolvedName,
            email: (rawData.email || rawData.userEmail || '').trim(),
            avatarUrl: photo,
            photoURL: photo,
            avatar: photo,
            role: rawData.role || 'Membro da Equipe',
            department: rawData.department || 'gestao',
            workStatus: rawData.workStatus || (rawData.status === 'online' ? 'online' : rawData.workStatus) || 'online',
            status: rawData.status || 'active',
            isOnline: rawData.status === 'online' || rawData.isOnline === true,
            lastSeen: rawData.lastSeen,
          });
        });

        // Merge with registered agency defaults to guarantee all seeded team members exist
        const map = new Map<string, ChatUser>();
        for (const u of liveUsers) {
          const emailKey = u.email ? u.email.toLowerCase().trim() : '';
          if (emailKey) {
            map.set(emailKey, u);
          } else if (u.id) {
            map.set(u.id, u);
          }
        }

        for (const def of AGENCY_REGISTERED_TEAM_MEMBERS) {
          if (!def) continue;
          const emailKey = (def.email || '').toLowerCase().trim();
          const existing = emailKey ? map.get(emailKey) : undefined;
          if (existing) {
            const photo = resolveUserAvatar(existing) || resolveUserAvatar(def);
            map.set(emailKey, {
              ...def,
              ...existing,
              avatarUrl: photo,
              photoURL: photo,
              avatar: photo,
              name: existing.name || def.name,
              email: existing.email || def.email,
              role: existing.role || def.role,
              department: existing.department || def.department,
            });
          } else if (emailKey) {
            const photo = resolveUserAvatar(def);
            map.set(emailKey, {
              ...def,
              id: def.uid,
              avatarUrl: photo,
              photoURL: photo,
              avatar: photo,
            });
          }
        }

        const finalList = Array.from(map.values()).filter((u) => u.status !== 'blocked' && u.status !== 'cancelled');
        setUsers(finalList);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao buscar usuários em tempo real no Firestore:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { users, loading, error };
}
