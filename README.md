# Pos-Bank-Angular

Aplicação financeira desenvolvida em Angular para controle de transações, com foco em acompanhamento de saldo, receitas, despesas e organização das movimentações.

## Visão Geral

O projeto reúne a interface principal da aplicação financeira, com dashboard, página de transações e componentes reutilizáveis para cadastro, edição e exclusão de lançamentos.

## O Que Já Temos

- Layout responsivo com menu lateral, header e navegação entre páginas.
- Dashboard com cards de saldo atual, débito e crédito.
- Lista de últimas transações na visão inicial.
- Página dedicada para consulta de transações.
- Cadastro, edição e exclusão de transações.
- Modal de transação com seleção de tipo, descrição, categoria, valor e data.
- Diálogo de confirmação para exclusão.
- Combobox de categorias separadas por receita e despesa.
- Serviço de transações em memória com dados mockados para desenvolvimento.
- Estrutura de componentes reutilizáveis para card, botão, ícone, menu e tabela.

## Stack Atual

- Angular 21
- TypeScript
- RxJS
- Tailwind CSS com PostCSS
- Vitest para testes

## Estrutura Principal

- `pos-bank-angular/src/app/pages/dashboard` para a visão resumida do financeiro.
- `pos-bank-angular/src/app/pages/transactions` para a lista completa de lançamentos.
- `pos-bank-angular/src/app/components` para os componentes reutilizáveis da interface.
- `pos-bank-angular/src/app/services` para a camada de regras e dados da aplicação.
- `pos-bank-angular/src/app/models` para os tipos de transações e categorias.

## Como Executar

Dentro da pasta `pos-bank-angular`:

```bash
npm install
npm start
```

Depois, acesse `http://localhost:4200/`.

Para testar e gerar build:

```bash
npm test
npm run build
```

## Scripts Disponíveis

- `npm start` para subir o servidor local.
- `npm run build` para gerar a versão de produção.
- `npm test` para executar os testes.
- `npm run watch` para rebuild contínuo em desenvolvimento.

## O Que Falta Fazer

### Fase 1 - Base de Integração

- Integrar a aplicação com uma API real para substituir os dados mockados.
- Persistir transações e categorias de forma completa.
- Garantir que as operações de criação, edição e exclusão estejam conectadas ao backend.

### Fase 2 - Experiência de Uso

- Melhorar filtros, busca e organização da listagem de transações.
- Refinar o dashboard com mais indicadores financeiros.
- Revisar testes e cobertura das principais jornadas da aplicação.

### Fase 3 - Evolução Analítica

- Criar um microfrontend de gráficos para análises visuais de receitas, despesas e saldo.
- Expandir a base de relatórios e visualizações da aplicação.
- Consolidar a navegação entre o app principal e os novos módulos analíticos.