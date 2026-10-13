# Agência OS — correção de identidade do workspace (13/10/2026)

## Causa confirmada em código

O cadastro antigo criava algumas contas de proprietário com `userType: 'employee'`, sem `agencyOwnerUid`. O backend da versão nova impedia que qualquer conta do tipo employee administrasse o workspace, mesmo quando ela era a conta proprietária. Além disso, o login antigo procurava outros perfis pelo mesmo e-mail e podia reatribuir o usuário a uma empresa não relacionada.

## Regra atual

- O Firebase Auth UID define o workspace próprio da conta.
- `agencyOwnerUid` apontando a outro UID real prova vínculo como funcionário dessa outra empresa, portanto a conta **não** pode administrar acessos ali.
- Sem owner diferente, incluindo o marcador legado não resolvido `agency-master-owner`, a conta somente pode administrar **seu próprio workspace UID**; isso não concede acesso a outros dados ou empresas.
- `platform_admin` só vale se estiver em uma **custom claim assinada no ID token** via Admin SDK. Nome, e-mail, cargo, plano, fields editáveis e perfil legado não podem conceder acesso global.
- A lista de funcionários é exclusivamente `where('agencyOwnerUid', '==', auth.uid)` + `userType == employee` e exclui o dono da empresa.
- Apenas para o verdadeiro `platform_admin` é oferecida a lista separada de clientes SaaS, sem misturá-los à equipe interna.
- Convites do backend criam um usuário Auth e perfil `users/{auth.uid}` com `agencyOwnerUid` do proprietário; logins novos não copiam mais perfis por e-mail.
- Usuários antigos sem vínculo confiável NÃO são transferidos entre empresas automaticamente. É preciso migrar com UID e evidência da relação de trabalho, depois de backup e auditoria.
- Esta correção não cria uma custom claim, não muda campos de proprietário no Firestore, não altera billing e não apaga registros.

## Casos de autorização que devem ser testados com 2 empresas

| Perfil autenticado | agencyOwnerUid | Escopo do painel |
| --- | --- | --- |
| Proprietário novo (client) | ausente | sua empresa |
| Proprietário antigo (employee) | ausente | sua empresa |
| Proprietário antigo (employee) | próprio UID | sua empresa |
| Proprietário antigo (employee) | agency-master-owner | sua empresa, sem conceder acesso ao marcador |
| Funcionário convidado | UID da empresa A, diferente do Auth UID | negado como administrador |
| Conta da empresa B | ausente / próprio UID | apenas empresa B |
| plataforma (custom claim) | qualquer | acesso ao painel global SaaS, equipe separada por UID |
| Conta apenas com cargo/role “Master” | UID de empresa A | não ganha autorização global |

## Próximas verificações necessárias

1. Entrar no AgencyOS e abrir Administração da empresa. Deve responder `/api/admin/members` com JSON e somente funcionários associados ao UID real da empresa.
2. Revisar e reconciliar os cadastros históricos, principalmente registros de convidados antigos sem UID ou com proprietário simbólico. Nunca fazer associação somente por nome ou e-mail.
3. Verificar regras implantadas no Firebase, pois o repositório contém regras staged, não necessariamente as regras ativas; revisar outros listeners legados globais de usuários/chat para isolamento multiempresa completo.
4. Conceder `platform_admin` exclusivamente por fluxo de bootstrap administrativo externo, após confirmação da identidade e requisitos de segurança. O funcionário não deve obter Master a partir de campos editáveis do documento.
5. Implementar paginação de membros acima de 150 registros e testes E2E / Firestore Emulator de todos os fluxos administrativos.

Esta correção repara a classificação de proprietário no backend **sem** afirmar que todo o SaaS está pronto para produção multiempresa.
