# Consultora AgencyOS — configuração e segurança

## Recursos implementados
- Chat privado por conta, histórico persistido no backend, cópia e leitura em voz alta no navegador.
- Consultas ao Firestore da agência por área: vendas, financeiro, operações, marketing e equipe; os resultados são amostras limitadas (até 12 documentos consultados e 8 apresentados por coleção, com cache de 60 segundos por usuário e área), não totais financeiros confirmados.
- Respostas contextualizadas com Gemini (GEMINI_API_KEY) e alternativa Groq (GROQ_API_KEY), mantendo as chaves somente no servidor.
- Biblioteca operacional de marketing, vendas, retenção, finanças, processos e acompanhamento de metas.
- Abre a aba correspondente ao contexto atual, sem alterar informações.
- Criação de tarefas no Kanban depois de confirmação do usuário, com auditoria.
- E-mails: geração de rascunhos pela IA; conexão Gmail OAuth por usuário e envio somente após confirmação. Sem configuração OAuth, o envio fica indisponível.
- O botão flutuante abre o mesmo chat autenticado (o widget antigo fazia chamadas separadas).

## Configurar Gmail na Vercel (Production)
Adicione as variáveis a seguir exclusivamente no backend:
COPILOT_GOOGLE_CLIENT_ID — ID OAuth Google Cloud de aplicativo Web.
COPILOT_GOOGLE_CLIENT_SECRET — segredo OAuth correspondente.
COPILOT_TOKEN_ENCRYPTION_KEY — 64 caracteres hexadecimais aleatórios.
COPILOT_GOOGLE_REDIRECT_URI — https://agency-os-by-techify.vercel.app/api/copilot/google/callback
AGENCYOS_PUBLIC_ORIGIN — https://agency-os-by-techify.vercel.app

No Google Cloud, habilite Gmail API, crie o consentimento OAuth, configure o callback autorizado e requisite gmail.send e userinfo.email. Para clientes de outras empresas, verificar os requisitos de publicação e aprovação OAuth da Google. Cada usuário deve conectar sua própria conta Gmail. Jamais colocar client secret ou token no frontend.

## Garantias
- A IA utiliza o UID do Firebase Auth, e não um ID fornecido pelo navegador, para definir a empresa.
- Funcionários só têm contexto cruzado via vínculo assinado pelo backend em copilotMemberships. Novos convites e ativações oficiais criam esse vínculo. Equipe antiga sem vínculo precisa de regularização segura.
- A recuperação de proprietários antigos exige vínculo assinado verificado no servidor.
- E-mails exigem clique de confirmação e usam requestId para impedir repetição automática.
- Firestore Rules devem bloquear acesso direto via cliente às coleções raiz copilotThreads, copilotOAuthStates, copilotPrivate, copilotMailRequests, copilotActionAudit e copilotMemberships. A auditoria do deployment real dessas regras é obrigatória antes de abrir para outros clientes.
- Informações contextuais são compartilhadas com o provedor de IA (Gemini ou Groq); comunicar isso na política de privacidade.
- Não é oferecido controle irrestrito de todas as abas, pagamentos, campanhas ou exclusões. Novas operações exigem endpoints específicos, permissões e aprovação humana.

## Verificação necessária
1. Teste real com a agência proprietária e uma segunda agência isolada.
2. Teste funcionário com módulo limitado, incluindo tentativa de acessar outra empresa.
3. Verificar conexão OAuth Gmail, consentimento, armazenamento de refresh token, envio e desconexão.
4. Limite e auditoria de consumo de tokens, quota do Firestore e custo dos provedores.
5. Não tratar valores do Firestore como extratos ou pagamentos verificados.

Limite de consumo: COPILOT_DAILY_QUESTION_LIMIT (opcional, padrão 80 perguntas/dia por usuário) aplicado por transação no Firestore.
