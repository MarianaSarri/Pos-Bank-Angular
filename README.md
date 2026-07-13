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
- Estado: NgRx (store/effects inicializados no app)
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
- Cache local de transacoes adicionadas/editadas em localStorage.
- Fallback para API remota quando nao ha dados em cache local.

## Estrutura do repositorio

- `pos-bank-angular/` aplicacao Angular
- `pos-bank-angular/src/app/` componentes, rotas, modelos e servicos
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
- A exclusao de transacao atualmente remove do cache local; para persistencia completa, a API deve suportar a operacao de delete.