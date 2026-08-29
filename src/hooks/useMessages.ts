import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, resolveUserAvatar, cleanAvatarUrl, sanitizeFirestorePayload } from '../lib/firebase';
import { ChatMessage } from '../types';

export function useMessages(channelId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Consulta em tempo real ordenada por data de criação
    const chatRef = collection(db, 'agencyChatMessages');
    const q = query(
      chatRef,
      where('channelId', '==', channelId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const raw = docSnap.data() as any;
          const photo = resolveUserAvatar(raw.senderAvatar || raw.senderPhoto || raw.senderPhotoUrl);
          msgs.push({
            id: docSnap.id,
            ...raw,
            senderAvatar: photo,
          } as ChatMessage);
        });

        // Ordenação cronológica crescente
        msgs.sort((a, b) => {
          const timeA = a.createdAt || '';
          const timeB = b.createdAt || '';
          return timeA.localeCompare(timeB);
        });

        setMessages(msgs);
        setLoading(false);
      },
      (err) => {
        console.error(`Erro ao escutar mensagens do canal ${channelId}:`, err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [channelId]);

  const sendMessage = async (
    text: string,
    user: {
      uid?: string;
      id?: string;
      name?: string;
      email?: string;
      photoURL?: string;
      avatarUrl?: string;
      avatar?: string;
      role?: string;
      department?: string;
    },
    extraData?: Partial<ChatMessage>
  ) => {
    if (!text.trim() && !extraData?.fileUrl && !extraData?.agencyShareData) return;
    if (!channelId) return;

    const senderPhoto = resolveUserAvatar(user) || cleanAvatarUrl(user.photoURL) || cleanAvatarUrl(user.avatarUrl) || cleanAvatarUrl(user.avatar) || '';
    const nowIso = new Date().toISOString();
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const messagePayload: ChatMessage = {
      id: msgId,
      channelId,
      senderUid: user.uid || user.id || 'usr_anonymous',
      senderName: user.name || user.email?.split('@')[0] || 'Colaborador',
      senderEmail: (user.email || '').toLowerCase().trim(),
      senderAvatar: senderPhoto,
      senderRole: user.role || 'Membro da Equipe',
      senderDepartment: user.department || 'marketing',
      text: text.trim(),
      type: extraData?.type || 'text',
      fileUrl: extraData?.fileUrl,
      fileName: extraData?.fileName,
      fileSize: extraData?.fileSize,
      fileType: extraData?.fileType,
      agencyShareData: extraData?.agencyShareData,
      createdAt: nowIso,
      ...extraData,
    };

    const cleanData = sanitizeFirestorePayload(messagePayload);
    const msgRef = doc(db, 'agencyChatMessages', msgId);
    await setDoc(msgRef, {
      ...cleanData,
      serverCreatedAt: serverTimestamp(),
    }, { merge: true });

    // Atualiza metadados do canal (última mensagem)
    try {
      const chanRef = doc(db, 'agencyChatChannels', channelId);
      await setDoc(
        chanRef,
        {
          id: channelId,
          lastMessageText: text.trim() || (extraData?.type === 'image' ? '📷 Imagem' : '📁 Arquivo'),
          lastMessageTime: nowIso,
          lastMessageSender: user.name || user.email,
          lastMessageType: extraData?.type || 'text',
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Could not update channel last message:', e);
    }
  };

  return { messages, sendMessage, loading, error };
}
