# AgencyOS · Social Media Hub · configuração oficial Meta

## O que já foi implementado no código

- Instagram Login para contas profissionais: OAuth no servidor, state HMAC com nonce de uso único, criptografia AES-256-GCM do token, conexão e desconexão por agência.
- WhatsApp Business: Embedded Signup oficial via SDK Meta, validação de WABA e número, inscrição em webhook e armazenamento cifrado de credenciais.
- Caixa de entrada WhatsApp: recebimento por webhook com validação de assinatura HMAC, respostas somente dentro da janela de 24 horas, dados separados por agência.
- Respostas automáticas opcionais por WhatsApp: desativadas por padrão, no máximo uma por contato a cada 24 horas, somente após mensagem recebida.
- Estúdio: legendas pelo endpoint de IA já existente, edição e salvamento de rascunhos no Firebase; publicação de imagem por URL pública HTTPS mediante confirmação da Meta.
- Planejador: prepara trabalhos agendados e endpoint autenticado para agendador externo. Não há cron instalado automaticamente. Checar plano/frequência antes de usar.
- Insights: somente contagem de dados registrados; indicadores de alcance ficam indisponíveis até implementar leitura oficial da Meta.

## Variáveis de ambiente exigidas

Defina na Vercel, ambiente correto; nunca coloque app secrets, service account nem chave de criptografia em variáveis VITE_ ou frontend:

FIREBASE_SERVICE_ACCOUNT_JSON — JSON completo da conta de serviço Admin SDK do projeto agencyos-1c3fc.
SOCIAL_TOKEN_ENCRYPTION_KEY — 64 caracteres hexadecimais aleatórios, guarde backup seguro; trocar sem migrar tokens quebra as conexões.
META_IG_APP_ID — App ID configurado para Instagram Login.
META_IG_APP_SECRET — App Secret do Instagram Login.
META_IG_REDIRECT_URI — https://agency-os-by-techify.vercel.app/api/social/instagram/callback
META_WA_APP_ID — Facebook App ID com WhatsApp Business Platform.
META_WA_APP_SECRET — segredo usado também para assinar webhooks da Meta.
META_WA_CONFIG_ID — ID da configuração Facebook Login for Business / Embedded Signup.
META_WA_VERIFY_TOKEN — string secreta escolhida por você para validação do webhook.
META_GRAPH_VERSION — versão Graph API suportada, atualmente fallback v24.0.
AGENCYOS_PUBLIC_ORIGIN — https://agency-os-by-techify.vercel.app
CRON_SECRET — opcional; autentica o job do agendador.
SOCIAL_CRON_ENABLED=true — somente após configurar o cron externo e validar sua execução.

Webhook WhatsApp: https://agency-os-by-techify.vercel.app/api/social/webhook/meta
Callback Instagram: https://agency-os-by-techify.vercel.app/api/social/instagram/callback
Agendamento: GET https://agency-os-by-techify.vercel.app/api/social/jobs/publish com header Authorization Bearer CRON_SECRET. Só configurar frequência depois de validar limites e permissões do plano.

## Exigências da Meta

- Conta Instagram do tipo profissional (Business ou Creator), permissões instagram_business_basic, instagram_business_content_publish; recurso de mensagens exige instagram_business_manage_messages e webhooks Instagram separados.
- WhatsApp Cloud API exige negócio/portfólio e WABA/telefone, cadastro Embedded Signup e inscrição dos webhooks. Para contas de clientes terceiros, App Review/Advanced Access conforme exigido.
- Conectar WhatsApp Business não é autenticar automaticamente qualquer WhatsApp pessoal por QR Code.
- WhatsApp permite respostas livres dentro da janela de atendimento; disparos de marketing para contatos fora da janela exigem opt-in e templates aprovados, ainda não implementados.

## Limitadores antes de liberar clientes

- Não foi realizado OAuth real nem envio de mensagens porque faltam credenciais Meta/Admin SDK e contas autorizadas.
- Preview de Vercel não é necessariamente domínio autorizado no OAuth; testar conexões reais apenas com redirect e domínio cadastrados na Meta.
- O conteúdo por URL pode falhar se a imagem não estiver disponível publicamente para Meta. Upload e geração de imagens são etapas futuras.
- Publicações agendadas exigem cron autenticado efetivamente executando; monitorar falhas, reconciliar publicação e implementar retry/idempotência antes de prometer SLA.
- Integração de DM Instagram, métricas de audiência reais, Carrossel/Reels/Stories, template WhatsApp e atendimento multicanal avançado não foram concluídos. Não apresentar como disponíveis.
- Revisar regras multiempresa do Firestore, Auth e rate limits. Ver docs/SECURITY_ROLLOUT.md. Evitar deploy de produção sem QA completo.

Fontes oficiais: https://www.postman.com/meta/instagram/folder/1z5vxzu/instagram-api-with-instagram-login
https://www.postman.com/meta/whatsapp-business-platform/collection/du6gzjv/embedded-signup
https://www.postman.com/meta/whatsapp-business-platform/folder/ozgs3jn/webhook-subscriptions

Segurança: Social Hub grava conexões, tokens, rascunhos, mensagens e automações sob
socialWorkspaces/{agencyUid}, fora de users. Firestore Rules atuais negam acesso a
socialWorkspaces; somente o Firebase Admin SDK do backend pode consultar os registros.
