# HyperFrames no Social Media Hub — AgencyOS

Origem oficial: https://github.com/heygen-com/hyperframes (Apache 2.0, HeyGen).

Esta integração não copia o monorepo pesado para dentro do AgencyOS. Em vez disso, produz composições HTML/CSS/GSAP com o contrato HyperFrames: data-composition-id, data-width, data-height, data-duration e clips temporizados. A composição pode ser exportada para renderização local com `npx hyperframes lint`, `npx hyperframes check` e `npx hyperframes render` (Node.js 22+, navegador compatível e FFmpeg).

## No Estúdio
- Posts e legendas continuam nas funções existentes.
- A aba interna Vídeos com IA · HyperFrames solicita um briefing, proporção, estilo e duração.
- Gemini / Groq devolve apenas storyboard JSON; o servidor monta HTML de template seguro, não executa JavaScript gerado livremente pelo modelo.
- Salva o projeto sob `socialWorkspaces/{ownerUid}/hyperframesProjects/{projectId}`, limitado à agência autenticada via Firebase e à permissão social-hub.
- A prévia é reproduzida em iframe sandbox sem allow-same-origin.
- Exportação HTML não exige credencial HeyGen.
- Renderização opcional na HeyGen Cloud usa API oficial e créditos, depois de confirmação do responsável.
- `HEYGEN_API_KEY` ou `HYPERFRAMES_API_KEY` deve estar em Vercel Environment Variables → Production; se faltar, botão de MP4 fica indisponível.
- Renderização usa `POST https://api.heygen.com/v3/hyperframes/renders` com projeto ZIP base64 e `GET /v3/hyperframes/renders/{render_id}` para status. URLs de vídeo são assinadas temporariamente e devem ser consultadas novamente.
- Requisição tem idempotency key para evitar cobranças duplicadas e bloqueio de reenvio ambíguo. Não há publicação automática em Instagram.

## Segurança e limites
- Não expor a chave HeyGen no frontend.
- A chave HeyGen da plataforma implica **custo central** para todos os usuários autorizados; apenas proprietários podem disparar render.
- Implementar limites de render por empresa, créditos/quotas e controle de orçamento antes de liberar para centenas de clientes.
- Proibir render se a credencial não existir; não devolver MP4 fictício.
- Auditar regras Firestore e autorização multiempresa.
- A composição inicial é somente texto e formas, não inclui narração, música, imagens de terceiros ou automação da Meta.
- A versão inicial gera um roteiro com 2–7 cenas de motion graphics.
- Não expor diretamente vídeos de clientes entre workspaces.

Fontes técnicas:
- https://github.com/heygen-com/hyperframes
- https://hyperframes.heygen.com/guides/deploy
- https://hyperframes.heygen.com/deploy/cloud
