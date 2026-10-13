# Limites de render no HyperFrames
O backend permite no máximo **20 solicitações de geração de storyboard por usuário/dia** e **3 solicitações de MP4 por empresa/dia**. Contadores são incrementados com transações Firestore, resistindo a cliques concorrentes.
Antes do render, é exigida confirmação do usuário, uma identidade Firebase autorizada como proprietário e uma chave HeyGen exclusiva do servidor. A auditoria registra render.requested.
Projetos cujo pedido de render ficou incerto NÃO podem ser enviados novamente automaticamente: conferir HeyGen para evitar cobrança duplicada.
Os limites atuais são freios de segurança, não um sistema completo de faturamento ou crédito por tenant; controle de créditos pré-pagos ainda é necessário antes de disponibilizar MP4 em escala.
