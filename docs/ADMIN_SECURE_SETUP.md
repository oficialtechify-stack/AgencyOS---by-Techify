# Administração AgencyOS — migração segura

## Esta alteração
- Substitui o painel administrativo antigo por interface responsiva com seções Equipe, Clientes, Acessos, Planos e Auditoria.
- Removidos nomes, senhas, contas e taxas simuladas da área administrativa.
- Pessoas reais são listadas por empresa via API autenticada; colaboradores nunca consultam usuários globais.
- Administrador global só existe com a custom claim `platform_admin: true`, concedida pelo Firebase Admin SDK fora do navegador.
- Proprietários podem gerenciar apenas pessoas com `agencyOwnerUid` igual ao UID autenticado; clientes SaaS só pelo administrador global.
- Convites criam identidade Firebase Auth verdadeira e link de criação de senha de uso limitado; **nenhum e-mail é enviado automaticamente**.
- O link temporário só é devolvido à sessão do responsável, para ser compartilhado por canal seguro. Não registrar esse link em logs nem em Firestore.
- Bloqueio e reativação acionam Firebase Authentication (disabled) além do perfil Firestore.
- Planos/MRR não são simulados. A integração de cobrança e reconciliação dos webhooks é requisito para resultados financeiros.
- Contas com mesmo e-mail são sinalizadas, sem remoção automática. O servidor impede novos perfis duplicados por e-mail idêntico.

## Variáveis obrigatórias
FIREBASE_SERVICE_ACCOUNT_JSON=JSON completo da conta de serviço do projeto agencyos-1c3fc
AGENCYOS_PUBLIC_ORIGIN=https://agency-os-by-techify.vercel.app

## Acesso do administrador global
Um administrador autorizado precisa definir a custom claim `platform_admin` no Firebase Auth
por processo privilegiado usando Admin SDK após autenticação forte. Não conceder
por nome, e-mail hardcoded, payload no navegador ou campo do documento.
Depois de atribuir claim, o usuário deve atualizar o ID token (sair e entrar novamente).

## Revisões de produção pendentes
1. Autenticação/Firestore Rules multiempresa ainda precisam de testes com dois tenants.
2. Firebase Authentication bloqueia usuários disabled, mas sessões já emitidas devem ser revogadas
   e verificadas com verifyIdToken(..., true) em APIs privilegiadas.
3. Listagem limita a 150 registros; implementar paginação com cursor antes de escalar.
4. A consulta global do painel legado foi removida desta aba. Outros módulos ainda usam
   listeners globais e devem ser migrados separadamente.
5. Assinaturas, MRR, plano ativo e faturamento precisam ser ligados a pagamentos reais
   verificados no backend, nunca por mudança no frontend.
6. Inspecionar convite, cadastro, recuperação de senha, segurança das regras do Firestore,
   bloqueios e permissões entre contas com Firebase Emulator e testes ponta a ponta.
7. Campos antigos como tempPasswordHint podem existir em documentos já gravados;
   auditar e remover com backup, sem exibir ou reutilizar senhas antigas.
8. Testar `npm run lint`/`tsc --noEmit`, além do build, e acessibilidade responsiva.

Esta branch permanece como preview. Não mesclar na produção antes desses testes.
