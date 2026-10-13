# Agency OS AI Engine — plano de nuvem gratuita (pré-produção)

Estado: **preparação**. Não existe ainda uma VM Hermes provisionada nem teste de conexão real. Esta documentação NÃO liga automaticamente o motor na Vercel.

## Arquitetura adotada
- Frontend React/Vite e API autenticada continuam no projeto Vercel existente `agency-os-by-techify`.
- `server/hermesConnector.ts` já implementa a ponte privada `POST /v1/chat/completions` e exige proprietário autorizado.
- Hermes Agent (NousResearch) deve executar numa **VM dedicada**, com armazenamento persistente e chave própria; não colocar o runtime dentro do navegador nem passar tokens Firebase Admin/Meta/Stripe ao agente.
- Pilotar apenas com a conta proprietária até existir isolamento de instância ou credenciais por tenant.

## Hospedagem sem mensalidade: Oracle Cloud Always Free (preferência)
1. Criar/validar conta Oracle Cloud e verificar elegibilidade e capacidade para uma VM Always Free (a criação depende de verificação do provedor e capacidade regional; não é garantida).
2. Criar VM Linux **marcada Always Free** com armazenamento persistente, firewall conservador e acesso SSH por chave. Nunca usar forma paga por engano; conferir o orçamento e limites da conta.
3. Instalar Docker conforme instruções oficiais e seguir a documentação do projeto Hermes: https://hermes-agent.nousresearch.com/docs/user-guide/docker
4. Executar o setup Hermes e configurar credencial do **provedor de modelo** (gratuidade ou cobrança são independentes da VM).
5. Em `~/.hermes/.env`, configurar `API_SERVER_ENABLED=true` e `API_SERVER_KEY=<segredo_aleatorio_forte>`. Confirmar com `hermes gateway`; API local padrão `127.0.0.1:8642`. Docs: https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server
6. Oferecer API para Vercel por **HTTPS autenticado**, com proxy/túnel seguro que alcance apenas a API (não expor terminal, dashboard ou portas administrativas). Restringir acesso, atualizações, ferramentas e logs do container.
7. Vercel → projeto `agency-os-by-techify` → Settings → Environment Variables → Production:
   - `HERMES_AGENT_URL` = origem HTTPS segura sem path (exemplo `https://hermes.example.com`)
   - `HERMES_AGENT_API_KEY` = mesma chave privada de `API_SERVER_KEY`
   - `HERMES_AGENCY_OWNER_UID` = UID real no Firebase Authentication do proprietário
8. Realizar **um único deploy**, somente depois que a VM estiver ativa e os segredos configurados. Testar proprietário, funcionário, outra agência, token inválido, inatividade, retomada e vazamento entre tenants. Nunca marcar online com base apenas na presença das variáveis.

## Limitações e custos
- Máquinas gratuitas Oracle podem estar indisponíveis ou exigir validação de pagamento; não prometer disponibilidade ou 24h garantidas.
- Render/Koyeb Free têm suspensão por ociosidade e **não fornecem disco persistente para esse uso**. Podem servir para experimento stateless, mas NÃO para memória/sessões privadas permanentes do Hermes.
- Modelos Gemini/Groq/Nous/OpenRouter podem ter cotas gratuitas ou custos separados, dependendo do provedor.
- O Hermes tem ferramentas com efeitos reais no ambiente do servidor; API autenticada, limites de recursos e aprovações humanas para ações sensíveis são obrigatórios.
- Bridge atual usa timeout de 45s e chat stateless. Antes de tarefas de longa duração, implementar jobs assíncronos e autorização por ação.

## Próximo requisito
O proprietário deve criar/autorizar a conta Oracle Cloud ou fornecer uma VM existente. A partir daí provisionar, configurar DNS/HTTPS e testar ponta a ponta. **Nenhum token ou segredo deve ser enviado em chat ou commit.**
