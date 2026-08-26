import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Image,
  Film,
  FileText,
  Paperclip,
  Users,
  Plus,
  Search,
  Check,
  CheckCheck,
  Trash2,
  Share2,
  Clock,
  Circle,
  Sparkles,
  Smile,
  X,
  Download,
  ExternalLink,
  ChevronRight,
  Target,
  Package,
  Layers,
  Flame,
  User,
  ShieldCheck,
  FolderPlus,
} from 'lucide-react';
import {
  ChatMessage,
  ChatChannel,
  AgencySharePayload,
  UserProfile,
  TimeClockRecord,
  ProspectionDemand,
  ProspectionClosedContract,
  TechifyPackageOption,
} from '../types';
import { FirestoreUserProfile, AGENCY_REGISTERED_TEAM_MEMBERS } from '../lib/firebase';
import { TECHIFY_PACKAGES } from '../data/techifyPackages';

interface EmpresaChatViewProps {
  currentUser?: UserProfile | null;
  userProfile?: FirestoreUserProfile | null;
  allUsers?: FirestoreUserProfile[];
  messages: ChatMessage[];
  channels: ChatChannel[];
  timeClockRecords?: TimeClockRecord[];
  prospectionDemands?: ProspectionDemand[];
  prospectionContracts?: ProspectionClosedContract[];
  techifyPackages?: TechifyPackageOption[];
  onSendMessage: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteMessage: (msgId: string) => Promise<void>;
  onCreateChannel: (channel: Omit<ChatChannel, 'id' | 'createdAt'>) => Promise<void>;
  onMarkChannelAsRead: (channelId: string) => void;
}

// Built-in company default channels
const DEFAULT_CHANNELS: ChatChannel[] = [
  {
    id: 'grp_geral',
    name: 'Geral & Comunicados',
    description: 'Canal oficial de todos os colaboradores da agência',
    type: 'department',
    department: 'geral',
    members: [],
    icon: '🏢',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'grp_mkt_design',
    name: 'Marketing + Criação & Design',
    description: 'Alinhamento de campanhas, criativos e artes',
    type: 'department',
    department: 'marketing',
    members: [],
    icon: '🎨',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'grp_prospeccao',
    name: 'Prospecção & Fechamentos',
    description: 'Demandas comerciais, SDRs, closers e novos clientes',
    type: 'department',
    department: 'prospeccao',
    members: [],
    icon: '🎯',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'grp_trafego',
    name: 'Tráfego & Performance',
    description: 'Otimizações de Meta Ads, Google Ads e ROAS',
    type: 'department',
    department: 'trafego',
    members: [],
    icon: '⚡',
    createdAt: new Date().toISOString(),
  },
];

// Helper to infer department when not explicitly populated
export function inferUserDepartment(u: Partial<FirestoreUserProfile>): 'gestao' | 'marketing' | 'design' | 'prospeccao' | 'trafego' {
  if (u.department) return u.department as any;
  const role = ((u.role || '') + ' ' + (u.leadershipRole || '')).toLowerCase();
  if (role.includes('marketing')) return 'marketing';
  if (role.includes('design') || role.includes('criativ') || role.includes('arte')) return 'design';
  if (role.includes('prospec') || role.includes('sdr') || role.includes('closer') || role.includes('comercial')) return 'prospeccao';
  if (role.includes('tráfego') || role.includes('trafego') || role.includes('gestor') || role.includes('performance') || role.includes('ads')) return 'trafego';
  return 'gestao';
}

