# Administração — correção de permissões e cadastros legados
- Lista de 18 módulos operacionais única compartilhada entre backend e frontend em src/shared/agencyModules.ts.
- Nunca permitir 'admin', 'leadspay-master', ou 'leadspay-companies' em privilégios editáveis de funcionários.
- Nome/cargo podem ser editados sem sobrescrever permissões legadas; edição explícita de módulos substitui a seleção por IDs operacionais válidos.
- A API de PATCH retorna erro de ativação quando o usuário existe só no Firestore, em vez de tentar alterar uma identidade ausente no Firebase Auth.
- Ativação de legado: POST /api/admin/members/:uid/activate exige conta autenticada do proprietário, escopo agencyOwnerUid, confirmação, UID livre no Firebase Auth e e-mail não cadastrado. Mantém o mesmo documento Firestore e gera link oficial de definição de senha; não envia e-mail automaticamente.
- Contas existentes não são excluídas nem recadastradas; conflitos de e-mail exigem revisão manual, sem adotar a identidade de terceiros.
- Salvar usuário e evento de auditoria no mesmo lote Firestore. Bloqueio em Auth revoga refresh tokens.
- Não afirmar que os dois funcionários antigos estão ativos enquanto o Auth não existir e o convite não for aceito.
