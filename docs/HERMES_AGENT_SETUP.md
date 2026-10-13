# Hermes Agent no AgencyOS — integração privada

**Código de origem:** https://github.com/NousResearch/hermes-agent (MIT).
**Documentação de API:** https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server

## O que esta implementação faz

O AgencyOS continua React/Vite + API Node Express na Vercel. O Hermes é um **servidor Python externo e isolado**, que oferece `POST /v1/chat/completions` compatível com a API OpenAI. Não instalar um gateway Hermes com terminal e ferramentas dentro da função Vercel usada por outras empresas.

O chat possui seletor **Gemini/Groq** ou **Hermes Agent**. O seletor Hermes permanece desabilitado até as variáveis serem configuradas. Uma conversa não troca de motor no meio: o histórico guarda `engine` e a API valida a continuidade. O histórico do AgencyOS permanece no Firebase do usuário, e só o contexto da agência autorizada é enviado para o motor escolhido. Não há fallback silencioso se Hermes falhar. Não há fake messages.

O Hermes, em sua API de chat stateless, pode receber `system` e `messages`, e devolver a resposta já processada pelo agente. Ele **não ganha permissão administrativa no AgencyOS**: criação de tarefas, envio Gmail e demais alterações continuam exigindo endpoints autenticados e confirmação humana. Um prompt não executa um pagamento ou campanha dentro do SaaS.

## Antes de usar

1. Em um **VPS, VM ou contêiner isolado destinado à própria agência**, instale o projeto oficial com instruções da NousResearch e configure o provedor de IA dele. Não compartilhe seu diretório `~/.hermes` ou tokens entre empresas.
2. No arquivo `~/.hermes/.env` da máquina dedicada configure `API_SERVER_ENABLED=true` e `API_SERVER_KEY=<segredo forte>`. Deixe o servidor em `127.0.0.1:8642` e publique HTTPS com reverse proxy autenticado ou túnel controlado, com proteção contra acesso público não autenticado.
3. Não coloque tokens Firebase Admin, Stripe, Meta ou de outras empresas dentro desse Hermes. Revise/desabilite ferramentas de shell, filesystem, navegador e outros conectores que não são necessários; restrinja o acesso à rede e ao disco. **O Hermes é um agente com capacidade real de executar ferramentas; instruções em linguagem natural NÃO criam isolamento de segurança.**
4. Na Vercel do projeto AgencyOS, configure apenas no backend e no ambiente Production:
   - `HERMES_AGENT_URL` = URL HTTPS pública protegida do gateway, sem `/v1/chat/completions` (ex.: `https://hermes.agencia.example`)
   - `HERMES_AGENT_API_KEY` = a mesma chave `API_SERVER_KEY` do Hermes
   - `HERMES_AGENCY_OWNER_UID` = UID exato do Firebase Authentication da conta proprietária **desta agência** (não um e-mail)
5. Faça um único redeploy e abra **IA e ferramentas → Consultora de IA**. Escolha **Hermes Agent** no seletor. A interface não define como online só por existirem variáveis — a primeira mensagem verifica conexão real.
6. Teste com o proprietário e com uma segunda conta/empresa não autorizada. Esta integração restrita a um owner não é multiempresa. Para SaaS público, **criar isolamento por tenant em infraestrutura/identidades/keys/permissões** antes de ampliar a todos.

## Segurança e operações

- HTTPS obrigatório e sem redirecionamentos. O frontend jamais recebe a chave do Hermes.
- A bridge é liberada somente se `role=owner`, `uid=ownerUid=HERMES_AGENCY_OWNER_UID`. Funcionários e outras agências nunca têm acesso à instância Hermes compartilhada.
- Proteção de cota segue o limite de perguntas `COPILOT_DAILY_QUESTION_LIMIT`.
- Logs não incluem prompt, chave, resposta ou dados da agência. Hermes pode ter seus próprios logs e armazenamento; estabelecer retenção e privacidade.
- Chat síncrono tem timeout de 45 segundos. Tarefas longas e gerenciamento de aprovações do Hermes vão exigir uma futura implementação de /v1/runs com fila/worker assíncrono, em vez de bloquear a função Vercel.
- A API permite ferramentas poderosas **no host do Hermes**. A bridge não liga essas ferramentas aos endpoints do AgencyOS. Para controle de abas, desenvolver catálogo explícito de ferramentas com RBAC, revisão e confirmação.
- Não confundir **Hermes Agent** (software executado e configurado pelo cliente) com o modelo Hermes. Ainda é necessário configurar e pagar o provedor de modelos no servidor Hermes.

## Rotas

`GET /api/copilot/engines` exige token Firebase e retorna somente disponibilidade para o usuário autenticado, sem segredos.
`POST /api/copilot/chat` aceita `engine:'standard'|'hermes'` além de `message,threadId,focus`.
Não há endpoint de configuração de segredo pelo navegador, nem modificações no workspace Firebase que possam habilitar acesso via perfil self-editable.

### Limitações
Não rodamos uma instância real do Hermes neste repositório. Até fornecer URL e chave de uma instalação segura, a seleção está **pendente**. Um teste com mock de HTTP apenas verifica contrato técnico do adapter, não garante compatibilidade de um servidor remoto específico.
