# Escopo seguro de conta com vínculo legado

Apenas o Auth UID do usuário identifica o workspace que pode ser
gerenciado por ele. Se o perfil tem agencyOwnerUid diferente desse UID,
a conexão é classificada como pendente de revisão e NUNCA usada para
enumerar dados da empresa vinculada. A lista de funcionários continua
limitada a where('agencyOwnerUid', '==', auth.uid) e userType == employee.
A flag conflictingOwnerLink é derivada exclusivamente no servidor com
verifyIdToken. O frontend exibe um aviso de dados legados e não anuncia
que membros de outras empresas foram migrados. A custom claim platform_admin
ainda é a única credencial de administração global.

Importantíssimo: isso NÃO garante que funcionários históricos sejam
listados. Eles poderão estar ligados a outro UID ou sob cadastros
temporários. Não fazer transferências de vínculo com base somente no
nome ou e-mail. Reconciliar com confirmação do vínculo e auditoria.

O escopo da própria conta é independente do workspace onde ela também
trabalha. O endpoint não concede acesso ao workspace indicado pelo
agencyOwnerUid divergente.
