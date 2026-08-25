import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Instagram,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  User,
  Package,
  Layers,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Check,
  AlertCircle,
  Video,
  Link as LinkIcon,
} from 'lucide-react';
import {
  ProspectionClosedContract,
  ProspectionContractStatus,
  ProspectionDemand,
  UserProfile,
} from '../../types';
import { TECHIFY_PACKAGES, TECHIFY_INDIVIDUAL_SERVICES } from '../../data/techifyPackages';

interface CreateProspectionContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contract: Omit<ProspectionClosedContract, 'id' | 'createdAt'>) => void;
  currentUser?: UserProfile | null;
  editingContract?: ProspectionClosedContract | null;
  sourceDemand?: ProspectionDemand | null;
}

export const CreateProspectionContractModal: React.FC<CreateProspectionContractModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  editingContract,
  sourceDemand,
}) => {
  const [clientName, setClientName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [segment, setSegment] = useState('Estética & Beleza');
  const [city, setCity] = useState('Recife / PE');
  const [contractType, setContractType] = useState<'Pacote Completo' | 'Serviço Individual'>('Pacote Completo');
  const [packageName, setPackageName] = useState('Techify Scale 360 (Solução Completa)');
  const [individualService, setIndividualService] = useState('Gestão de Tráfego Pago (Meta / Google)');
  const [customPackageDetails, setCustomPackageDetails] = useState('');
  const [dealValue, setDealValue] = useState<number>(3500);
  const [recurringType, setRecurringType] = useState<
    'Mensal Recorrente (MRR)' | 'Pontual / Projeto Único' | 'Trimestral' | 'Semestral' | 'Anual'
  >('Mensal Recorrente (MRR)');
  const [paymentMethod, setPaymentMethod] = useState('Pix Recorrente / Boleto');
  const [signedDate, setSignedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [closingEmployeeName, setClosingEmployeeName] = useState('');
  const [closingEmployeeEmail, setClosingEmployeeEmail] = useState('');
  const [closingEmployeeRole, setClosingEmployeeRole] = useState('Closer / Prospecção');
  const [status, setStatus] = useState<ProspectionContractStatus>('contrato_fechado');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [contractImageUrl, setContractImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingContract) {
      setClientName(editingContract.clientName || '');
      setInstagram(editingContract.instagram || '');
      setContactPerson(editingContract.contactPerson || '');
      setPhone(editingContract.phone || '');
      setEmail(editingContract.email || '');
      setSegment(editingContract.segment || 'Geral');
      setCity(editingContract.city || '');
      setContractType(editingContract.contractType || 'Pacote Completo');
      setPackageName(editingContract.packageName || 'Techify Scale 360 (Solução Completa)');
      setIndividualService(editingContract.individualService || 'Gestão de Tráfego Pago (Meta / Google)');
      setCustomPackageDetails(editingContract.customPackageDetails || '');
      setDealValue(editingContract.dealValue || 0);
      setRecurringType(editingContract.recurringType || 'Mensal Recorrente (MRR)');
      setPaymentMethod(editingContract.paymentMethod || 'Pix');
      setSignedDate(editingContract.signedDate || '');
      setStartDate(editingContract.startDate || '');
      setClosingEmployeeName(editingContract.closingEmployeeName || '');
      setClosingEmployeeEmail(editingContract.closingEmployeeEmail || '');
      setClosingEmployeeRole(editingContract.closingEmployeeRole || 'Closer / Prospecção');
      setStatus(editingContract.status || 'contrato_fechado');
      setMeetingDate(editingContract.meetingDate || '');
      setMeetingTime(editingContract.meetingTime || '');
      setMeetingLink(editingContract.meetingLink || '');
      setMeetingNotes(editingContract.meetingNotes || '');
      setContractImageUrl(editingContract.contractImageUrl || '');
      setNotes(editingContract.notes || '');
    } else if (sourceDemand) {
      setClientName(sourceDemand.companyName || '');
      setInstagram(sourceDemand.instagram || '');
      setContactPerson('');
      setPhone(sourceDemand.phone || '');
      setEmail('');
      setSegment(sourceDemand.segment || 'Geral');
      setCity(sourceDemand.city || '');
      setContractType('Pacote Completo');
      setPackageName(sourceDemand.targetPackages?.[0] || 'Techify Scale 360 (Solução Completa)');
      setDealValue(3500);
      setRecurringType('Mensal Recorrente (MRR)');
      setPaymentMethod('Pix Recorrente / Boleto');
      const today = new Date().toISOString().split('T')[0];
      setSignedDate(today);
      setStartDate(today);
      setClosingEmployeeName(sourceDemand.assignedTo || currentUser?.name || 'Membro da Prospecção');
      setClosingEmployeeEmail(sourceDemand.assignedEmail || currentUser?.email || '');
      setClosingEmployeeRole(sourceDemand.assignedRole || currentUser?.role || 'Closer / Prospecção');
      setStatus('contrato_fechado');
      setMeetingDate('');
      setMeetingTime('');
      setMeetingLink('https://meet.google.com/techify-onboarding');
      setMeetingNotes('');
      setContractImageUrl('');
      setNotes(sourceDemand.approachBriefing || '');
    } else {
      setClientName('');
      setInstagram('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setSegment('Estética & Harmonização');
      setCity('Recife / PE');
      setContractType('Pacote Completo');
      setPackageName('Techify Scale 360 (Solução Completa)');
      setIndividualService('Gestão de Tráfego Pago (Meta / Google)');
      setCustomPackageDetails('');
      setDealValue(3500);
      setRecurringType('Mensal Recorrente (MRR)');
      setPaymentMethod('Pix Recorrente / Boleto');
      const today = new Date().toISOString().split('T')[0];
      setSignedDate(today);
      setStartDate(today);
      setClosingEmployeeName(currentUser?.name || 'Colaborador Prospecção');
      setClosingEmployeeEmail(currentUser?.email || '');
      setClosingEmployeeRole(currentUser?.role || 'SDR / Closer');
      setStatus('contrato_fechado');
      setMeetingDate('');
      setMeetingTime('');
      setMeetingLink('');
      setMeetingNotes('');
      setContractImageUrl('');
      setNotes('');
    }
    setError(null);
  }, [editingContract, sourceDemand, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSelectPackage = (pkg: (typeof TECHIFY_PACKAGES)[0]) => {
    setPackageName(pkg.name);
    setDealValue(pkg.suggestedPrice);
    setRecurringType(pkg.priceType);
  };

  const handleSelectService = (serv: (typeof TECHIFY_INDIVIDUAL_SERVICES)[0]) => {
    setIndividualService(serv.name);
    setDealValue(serv.suggestedPrice);
    setRecurringType(serv.priceType);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 4MB
    if (file.size > 4 * 1024 * 1024) {
      setError('A imagem do comprovante não pode exceder 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setContractImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setError('Informe o nome do cliente / empresa.');
      return;
    }
    if (!instagram.trim()) {
      setError('Informe o Instagram oficial do cliente.');
      return;
    }
    if (!closingEmployeeName.trim()) {
      setError('Informe o funcionário da prospecção responsável pelo fechamento.');
      return;
    }
    if (dealValue <= 0) {
      setError('O valor do contrato deve ser maior que zero.');
      return;
    }

    const cleanInsta = instagram.trim().startsWith('@')
      ? instagram.trim()
      : instagram.trim().includes('instagram.com')
      ? instagram.trim()
      : `@${instagram.trim()}`;

    onSubmit({
      clientName: clientName.trim(),
      instagram: cleanInsta,
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      segment: segment.trim(),
      city: city.trim(),
      contractType,
      packageName: contractType === 'Pacote Completo' ? packageName : undefined,
      individualService: contractType === 'Serviço Individual' ? individualService : undefined,
      customPackageDetails: customPackageDetails.trim() || undefined,
      dealValue: Number(dealValue),
      recurringType,
      paymentMethod: paymentMethod || undefined,
      signedDate: signedDate || new Date().toISOString().split('T')[0],
      startDate: startDate || signedDate,
      closingEmployeeName: closingEmployeeName.trim(),
      closingEmployeeEmail: closingEmployeeEmail.trim() || currentUser?.email || 'equipe@techify.com',
      closingEmployeeRole: closingEmployeeRole.trim(),
      status,
      meetingDate: meetingDate || undefined,
      meetingTime: meetingTime || undefined,
      meetingLink: meetingLink.trim() || undefined,
      meetingNotes: meetingNotes.trim() || undefined,
      contractImageUrl: contractImageUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      demandId: sourceDemand?.id || editingContract?.demandId,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0e0e0e] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                {editingContract ? 'Editar Registro de Contrato' : 'Registrar Novo Contrato / Fechamento Comercial'}
              </h2>
              <p className="text-xs text-neutral-400">
                Cadastre o cliente fechado, pacote contratado, funcionário da prospecção que converteu, valores e comprovante.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Status da Esteira / Negociação */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <label className="block text-xs font-bold text-white">
              Status Atual da Negociação / Contrato <span className="text-emerald-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { val: 'contatado', label: '📞 Contatado' },
                { val: 'em_analise', label: '🔍 Em Análise' },
                { val: 'fazer_reuniao', label: '📅 Fazer Reunião' },
                { val: 'proposta_enviada', label: '📑 Proposta Enviada' },
                { val: 'contrato_fechado', label: '💎 Contrato Fechado' },
                { val: 'onboarding_iniciado', label: '🚀 Onboarding Iniciado' },
              ].map((st) => (
                <button
                  key={st.val}
                  type="button"
                  onClick={() => setStatus(st.val as ProspectionContractStatus)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left flex items-center justify-between ${
                    status === st.val
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  <span>{st.label}</span>
                  {status === st.val && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Dados do Cliente & Instagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Nome do Cliente / Empresa <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Dra. Camila Dermatologia"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Instagram do Cliente <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Instagram className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Ex: @dracamiladerma"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-pink-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Contato / Decisor (Opcional)
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Ex: Dra. Camila Vasconcelos"
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                WhatsApp / Telefone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-green-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: (81) 99765-4321"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-green-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Segmento / Nicho
              </label>
              <input
                type="text"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                placeholder="Ex: Dermatologia & Estética"
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-colors"
              />
            </div>
          </div>

          {/* Quem Converteu (Funcionário da Prospecção) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-400" /> Funcionário da Prospecção que Fechou / Converteu <span className="text-blue-400">*</span>
              </label>
              <span className="text-[10px] text-blue-300 font-semibold">
                Contabilizado no Ranking do Gestor
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 font-semibold mb-1">Nome do Funcionário</label>
                <input
                  type="text"
                  value={closingEmployeeName}
                  onChange={(e) => setClosingEmployeeName(e.target.value)}
                  placeholder="Ex: Larissa Closer"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 font-semibold mb-1">E-mail do Funcionário</label>
                <input
                  type="email"
                  value={closingEmployeeEmail}
                  onChange={(e) => setClosingEmployeeEmail(e.target.value)}
                  placeholder="Ex: larissa.sales@techify.com"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 font-semibold mb-1">Cargo / Função</label>
                <input
                  type="text"
                  value={closingEmployeeRole}
                  onChange={(e) => setClosingEmployeeRole(e.target.value)}
                  placeholder="Ex: Closer / Vendas"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tipo de Contratação: Pacote Techify vs Serviço Individual */}
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-400" /> Solução Contratada pelo Cliente <span className="text-emerald-400">*</span>
              </label>

              {/* Switch Buttons */}
              <div className="flex bg-neutral-900 p-0.5 rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setContractType('Pacote Completo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    contractType === 'Pacote Completo'
                      ? 'bg-emerald-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Pacote Completo Techify
                </button>
                <button
                  type="button"
                  onClick={() => setContractType('Serviço Individual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    contractType === 'Serviço Individual'
                      ? 'bg-emerald-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Serviço Individual
                </button>
              </div>
            </div>

            {contractType === 'Pacote Completo' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TECHIFY_PACKAGES.map((pkg) => {
                  const isSelected = packageName === pkg.name;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-xs text-white">{pkg.name}</strong>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-emerald-400">
                          R$ {pkg.suggestedPrice.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">{pkg.description}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TECHIFY_INDIVIDUAL_SERVICES.map((serv) => {
                  const isSelected = individualService === serv.name;
                  return (
                    <div
                      key={serv.id}
                      onClick={() => handleSelectService(serv)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-xs text-white">{serv.name}</strong>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-emerald-400">
                          R$ {serv.suggestedPrice.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">{serv.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Valores & Forma de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-800">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Valor Fechado (R$) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value))}
                  placeholder="3500"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white font-black outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Tipo de Faturamento / Recorrência
              </label>
              <select
                value={recurringType}
                onChange={(e) => setRecurringType(e.target.value as any)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-medium"
              >
                <option value="Mensal Recorrente (MRR)">Mensal Recorrente (MRR)</option>
                <option value="Pontual / Projeto Único">Pontual / Projeto Único</option>
                <option value="Trimestral">Trimestral (Pacote 3 Meses)</option>
                <option value="Semestral">Semestral (Pacote 6 Meses)</option>
                <option value="Anual">Anual (Contrato 12 Meses)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Forma de Pagamento
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Ex: Pix Recorrente, Boleto, Cartão"
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Datas de Fechamento e Início */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Data do Fechamento
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={signedDate}
                  onChange={(e) => setSignedDate(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Data de Início do Onboarding / Entregas
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Seção de Reunião Marcada */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-white flex items-center gap-1.5">
                <Video className="w-4 h-4 text-cyan-400" /> Agendamento de Reunião / Kickoff com o Cliente
              </label>
              <span className="text-[10px] text-cyan-300">Google Meet / Zoom</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 font-semibold mb-1">Data da Reunião</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 font-semibold mb-1">Horário da Reunião</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 font-semibold mb-1">Link da Sala de Reunião</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Pauta da reunião (Ex: Kickoff de tráfego, alinhamento de público e acesso ao Meta Ads)"
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Anexo de Imagem / Comprovante / Print do Contrato */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="block text-xs font-bold text-white flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-purple-400" /> Imagem / Print do Contrato ou Comprovante
            </label>
            <p className="text-[11px] text-neutral-400">
              Anexe uma foto do comprovante de pagamento, print do fechamento no WhatsApp, contrato assinado ou foto do estabelecimento.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* File Upload Button */}
              <label className="p-4 rounded-xl border border-dashed border-neutral-700 hover:border-purple-500 bg-neutral-900/60 hover:bg-neutral-900 text-center cursor-pointer transition-colors block">
                <Upload className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-white block">Selecionar Imagem do Computador</span>
                <span className="text-[10px] text-neutral-500">PNG, JPG, WebP até 4MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </label>

              {/* URL Input */}
              <div>
                <label className="block text-[11px] text-neutral-400 font-semibold mb-1">
                  Ou Cole a URL Direta da Imagem:
                </label>
                <input
                  type="text"
                  value={contractImageUrl}
                  onChange={(e) => setContractImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... ou link do drive"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Preview of Image */}
            {contractImageUrl && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3 mt-2">
                <img
                  src={contractImageUrl}
                  alt="Comprovante"
                  className="w-16 h-16 object-cover rounded-lg border border-neutral-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-white block truncate">Comprovante / Imagem Anexada</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Visualização carregada com sucesso</span>
                </div>
                <button
                  type="button"
                  onClick={() => setContractImageUrl('')}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 text-xs font-bold cursor-pointer"
                >
                  Remover
                </button>
              </div>
            )}
          </div>

          {/* Anotações Gerais & Próximos Passos */}
          <div className="space-y-1 pt-2 border-t border-neutral-800">
            <label className="block text-xs font-bold text-white">
              Observações Gerais & Próximos Passos
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Cliente já realizou o pagamento da entrada via Pix. O time de design já pode iniciar o pacote de artes e o gestor de tráfego deve solicitar acesso ao Gerenciador de Anúncios..."
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white outline-none transition-colors leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-neutral-900/80 -mx-6 -mb-6 mt-6 border-t border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>{editingContract ? 'Salvar Alterações do Contrato' : 'Registrar Conversão / Contrato'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
