# Exclusão controlada de um cadastro legado de funcionário

Apenas um administrador logado e verificado com escopo ao workspace correspondente pode excluir um registro de funcionário que **não possui Firebase Authentication**.

Fluxo da interface:
1. Na linha marcada "Cadastro legado", clique em "Excluir cadastro".
2. Confira nome/e-mail. Digite o e-mail exibido e confirme a exclusão.
3. O servidor verifica o Firebase Auth, a relação de proprietário com o workspace e a correspondência exata do e-mail informado.
4. Uma transação Firestore remove o documento \`users/{uid}\` e registra \`user.legacy_deleted\` em \`adminAuditLog\`.
5. Atualize a lista; o endereço de e-mail fica livre para um novo convite caso não haja conta Firebase Auth existente.

Esta operação **não exclui** projetos, tarefas, postagens, arquivos, mensagens ou quaisquer registros históricos em outras coleções. Não é uma função para excluir contas ativas: se houver Firebase Auth, a operação retorna 409 e não apaga nada.

Não se fazem alterações diretas em produção sem sessão autenticada do proprietário. O código da função não autoriza um usuário a excluir registros de outro workspace.