export const EmpresaChatView: React.FC<EmpresaChatViewProps> = ({
  currentUser,
  userProfile,
  allUsers = [],
  messages = [],
  channels = [],
  timeClockRecords = [],
  prospectionDemands = [],
  prospectionContracts = [],
  techifyPackages = [],
  onSendMessage,
  onDeleteMessage,
  onCreateChannel,
  onMarkChannelAsRead,
}) => {
  // Merge system channels with custom user channels
  const effectiveChannels = [...DEFAULT_CHANNELS, ...channels];

  // Resilient team list: merges registered system members with live Firestore users
  const teamList = React.useMemo(() => {
    const map = new Map<string, FirestoreUserProfile>();
    for (const def of AGENCY_REGISTERED_TEAM_MEMBERS) {
      if (def && def.email) {
        map.set(def.email.toLowerCase().trim(), def);
      }
    }
    for (const u of (allUsers || [])) {
      if (u && u.email) {
        const existing = map.get(u.email.toLowerCase().trim());
        map.set(u.email.toLowerCase().trim(), { ...existing, ...u });
      }
    }
    return Array.from(map.values()).filter((u) => u && u.email && u.status !== 'blocked' && u.status !== 'cancelled');
  }, [allUsers]);

  // Active channel / DM selection
  const [activeChannelId, setActiveChannelId] = useState<string>('grp_geral');
  const [activeRecipient, setActiveRecipient] = useState<FirestoreUserProfile | null>(null);

  // Message inputs
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  // New group state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDept, setNewGroupDept] = useState('marketing');
  const [selectedMemberEmails, setSelectedMemberEmails] = useState<string[]>([]);

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myEmail = (userProfile?.email || currentUser?.email || 'rickmarketing81@gmail.com').toLowerCase().trim();
  const myName = userProfile?.name || currentUser?.name || 'Colaborador Techify';
  const myAvatar = userProfile?.avatarUrl || '';
  const myRole = userProfile?.role || 'Membro da Equipe';
  const myDepartment = userProfile?.department || 'marketing';

  // Helper to compute user's time clock status for today
  const todayStr = new Date().toISOString().split('T')[0];
  const getUserTimeClockStatus = (userEmail: string) => {
    const userTodayRecords = timeClockRecords
      .filter((r) => r.date === todayStr && (r.userEmail || '').toLowerCase().trim() === userEmail.toLowerCase().trim())
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    if (userTodayRecords.length === 0) {
      return {
        status: 'offline',
        label: 'Fora do Expediente',
        dotColor: 'bg-neutral-500',
        badgeColor: 'text-neutral-400 bg-neutral-900 border-neutral-800',
      };
    }

    const lastPunch = userTodayRecords[userTodayRecords.length - 1];
    if (lastPunch.type === 'lunch_start') {
      return {
        status: 'lunch',
        label: 'Almoçando 🍽️',
        dotColor: 'bg-amber-400 animate-pulse',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30 font-bold',
      };
    } else if (lastPunch.type === 'exit') {
      return {
        status: 'offline',
        label: 'Expediente Encerrado',
        dotColor: 'bg-neutral-500',
        badgeColor: 'text-neutral-400 bg-neutral-900 border-neutral-800',
      };
    } else {
      return {
        status: 'working',
        label: 'Presente no Trabalho 🟢',
        dotColor: 'bg-emerald-400 animate-pulse',
        badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 font-bold',
      };
    }
  };

  // Scroll to bottom on new message and mark as read only when unread messages exist
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    const hasUnread = messages.some(
      (m) => m.channelId === activeChannelId && (!myEmail || !m.readBy?.[myEmail])
    );
    if (hasUnread) {
      onMarkChannelAsRead(activeChannelId);
    }
  }, [messages.length, activeChannelId]);

  // Handle switching to direct message with a user
  const handleSelectDirectChat = (targetUser: FirestoreUserProfile) => {
    const targetEmail = targetUser.email.toLowerCase().trim();
    // Unique deterministic DM channel ID based on sorted emails
    const pair = [myEmail, targetEmail].sort();
    const dmChannelId = `dm_${pair[0].replace(/[^a-zA-Z0-9]/g, '_')}_${pair[1].replace(/[^a-zA-Z0-9]/g, '_')}`;

    setActiveChannelId(dmChannelId);
    setActiveRecipient(targetUser);
  };

  // Handle switching to a group/channel
  const handleSelectChannel = (channel: ChatChannel) => {
    setActiveChannelId(channel.id);
    setActiveRecipient(null);
  };

  // Filter messages for active channel
  const currentMessages = messages.filter((m) => m.channelId === activeChannelId);

  // Send plain text message
  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await onSendMessage({
        channelId: activeChannelId,
        senderUid: userProfile?.uid || 'user-current',
        senderName: myName,
        senderEmail: myEmail,
        senderAvatar: myAvatar,
        senderRole: myRole,
        senderDepartment: myDepartment,
        recipientEmail: activeRecipient?.email,
        text: textToSend,
        type: 'text',
        readBy: {
          [myEmail]: {
            readAt: new Date().toISOString(),
            userName: myName,
          },
        },
      });
    } finally {
      setIsSending(false);
    }
  };

  // Send Agency item share (demanda, contrato, pacote)
  const handleShareAgencyItem = async (payload: AgencySharePayload) => {
    setIsShareModalOpen(false);
    setIsSending(true);

    try {
      await onSendMessage({
        channelId: activeChannelId,
        senderUid: userProfile?.uid || 'user-current',
        senderName: myName,
        senderEmail: myEmail,
        senderAvatar: myAvatar,
        senderRole: myRole,
        senderDepartment: myDepartment,
        recipientEmail: activeRecipient?.email,
        text: `Compartilhou ${payload.title}: ${payload.subtitle || ''}`,
        type: 'agency_share',
        agencyShareData: payload,
        readBy: {
          [myEmail]: {
            readAt: new Date().toISOString(),
            userName: myName,
          },
        },
      });
    } finally {
      setIsSending(false);
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;

      let msgType: 'image' | 'video' | 'file' = 'file';
      if (file.type.startsWith('image/')) msgType = 'image';
      else if (file.type.startsWith('video/')) msgType = 'video';

      const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      };

      await onSendMessage({
        channelId: activeChannelId,
        senderUid: userProfile?.uid || 'user-current',
        senderName: myName,
        senderEmail: myEmail,
        senderAvatar: myAvatar,
        senderRole: myRole,
        senderDepartment: myDepartment,
        recipientEmail: activeRecipient?.email,
        text: file.name,
        type: msgType,
        fileUrl: dataUrl,
        fileName: file.name,
        fileSize: formatSize(file.size),
        fileType: file.type,
        readBy: {
          [myEmail]: {
            readAt: new Date().toISOString(),
            userName: myName,
          },
        },
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Create custom group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newChan: Omit<ChatChannel, 'id' | 'createdAt'> = {
      name: newGroupName.trim(),
      type: 'custom_group',
      department: newGroupDept,
      members: Array.from(new Set([myEmail, ...selectedMemberEmails])),
      icon: '👥',
      createdBy: myEmail,
    };

    await onCreateChannel(newChan);
    setIsCreateGroupModalOpen(false);
    setNewGroupName('');
    setSelectedMemberEmails([]);
  };

  // Filter contacts by sector (only registered users from Firestore)
  const filteredUsers = teamList.filter((u) => {
    if (!u.email || !u.name) return false;
    if (u.email.toLowerCase().trim() === myEmail) return false; // don't list self in contacts
    const dept = inferUserDepartment(u);
    if (sectorFilter !== 'all') {
      if (sectorFilter === 'trafego') {
        const role = (u.role || '').toLowerCase();
        if (dept !== 'trafego' && !role.includes('tráfego') && !role.includes('trafego') && !role.includes('gestor')) return false;
      } else if (sectorFilter === 'marketing') {
        const role = (u.role || '').toLowerCase();
        if (dept !== 'marketing' && !role.includes('marketing') && !role.includes('mkt')) return false;
      } else if (sectorFilter === 'design') {
        const role = (u.role || '').toLowerCase();
        if (dept !== 'design' && !role.includes('design') && !role.includes('designer') && !role.includes('arte')) return false;
      } else if (sectorFilter === 'prospeccao') {
        const role = (u.role || '').toLowerCase();
        if (dept !== 'prospeccao' && !role.includes('prospec') && !role.includes('sdr') && !role.includes('closer') && !role.includes('comercial')) return false;
      } else if (dept !== sectorFilter) {
        return false;
      }
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchRole = (u.role || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRole) return false;
    }
    return true;
  });

  // Active Chat Header Info
  const activeChannelObj = effectiveChannels.find((c) => c.id === activeChannelId);

  return (
    <div className="h-full w-full bg-[#070707] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* LEFT SIDEBAR: Channels & Team List with Live TimeClock Presence */}
      <div className="w-full md:w-80 lg:w-88 bg-[#0a0a0a] border-r border-neutral-800 flex flex-col h-full shrink-0">
        {/* Sidebar Header */}
        <div className="p-3.5 sm:p-4 border-b border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white leading-tight">Chat da Empresa</h2>
                <p className="text-[10px] text-neutral-400">Comunicação em Tempo Real</p>
              </div>
            </div>

            <button
              onClick={() => setIsCreateGroupModalOpen(true)}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 cursor-pointer"
              title="Criar Grupo entre Setores"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Search Contacts & Channels */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar colega ou canal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Sector Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'marketing', label: 'Marketing' },
              { id: 'design', label: 'Design' },
              { id: 'prospeccao', label: 'Prospecção' },
              { id: 'trafego', label: 'Tráfego' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSectorFilter(st.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                  sectorFilter === st.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Channels & Direct Messages List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Channels Section */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-black text-neutral-500 uppercase tracking-wider flex items-center justify-between">
              <span>Canais Oficiais & Grupos</span>
              <span className="text-[9px] font-normal">{effectiveChannels.length}</span>
            </div>

            {effectiveChannels.map((channel) => {
              const isActive = activeChannelId === channel.id;
              const unreadInChan = messages.filter(
                (m) => m.channelId === channel.id && (!m.readBy || !m.readBy[myEmail])
              ).length;

              return (
                <button
                  key={channel.id}
                  onClick={() => handleSelectChannel(channel)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-blue-600/20 border border-blue-500 text-white shadow-md'
                      : 'hover:bg-neutral-900/80 text-neutral-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{channel.icon || '💬'}</span>
                    <div className="min-w-0">
                      <strong className="text-xs font-bold block truncate text-white">
                        {channel.name}
                      </strong>
                      <span className="text-[10px] text-neutral-400 block truncate">
                        {channel.description || 'Canal de equipe'}
                      </span>
                    </div>
                  </div>

                  {unreadInChan > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black shrink-0">
                      {unreadInChan}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Direct Messages with Live Presence Status */}
          <div className="space-y-1 pt-2 border-t border-neutral-800/80">
            <div className="px-2 text-[10px] font-black text-neutral-500 uppercase tracking-wider flex items-center justify-between">
              <span>Equipe & Status de Ponto</span>
              <span className="text-[9px] font-normal">{filteredUsers.length} {filteredUsers.length === 1 ? 'membro' : 'membros'}</span>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-neutral-500 text-xs border border-dashed border-neutral-800/80 rounded-2xl my-2 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-neutral-300 text-xs">Nenhum colega cadastrado</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">
                    {sectorFilter !== 'all'
                      ? 'Nenhum membro ativo neste setor.'
                      : 'Apenas colaboradores cadastrados na equipe aparecem aqui.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const timeClock = getUserTimeClockStatus(user.email);
                const isDirectActive = activeRecipient?.email.toLowerCase() === user.email.toLowerCase();

                // Compute deterministic DM channel ID to check unread messages
                const targetEmail = (user.email || '').toLowerCase().trim();
                const pair = [myEmail, targetEmail].sort();
                const dmChanId = `dm_${pair[0].replace(/[^a-zA-Z0-9]/g, '_')}_${pair[1].replace(/[^a-zA-Z0-9]/g, '_')}`;
                const unreadInDM = messages.filter(
                  (m) => m.channelId === dmChanId && (!m.readBy || !m.readBy[myEmail])
                ).length;

                return (
                  <button
                    key={user.uid || user.email}
                    onClick={() => handleSelectDirectChat(user)}
                    className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between ${
                      isDirectActive
                        ? 'bg-blue-600/20 border border-blue-500 text-white shadow-md'
                        : 'hover:bg-neutral-900/80 text-neutral-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <User className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                        {/* Live presence indicator badge */}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${timeClock.dotColor}`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-xs font-bold text-white truncate block">
                            {user.name}
                          </strong>
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {user.role || 'Especialista'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {unreadInDM > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black shrink-0 animate-pulse">
                          {unreadInDM}
                        </span>
                      )}
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-md border shrink-0 ${timeClock.badgeColor}`}
                      >
                        {timeClock.label}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT MAIN: Active Chat Message Stream & Composer */}
      <div className="flex-1 flex flex-col h-full bg-[#070707]">
        {/* Chat Active Header */}
        <div className="p-3.5 px-5 border-b border-neutral-800 bg-[#0a0a0a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {activeRecipient ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center">
                    {activeRecipient.avatarUrl ? (
                      <img
                        src={activeRecipient.avatarUrl}
                        alt={activeRecipient.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${
                      getUserTimeClockStatus(activeRecipient.email).dotColor
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate flex items-center gap-2">
                    <span>{activeRecipient.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded border ${
                        getUserTimeClockStatus(activeRecipient.email).badgeColor
                      }`}
                    >
                      {getUserTimeClockStatus(activeRecipient.email).label}
                    </span>
                  </h3>
                  <p className="text-[10px] text-neutral-400 truncate">
                    {activeRecipient.role || 'Colaborador'} • {activeRecipient.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg">
                  {activeChannelObj?.icon || '💬'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate">
                    #{activeChannelObj?.name || 'Geral'}
                  </h3>
                  <p className="text-[10px] text-neutral-400 truncate">
                    {activeChannelObj?.description || 'Canal da agência Techify'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Compartilhar demanda, contrato ou pacote"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compartilhar do Sistema</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div className="max-w-md">
                <h4 className="text-sm font-black text-white">Início da Conversa</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Envie mensagens, fotos, vídeos, arquivos ou compartilhe demandas e pacotes do sistema Techify em tempo real.
                </p>
              </div>
            </div>
          ) : (
            currentMessages.map((msg) => {
              const isMine = (msg.senderEmail || '').toLowerCase().trim() === myEmail;
              const formattedTime = new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              // Read receipts logic
              const hasBeenRead =
                msg.readBy &&
                Object.keys(msg.readBy).some((reader) => reader.toLowerCase() !== myEmail);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 group ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-white mt-1">
                      {msg.senderAvatar ? (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        msg.senderName?.[0] || 'U'
                      )}
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-md md:max-w-lg space-y-1`}>
                    {!isMine && (
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[11px] font-bold text-white">{msg.senderName}</span>
                        {msg.senderRole && (
                          <span className="text-[9px] text-neutral-400">({msg.senderRole})</span>
                        )}
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl relative shadow-md ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-[#121212] border border-neutral-800 text-neutral-200 rounded-bl-none'
                      }`}
                    >
                      {/* Text Content */}
                      {msg.type === 'text' && (
                        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.text}
                        </p>
                      )}

                      {/* Image Message */}
                      {msg.type === 'image' && msg.fileUrl && (
                        <div className="space-y-2">
                          <img
                            src={msg.fileUrl}
                            alt="Anexo enviado"
                            onClick={() => setPreviewMediaUrl({ url: msg.fileUrl!, type: 'image' })}
                            className="max-h-60 rounded-xl object-cover cursor-pointer hover:opacity-95 transition-opacity border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          {msg.text && msg.text !== msg.fileName && (
                            <p className="text-xs">{msg.text}</p>
                          )}
                        </div>
                      )}

                      {/* Video Message */}
                      {msg.type === 'video' && msg.fileUrl && (
                        <div className="space-y-2">
                          <video
                            src={msg.fileUrl}
                            controls
                            className="max-h-60 rounded-xl bg-black border border-white/10"
                          />
                          {msg.text && msg.text !== msg.fileName && (
                            <p className="text-xs">{msg.text}</p>
                          )}
                        </div>
                      )}

                      {/* File / Doc Message */}
                      {msg.type === 'file' && (
                        <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-5 h-5 text-blue-300 shrink-0" />
                            <div className="min-w-0">
                              <strong className="text-xs block truncate text-white">
                                {msg.fileName || msg.text}
                              </strong>
                              <span className="text-[10px] text-neutral-300">
                                {msg.fileSize || 'Documento'}
                              </span>
                            </div>
                          </div>

                          {msg.fileUrl && (
                            <a
                              href={msg.fileUrl}
                              download={msg.fileName || 'arquivo'}
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                              title="Baixar Arquivo"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Agency Share Item (Demanda, Contrato, Pacote) */}
                      {msg.type === 'agency_share' && msg.agencyShareData && (
                        <div className="p-3 rounded-xl bg-black/40 border border-purple-500/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-black uppercase">
                              {msg.agencyShareData.type === 'prospection_demand'
                                ? '🎯 Demanda de Prospecção'
                                : msg.agencyShareData.type === 'contract'
                                ? '📄 Contrato Fechado'
                                : '📦 Pacote Comercial'}
                            </span>
                            {msg.agencyShareData.value && (
                              <span className="text-xs font-black text-emerald-400">
                                {msg.agencyShareData.value}
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-black text-white">
                            {msg.agencyShareData.title}
                          </h4>
                          {msg.agencyShareData.subtitle && (
                            <p className="text-[11px] text-neutral-300">
                              {msg.agencyShareData.subtitle}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Message Meta & Read Receipts */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-80">
                        <span>{formattedTime}</span>
                        {isMine && (
                          <span title={hasBeenRead ? 'Visto por membro' : 'Enviado'}>
                            {hasBeenRead ? (
                              <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-white/70" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete Message Button for Author */}
                    {isMine && (
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onDeleteMessage(msg.id)}
                          className="text-[10px] text-neutral-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Apagar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Composer */}
        <div className="p-3.5 px-4 bg-[#0a0a0a] border-t border-neutral-800 shrink-0">
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Media & Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
              title="Anexar Foto, Vídeo ou Documento"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Share System Item Button */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition-colors cursor-pointer"
              title="Compartilhar Coisas do Site (Demanda, Contrato, Pacote)"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              placeholder={`Escreva uma mensagem para #${activeChannelObj?.name || activeRecipient?.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-black transition-all shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
        </div>
      </div>

      {/* MODAL 1: Share System Items (Demanda, Contrato, Pacote) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl animate-fade-in custom-scrollbar">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Compartilhar no Chat</h3>
                  <p className="text-[11px] text-neutral-400">Selecione o item para enviar à equipe</p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Demandas de Prospecção */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                🎯 Demandas de Prospecção Recentes
              </span>
              {prospectionDemands.length === 0 ? (
                <p className="text-[11px] text-neutral-500">Nenhuma demanda cadastrada.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {prospectionDemands.slice(0, 4).map((d) => (
                    <button
                      key={d.id}
                      onClick={() =>
                        handleShareAgencyItem({
                          type: 'prospection_demand',
                          title: d.companyName,
                          subtitle: `${d.segment} • ${d.instagram || ''}`,
                          value: d.priority,
                        })
                      }
                      className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left transition-all cursor-pointer"
                    >
                      <strong className="text-xs font-bold text-white block truncate">{d.companyName}</strong>
                      <span className="text-[10px] text-neutral-400 block truncate">{d.segment}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Contratos Fechados */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                📄 Contratos Fechados
              </span>
              {prospectionContracts.length === 0 ? (
                <p className="text-[11px] text-neutral-500">Nenhum contrato fechado ainda.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {prospectionContracts.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      onClick={() =>
                        handleShareAgencyItem({
                          type: 'contract',
                          title: c.clientName,
                          subtitle: `Fechado por ${c.closingEmployeeName}`,
                          value: `R$ ${c.dealValue.toLocaleString('pt-BR')}`,
                        })
                      }
                      className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left transition-all cursor-pointer"
                    >
                      <strong className="text-xs font-bold text-white block truncate">{c.clientName}</strong>
                      <span className="text-[10px] text-emerald-400 font-bold block">
                        R$ {c.dealValue.toLocaleString('pt-BR')} • {c.recurringType}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pacotes Techify */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                📦 Pacotes do Catálogo Techify
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(techifyPackages.length > 0 ? techifyPackages : TECHIFY_PACKAGES).slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      handleShareAgencyItem({
                        type: 'package',
                        title: p.name,
                        subtitle: p.description,
                        value: `R$ ${p.suggestedPrice.toLocaleString('pt-BR')}`,
                      })
                    }
                    className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left transition-all cursor-pointer"
                  >
                    <strong className="text-xs font-bold text-white block truncate">{p.name}</strong>
                    <span className="text-[10px] text-purple-400 font-bold block">
                      R$ {p.suggestedPrice.toLocaleString('pt-BR')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Group Between Sectors */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white">Criar Grupo Intersetorial</h3>
              </div>
              <button
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Nome do Grupo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Squad Lançamento Imobiliário, Mkt + Closer"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Setor Principal</label>
                <select
                  value={newGroupDept}
                  onChange={(e) => setNewGroupDept(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="marketing">Marketing & Lançamentos</option>
                  <option value="design">Criação & Design</option>
                  <option value="prospeccao">Prospecção Comercial</option>
                  <option value="trafego">Tráfego Pago</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Selecionar Membros da Equipe</label>
                <div className="max-h-40 overflow-y-auto space-y-1 p-2 rounded-xl bg-neutral-900 border border-neutral-800 custom-scrollbar">
                  {teamList.filter((u) => u.email.toLowerCase().trim() !== myEmail).length === 0 ? (
                    <p className="text-xs text-neutral-500 p-2 text-center">Nenhum outro membro cadastrado na agência ainda.</p>
                  ) : (
                    teamList
                      .filter((u) => u.email.toLowerCase().trim() !== myEmail)
                      .map((u) => (
                        <label
                          key={u.email}
                          className="flex items-center gap-2 p-1.5 hover:bg-neutral-800 rounded-lg cursor-pointer text-xs text-neutral-300"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMemberEmails.includes(u.email)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMemberEmails((prev) => [...prev, u.email]);
                              } else {
                                setSelectedMemberEmails((prev) => prev.filter((em) => em !== u.email));
                              }
                            }}
                            className="rounded border-neutral-700 text-blue-600 focus:ring-0"
                          />
                          <span>{u.name} ({u.role || u.department || 'Equipe'})</span>
                        </label>
                      ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-blue-600/30"
                >
                  Criar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Image / Media Zoom Preview */}
      {previewMediaUrl && (
        <div
          onClick={() => setPreviewMediaUrl(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewMediaUrl(null)}
              className="absolute -top-10 right-0 p-1 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewMediaUrl.url}
              alt="Visualização"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-neutral-800"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
