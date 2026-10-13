# Link de convite — correção do Firebase Auth (13/10/2026)

Os logs de runtime da Vercel registraram 4 falhas `Domain not allowlisted by project` em `/api` durante a geração do link de convite.

**Causa:** `generatePasswordResetLink(email, { url: AGENCYOS_PUBLIC_ORIGIN, handleCodeInApp: false })` exigia que o domínio continuasse autorizado em Firebase Authentication → Settings → Authorized domains. Mesmo com o Admin SDK configurado, o link falhava, e a API exibia uma mensagem genérica.

**Correção:** os dois fluxos (convite novo e ativação legada) agora chamam `generatePasswordResetLink(email)` sem `ActionCodeSettings`. O link abre na interface hospedada oficialmente pelo Firebase. Isso elimina a dependência do domínio de retorno nessa etapa, mas **não configura automaticamente autorização Google Sign-In ou redirects futuros**.

- A criação da conta continua protegida pela autenticação do responsável e por escopo da empresa.
- O link é apresentado uma única vez ao administrador que chamou a API, e não é enviado automaticamente por e-mail.
- A API não registra o token ou link completo em logs ou Firestore.
- A UI só apresenta sucesso após a API gerar o link e persistir o perfil.
- Se um cadastro já existir com o e-mail, a operação responde 409, sem assumir a identidade de outra pessoa.
- Nunca postar o link de ativação publicamente.
- Para branding e retorno automático ao AgencyOS futuramente, autorizar o domínio em Firebase Authentication e então usar ActionCodeSettings validados.

Testes: `bun test src/server/invitationLink.test.ts`; `bunx tsc --noEmit`. Os testes autenticados de ponta a ponta continuam pendentes de conta real e acesso ao Firebase Auth.

Firebase Admin SDK: https://firebase.google.com/docs/reference/admin/node/firebase-admin.auth.baseauth#generatepasswordresetlink
