# AgencyOS — auditoria e implantação segura (12/10/2026)

## Diagnóstico confirmado no código

1. O login antigo aceitava sessão persistida em localStorage e criava sessão Master mesmo sem usuário autenticado.
2. Havia autenticação "Google direta" baseada apenas no texto de um e-mail, sem token Google/Firebase.
3. O login por e-mail caía em consultas ao Firestore e validava `tempPasswordHint` como senha em texto puro.
4. Se falhasse a criação no Firebase Auth, o cadastro podia gravar diretamente o usuário no Firestore.
5. `firestore.rules` possuía `allow read, write: if true` e uma regra global equivalente. **Não é prova de que essas regras estejam ativas na nuvem:** conferir Console.
6. `src/App.tsx` abre listeners globais antes da verificação Firebase Auth. Há leituras de `users`, `agencyChatMessages` e `agencyChatChannels`, além de dezenas de coleções de workspace.
7. O código de produção utiliza o Firebase `liquid-dub-x8gvj` de `firebase-applet-config.json`. Confirmar se é o projeto Firebase correto.
8. A Vercel mostrou as variáveis `GEMINI_API_KEY` e `GROQ_API_KEY` para produção; o Firebase web config vem do JSON versionado no GitHub.
9. Equipe inicial e dados de demonstração continuam presentes no código. São necessários inventário de dados, plano de migração e remoção antes de abrir novos cadastros.

## Alterações nesta branch

- Removida a aceitação de sessões de localStorage como identidade.
- Login e cadastro por e-mail exigem Firebase Authentication real.
- Removidos os fluxos públicos de impersonação Google/Master no formulário.
- Desabilitadas as antigas rotas de "login direto" por texto de e-mail.
- Verificações de Master na interface exigem o usuário corrente com e-mail exato e verificado.
- Listeners globais do aplicativo deixam de começar antes de haver usuário Auth.
- `firestore.rules` foi substituído por **política restritiva de preparação**.

## Importante: não publicar diretamente sem migração

As regras novas foram escritas para **negar acessos indevidos por padrão**, e por isso podem bloquear funcionalidades legadas que dependem da leitura de todos os usuários e do chat global. Esta branch não deve ser mesclada nem suas regras aplicadas ao Firebase de produção até executar os passos abaixo e validar tudo em emulador ou staging.

### Ordem da implantação

1. Identificar o projeto Firebase de produção certo e fazer backup/exportação do Firestore, usuários e regras ativas. Verificar se os dados existentes pertencem ao `liquid-dub-x8gvj`.
2. No Firebase Authentication, habilitar Google e E-mail/Senha; adicionar `agency-os-by-techify.vercel.app` em **Authentication > Settings > Authorized domains**.
3. Auditar contas preexistentes que foram criadas exclusivamente como documentos no Firestore (sem Firebase Auth). Criar fluxo de convite, cadastro, recuperação de senha e migração **sem assumir posse por e-mail digitado**.
4. Implementar função administrativa confiável para conceder/revogar **custom claim** `platform_admin` por UID, nunca por um campo editável no Firestore nem por e-mail enviado pelo navegador.
5. Migrar dados globais de chat e designer para caminhos por empresa (p.ex. `users/{workspaceUid}/...`), adicionar `organizationId`/membros atribuídos pelo backend, e trocar `subscribeAllUsers` por consulta paginada e escopada.
6. Implementar permissões por papel/ação no Firestore para membros de equipe, aprovações, exclusões, pagamentos, assinaturas e dados financeiros; não confiar apenas em botões ocultos.
7. Escrever testes automatizados de regras com o Firebase Emulator Suite: anônimo, conta A, conta B, convidado, funcionário, admin, usuário bloqueado e tentativa de elevação de privilégio.
8. Revisar os endpoints `api/index.ts`, `server.ts`, scraper, integrações de pagamento e webhooks antes de ativar tráfego real de clientes.
9. Verificar que `vite build` e `tsc --noEmit` passam; validar manualmente no preview autenticado; somente então publicar em produção.
10. Após publicar regras, monitorar `permission-denied`, taxas de erro e leitura de Firestore; reverter com versão de regras já validada se necessário, nunca reabrir globalmente.

## Diagnóstico do aviso "Failed to get document because the client is offline"

A captura de tela prova que uma operação Firestore falhou offline, mas não identifica sua causa. Verificar domínio Firebase e projeto correto; conectividade real do navegador; Firestore habilitado e banco certo; erro de rede no DevTools; bloqueio de rede/firewall; e possíveis problemas de autenticação. `auth/unauthorized-domain` é um problema **distinto**. O aplicativo não deve substituí-lo por acesso Master falso.

## Estado

- Branch de correção criada, sem alteração deliberada da produção.
- Regras Firebase da nuvem **não** foram modificadas por esta branch.
- Deploy em produção não foi executado.
- Build, testes automatizados e login ponta a ponta ainda precisam de validação em ambiente de execução.


## Etapa 2 — remoção de dados de demonstração (13/10/2026)

- Dashboard Geral: KPIs vindos de `kpiPeriods`, transações de `transactions`, campanhas e tarefas das respectivas coleções Firebase; gráficos construídos a partir da data de cada transação.
- Estados vazios substituem números, tendências e listas inventados. Churn/MRR/clientes ativos ficam indefinidos sem KPI informado; não confundir ausência de dados com zero.
- Corrigidas nomenclaturas dos status para os tipos aceitos pelos módulos: transações `Entrada/Saída`, tarefas `Em Andamento/Concluído`, campanhas `Ativa`.
- Notificações falsas e o indicador não verificado `Sistema online` foram retirados da interface.
- Removidos exemplos de leads, empresas, contratos, funcionários, posts e links de pagamento do estado inicial e do arquivo `mockInitialData.ts`.
- O armazenamento global do navegador só retém a preferência de navegação. Dados comerciais não são mais restaurados entre sessões.
- LeadsPay Master: sem clientes/receitas/webhooks simulados. Cadastro manual fica pendente até validação, sem gerar credencial de API fictícia.
- Erros da API de IA não retornam conteúdo fingindo análise bem-sucedida.
- App não fornece mais regra permissiva `allow read, write: if true` para copiar quando o Firestore recusa acesso.

### Bloqueadores antes da produção

1. **Firestore Rules ativas:** ainda não verificadas nem aplicadas no projeto `agencyos-1c3fc`. Não publicar as regras antigas abertas. As regras novas da branch também precisam de ajustes e testes para os fluxos reais.
2. **Tenant isolation:** migrar chat e módulos globais para caminhos por organização, auditar permissões de leitura/escrita de cada collection e endpoint.
3. **Cadastro e permissões:** fluxo de convite administrativo deve ser implementado em backend confiável (Admin SDK), evitando que o navegador conceda papéis, planos ou claims.
4. **Cobranças reais:** vincular Stripe/LeadsPay e webhooks verificados; validar receita apenas de pagamentos confirmados. Não gerar API keys ou pagamentos no frontend.
5. **Migração de registros:** os arquivos do projeto foram saneados, mas registros fake que já tenham sido gravados no Firestore precisam ser identificados manualmente com backup antes de remover. Não foi feita exclusão em massa de dados reais.
6. **Garantia de qualidade:** `vite build` na Vercel não equivale a teste de tipos, regras, autenticação, permissão, E2E, desempenho ou escalabilidade.
7. **Firebase Auth:** adicionar o domínio oficial e conferir provedores Google e E-mail/Senha no projeto novo.

**Produção ainda não liberada.** Correções continuam na branch e PR de rascunho.
