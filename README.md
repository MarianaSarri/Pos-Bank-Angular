# Pos-Bank-Angular

Aplicacao financeira em Angular com foco em controle de transacoes, visualizacao de dashboard e gestao de lancamentos (receitas e despesas).

## Visao Geral

Este repositorio contem o shell principal da aplicacao, responsavel por:

- Estruturar layout com menu e cabecalho.
- Gerenciar fluxo de transacoes (listar, filtrar, editar e excluir).
- Abrir modal para cadastro de nova transacao.
- Carregar o dashboard via microfrontend remoto usando Native Federation.

## Arquitetura

- Frontend: Angular 21 (standalone components)
- Estado: NgRx com feature state/effects para transacoes
- Integracao HTTP: HttpClient
- Federacao: @angular-architects/native-federation
- UI compartilhada: @pos-bank/lib-bank

### Rotas principais

- /dashboard
	- carregada remotamente com `loadRemoteModule`
	- `remoteName`: `mfeDashboard`
	- `remoteEntry`: definido em `src/env/environment*.ts`
- /transactions
	- tela local de transacoes

## Funcionalidades atuais

- Layout principal com menu lateral, header e area de conteudo.
- Abertura de modal no header para adicionar transacao.
- Listagem de transacoes com:
	- paginacao
	- filtro por texto
	- filtro por tipo (receita/despesa/todos)
	- acoes de edicao e exclusao
- Carregamento de categorias da API para formularios e filtros.
- Listagem e mutacoes de transacoes integradas ao estado NgRx e a API remota.
- Filtros reativos com debounce e cancelamento de consultas obsoletas.
- Pre-carregamento seletivo da rota local de transacoes, sem antecipar o dashboard remoto.

## Estrutura do repositorio

- `pos-bank-angular/` aplicacao Angular
- `pos-bank-angular/src/app/` componentes, rotas, modelos e servicos
- `pos-bank-angular/src/app/transactions/state/` actions, reducer, selectors e effects de transacoes
- `pos-bank-angular/src/env/` variaveis de ambiente
- `docker-compose.yml` orquestracao para execucao em container
- `azure-pipelines.yml` pipeline de build e deploy em Azure Static Web Apps

## Requisitos

- Node.js 20+
- npm 11+

## Como rodar localmente

```bash
cd pos-bank-angular
npm install
npm start
```

A aplicacao sera servida em:

- http://localhost:4200

## Scripts disponiveis

Executar dentro de `pos-bank-angular`:

- `npm start` inicia o servidor de desenvolvimento (`ng serve`)
- `npm run build` gera build de producao (`ng build`)
- `npm run build-prod` gera build com configuracao `production`
- `npm test` executa os testes (`ng test`)

## Ambientes

As configuracoes ficam em:

- `pos-bank-angular/src/env/environment.ts`
- `pos-bank-angular/src/env/environment.development.ts`

Variaveis importantes:

- `apiUrl`: endpoint da API de transacoes/categorias
- `mfeDashboardUrl`: URL do `remoteEntry.json` do dashboard

## Firebase Authentication

O shell Angular usa Firebase Authentication para login/cadastro com email e senha, redefinicao de senha, restauracao da sessao durante a aba do navegador, logout e desafio MFA TOTP para contas que ja tenham esse fator cadastrado. As rotas `/dashboard` e `/transactions` exigem uma sessao Firebase; esses guards protegem somente a navegacao da interface.

Preencha `firebase.apiKey`, `firebase.authDomain`, `firebase.projectId` e `firebase.appId` nos arquivos de ambiente usando a configuracao de uma aplicacao Web do mesmo projeto Firebase do mobile. Esses valores sao configuracao publica do cliente, nao segredos. Habilite Email/Password em Firebase Console > Authentication. Nunca coloque uma service account ou chave privada no front-end.

**Importante:** a API atual permanece inalterada e nao valida Firebase ID Tokens. Portanto, o login nao protege os endpoints de transacoes nem os dados servidos por essa API. Nao use esses endpoints para dados financeiros reais sem autenticacao e autorizacao implementadas no backend. A sessao web usa persistencia de navegador limitada a sessao; isso nao equivale ao Keychain/Keystore do mobile.

## Execucao com Docker

Na raiz do repositorio:

```bash
docker compose up --build
```

Depois, acesse:

- http://localhost

## CI/CD (Azure)

O pipeline em `azure-pipelines.yml`:

- instala Node 20
- executa `npm ci`
- executa `npm run build-prod`
- publica no Azure Static Web Apps

## Observacoes

- O shell principal depende da disponibilidade do microfrontend remoto de dashboard.
- A exclusao agora chama o endpoint `DELETE` da API; a persistencia efetiva depende do suporte desse endpoint no backend.
- Versoes anteriores podiam deixar transacoes na chave `pos-bank-transactions` do armazenamento do navegador. A aplicacao deixou de ler e gravar essa chave, mas nao a apaga automaticamente para evitar perda de dados locais ainda nao sincronizados.