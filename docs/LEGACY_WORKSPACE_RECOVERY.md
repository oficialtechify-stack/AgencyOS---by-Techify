# Recuperação de workspace legado — AgencyOS

## Por que aparece "0 funcionários"
A interface antiga combinava registros globais de usuários, alguns com UIDs
sintéticos e sem Firebase Auth, e atribuía o proprietário por e-mail. O
novo backend corretamente consulta uma empresa por UID, mas pode não
localizar os usuários vinculados ao workspace legado.

## Recuperação adicionada
Endpoints autenticados: GET /api/admin/legacy-workspace e
POST /api/admin/legacy-workspace/claim.

1. O servidor valida o ID token Firebase com revogação habilitada e confirma
   que o e-mail da sessão é verificado.
2. A ligação antiga é inspecionada apenas a partir do agencyOwnerUid do
   próprio perfil autenticado; não existe busca global de empresas por e-mail.
3. Se esse UID pertencer a outra conta Firebase Auth real, é **proibido
   reivindicá-lo**.
4. Se for uma identidade antiga SEM conta Auth, o documento users/{legacyUid}
   deve ter e-mail idêntico ao endereço verificado pelo Firebase Auth para
   reconhecer a possibilidade de recuperação.
5. Os membros são contados somente com where(agencyOwnerUid,==,legacyUid).
   Os que não têm Firebase Auth válida são identificados como legados, não
   reativados automaticamente.
6. Após a confirmação explícita no painel, o servidor grava um vínculo
   audited em verifiedLegacyWorkspaceClaims/{legacyUid}. O vínculo é
   exclusivo por proprietário autenticado e verificado. Nenhum documento
   de empregado é transferido ou excluído.
7. O painel administrativo usa esse workspace depois do vínculo, sem copiar
   dados de outros clientes e sem dar permissão global de SaaS.

## Se a recuperação não estiver disponível
Pode ser que o UID antigo seja uma conta Auth real, o perfil legado não
exista, ou os e-mails não coincidam. Nesse caso, o sistema BLOQUEIA
automaticamente a recuperação. O usuário deve apresentar comprovação de
propriedade e um operador autorizado precisa revisar os UIDs e documentos
no Firebase Console; não é seguro contornar as verificações nem restaurar
vínculos por nomes semelhantes.

## Observações importantes
- verifiedLegacyWorkspaceClaims é uma coleção **server-only**, negada
  por padrão para os clientes em firestore.rules.
- Custom claim platform_admin NÃO foi atribuída; não está relacionada à
  propriedade de uma empresa.
- Funcionários legados sem Firebase Authentication precisam ser
  registrados/convidados por fluxo seguro antes de receber acesso.
- Não houve exclusão, alteração de senhas, renomeação de usuários,
  reatribuição de funcionários ou transferência de workspaces.
- Antes da produção geral testar o isolamento multiempresa com Firestore
  Emulator e confirmar as regras implantadas no Firebase.
