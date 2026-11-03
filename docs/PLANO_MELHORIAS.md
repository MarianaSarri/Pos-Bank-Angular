# Plano de melhorias do Pos-Bank-Angular

## Objetivo

Definir uma evolucao incremental para melhorar a arquitetura front-end, o tempo de resposta e a seguranca, preservando Angular 21, componentes standalone e Native Federation. Este documento e um plano tecnico: autenticacao real e protecao de dados financeiros dependem de suporte da API e da infraestrutura, nao apenas de mudancas no navegador.

## Diagnostico atual

- O projeto usa Angular 21 com componentes standalone e separa telas, servicos e modelos em `pos-bank-angular/src/app/`.
- As rotas do dashboard e de transacoes usam carregamento lazy; o dashboard e carregado como microfrontend.
- O `TransactionsService` agora consulta e altera transacoes pela API, sem ler ou gravar transacoes em `localStorage`; a API e a fonte de verdade da listagem.
- Servicos e rotas usam `environment.ts`, com substituicao por `environment.development.ts` na configuracao de desenvolvimento do Angular.
- `TransactionsComponent` usa estado NgRx, selectors Signals e deteccao `OnPush`; o carregamento de consultas usa `switchMap` e a mudanca de filtros aplica debounce.
- NgRx Store, feature state, reducer, selectors e effects de transacoes estao registrados; outras funcionalidades ainda nao possuem estado NgRx proprio.
- A rota local de transacoes usa pre-carregamento seletivo; o dashboard remoto nao e pre-carregado.
- O build de producao ja tem otimizacao, hashing e limites de tamanho de bundle em `angular.json`.
- Nao foi identificada uma camada de autenticacao nas rotas ou nos servicos inspecionados. A URL configurada aponta para `my-json-server.typicode.com`, que deve ser tratada como dependencia demonstrativa ate que sua adequacao, controle de acesso e tratamento de dados sejam confirmados.

## 1. Arquitetura front-end moderna

### Direcao proposta

Organizar a aplicacao em torno dos componentes de interface, agrupados pela funcionalidade a que pertencem. Cada componente deve ter uma pasta propria com implementacao, template, estilos e testes. `shared` deve conter somente elementos reutilizados por funcionalidades independentes; nao deve virar um deposito generico. Manter a Clean Architecture proporcional ao tamanho atual: componentes cuidam da apresentacao e interacao, enquanto regras de negocio e acesso a dados ficam em arquivos proprios da funcionalidade. O dominio nao deve depender de Angular, HTTP, `localStorage` ou da biblioteca visual.

Estrutura de referencia para uma migracao gradual:

```text
src/app/
  core/                 # configuracao global, autenticacao, interceptors
  shared/               # somente UI/utilitarios usados por varias funcionalidades
  features/
    transactions/
      transaction-page/  # componente de pagina, template, estilos e testes
      transaction-list/  # componente de listagem, template, estilos e testes
      transaction-form/  # componente de formulario, template, estilos e testes
      state/             # NgRx feature state: actions, reducer, selectors e effects
      application/       # casos de uso e coordenacao da funcionalidade
      infrastructure/    # API/repositorios, DTOs, mapeadores e persistencia
      domain/             # regras de negocio e contratos independentes de Angular
      transactions.routes.ts
    categories/
      category-selector/ # componente proprio, se existir essa interface
      infrastructure/   # acesso a categorias usado pela funcionalidade
```

### Acoes recomendadas

- Colocar cada componente em sua propria pasta e manter juntos seu TypeScript, template, estilos e testes. Componentes devem coordenar a apresentacao, sem concentrar regras de negocio ou detalhes de HTTP.
- Extrair de `TransactionsService` as responsabilidades de acesso HTTP e persistencia para `infrastructure` da funcionalidade de transacoes; definir contratos quando trouxerem valor e manter o acesso remoto nessa camada.
- Manter cada servico junto da funcionalidade que o possui. Mover algo para `shared` somente quando houver reutilizacao real por funcionalidades distintas e uma responsabilidade generica estavel.
- Manter modelos de transporte (DTOs) separados das entidades de dominio quando houver diferencas de formato ou regras de validacao.
- Criar casos de uso para operacoes importantes, como listar, registrar, atualizar e excluir transacoes; regras de negocio devem ser testaveis sem navegador ou servidor.
- Manter e testar o NgRx feature state de transacoes, com actions, reducer, selectors e effects para coordenar consultas e mutacoes assincronas. Manter estado efemero de apresentacao local ao componente/Signals; evitar duplicar no store estado simples que nao precise ser compartilhado.
- Padronizar configuracao de ambiente e injecao de dependencias. Servicos nao devem importar diretamente um arquivo de ambiente especifico.
- Preservar componentes standalone e carregamento lazy; evitar camadas e abstractions sem uma necessidade concreta.

### Criterios de aceite

- Regras de dominio testaveis sem `HttpClient`, DOM ou `localStorage`.
- Componentes nao conhecem detalhes de endpoint, headers ou armazenamento; cada componente, servico e regra tem uma localizacao clara dentro da funcionalidade responsavel.
- Configuracao de producao e desenvolvimento validada por build e testes, sem referencias acidentais ao ambiente de desenvolvimento.

## 2. Performance e otimizacao

### Acoes recomendadas

- Medir uma linha de base antes de otimizar: tamanho inicial e por rota, tempo ate conteudo utilizavel, latencia dos endpoints e Core Web Vitals (LCP, INP e CLS).
- Manter os limites de bundle existentes e revisar alertas de build. Carregar rotas, bibliotecas e funcionalidades sob demanda; acompanhar separadamente o custo do shell e de cada microfrontend.
- Manter lazy loading e implementar preloading seletivo para rotas provaveis. Medir o efeito no tempo de navegacao e no bundle/rede; nao pre-carregar o dashboard remoto se isso aumentar o custo inicial sem beneficio comprovado.
- Garantir paginacao, filtros e ordenacao no servidor para conjuntos grandes. Definir uma politica explicita de cache com invalidacao e expiracao; evitar que dados parciais em `localStorage` substituam silenciosamente a resposta completa da API.
- Usar Programacao Reativa com RxJS para compor filtros, pagina e requisicoes; combinar `debounceTime`/`distinctUntilChanged` na busca com `switchMap` para cancelar consultas obsoletas e preferir `AsyncPipe` ou `takeUntilDestroyed` a assinaturas manuais desnecessarias.
- Aplicar cache de requisicoes GET com expiracao e invalidacao apos mutacoes. Preferir cache em memoria para dados da sessao; nao reintroduzir transacoes financeiras em armazenamento persistente do navegador.
- Revisar deteccao de mudancas e renderizacao de listas. Adotar `OnPush` ou Signals onde compatível e rastrear itens por identificador; reservar virtualizacao para listas grandes que justifiquem o custo.
- Tratar falhas e lentidao do dashboard remoto sem bloquear a tela de transacoes; definir timeout, estado de erro e estrategia operacional para indisponibilidade do MFE.
- Instrumentar erros e tempos de resposta sem registrar dados pessoais ou financeiros nos logs.

### Criterios de aceite

- Metricas de producao comparadas com a linha de base e objetivos acordados por rota.
- Bundle inicial permanece dentro dos budgets configurados, ou qualquer alteracao e justificada e revisada.
- Filtros e paginacao produzem resultados consistentes com API lenta, erro de rede e ausencia de cache.

## 3. Seguranca, autenticacao e dados sensiveis

### Autenticacao e autorizacao

- Definir provedor de identidade e fluxo com a equipe de backend. Para uma SPA, usar OpenID Connect/OAuth 2.0 com Authorization Code e PKCE; nunca embutir client secret no bundle.
- Preferir uma arquitetura BFF (Backend for Frontend) com sessao em cookie `HttpOnly`, `Secure` e `SameSite` quando suportada. Se a SPA precisar gerenciar tokens diretamente, manter tokens de curta duracao em memoria e documentar os riscos; nao persistir tokens em `localStorage`.
- Proteger rotas no Angular para experiencia do usuario, mas aplicar autenticacao e autorizacao efetivas em cada endpoint do servidor. Um guard no cliente nao e controle de acesso.
- Definir renovacao e expiracao de sessao, logout, tratamento de 401/403 e protecao contra CSRF conforme o mecanismo de sessao escolhido.

### Criptografia e armazenamento

- Usar TLS (HTTPS) em toda comunicacao; validar certificados e nao enviar dados financeiros a endpoints demonstrativos ou sem controle de acesso.
- Criptografar dados sensiveis em repouso no servidor, com chaves gerenciadas e rotacionadas por KMS/servico equivalente. Criptografia no cliente nao substitui controles do servidor e nao protege contra XSS quando a chave esta disponivel para a aplicacao.
- Remover do `localStorage` transacoes, tokens e outros dados sensiveis. Se cache local for indispensavel, limitar a dados nao sensiveis, aplicar expiracao/invalidacao e definir comportamento em logout e troca de usuario.
- Minimizar os dados coletados e retornados pela API, aplicar autorizacao por usuario/conta e nunca registrar payloads financeiros, tokens ou identificadores sensiveis.

### Seguranca de aplicacao e cadeia de dependencias

- Configurar Content Security Policy compativel com Native Federation e validar origem/integridade dos artefatos remotos; restringir origens de scripts, API e conexoes ao necessario.
- Revisar CORS, cabecalhos de seguranca e validacao de entrada na API. Validacao do front-end melhora usabilidade, mas nao substitui validacao no servidor.
- Executar auditoria de dependencias no CI, manter Angular e bibliotecas atualizados e revisar dependencias do microfrontend como parte da superficie de ataque.
- Nao armazenar segredos em `environment.ts`: valores empacotados no front-end sao publicos. Configurar URLs e origem permitida por ambiente sem incluir credenciais.

### Criterios de aceite

- Fluxos de login, sessao expirada, logout e acesso negado testados de ponta a ponta.
- Endpoints validam identidade e permissao no servidor; nenhum segredo ou token e encontrado no bundle ou em armazenamento persistente do navegador.
- Revisao confirma HTTPS, politica de CSP, origem dos microfrontends e estrategia de protecao em repouso antes de processar dados financeiros reais.

## 4. Verificacao geral de vulnerabilidades

### Escopo e metodo

Foi feita uma revisao estatica do shell Angular, rotas, servicos, configuracao de build e pipeline, alem de uma consulta `npm audit` ao registry publico usando o lockfile atual. A revisao nao e um pentest e nao inclui o codigo-fonte do microfrontend remoto, da API, da biblioteca privada `@pos-bank/lib-bank`, nem a configuracao efetiva do Azure Static Web Apps, CDN, DNS ou cabecalhos HTTP em producao.

### Achados e riscos

| Prioridade | Evidencia observada | Impacto e recomendacao |
| --- | --- | --- |
| Alta, antes de dados reais | Nao foi encontrado fluxo de login, gerenciamento de sessao, interceptor de autenticacao ou protecao de rotas no shell. A URL da API usa `my-json-server.typicode.com`. | A autenticacao e autorizacao do servidor nao podem ser inferidas pelo front-end. Confirmar se a API e demonstrativa; nao enviar dados financeiros reais sem identidade, autorizacao por usuario/conta e controles de sessao no backend. |
| Alta, se houver dados legados no navegador | Versoes anteriores gravavam transacoes em `localStorage`; a implementacao atual deixou de ler e gravar essa chave, mas nao a remove automaticamente. | Dados antigos ainda podem permanecer no perfil do navegador. Planejar uma limpeza controlada apos confirmar que nao ha transacoes locais nao sincronizadas; nao apagar silenciosamente dados potencialmente unicos. |
| Alta, por cadeia de fornecimento | A rota carrega JavaScript executavel de um `remoteEntry.json` hospedado em outra origem via Native Federation. | A origem remota passa a fazer parte da base de confianca da aplicacao. Restringir origens, proteger o pipeline e a conta de deploy, revisar e aprovar releases do MFE, monitorar alteracoes e validar se a estrategia de CSP/integridade e compativel com o mecanismo de federacao. |
| Media | A lista pode ser servida integralmente do `localStorage` quando ha qualquer resultado em cache; exclusao remove apenas o cache local e nao chama a API. | Pode exibir dados desatualizados e divergir do estado persistido no servidor, afetando integridade e disponibilidade percebida. Definir uma fonte de verdade, sincronizacao e tratamento de falhas coerentes; validar entradas no backend. |
| Media, depende da hospedagem | O HTML e o pipeline inspecionados nao definem CSP ou outros cabecalhos de seguranca; nao foi localizado `staticwebapp.config.json`. | Nao e possivel afirmar que os cabecalhos estejam ausentes em producao, pois podem ser aplicados fora do repositorio. Verificar a resposta HTTP publicada e configurar CSP, `frame-ancestors`, `X-Content-Type-Options`, politica de referrer e HSTS na camada de hospedagem, conforme compatibilidade. |
| Media, disponibilidade | A rota inicial redireciona para `/dashboard`, carregado remotamente, sem fallback explicito no trecho inspecionado. A pipeline executa `npm ci` e build, mas nao executa testes nem auditoria de dependencias. | Indisponibilidade ou falha de publicacao do MFE pode afetar a entrada principal. Adicionar estado de erro/fallback local, monitoramento e verificacoes automatizadas de teste, build e dependencias no CI. |

### Verificacoes especificas solicitadas

- **Cross-site scripting (XSS):** a busca estatica no shell nao encontrou `innerHTML`, `outerHTML`, `DomSanitizer`/`bypassSecurityTrust`, `eval` ou `document.write`. Isso reduz a evidencia de XSS DOM direto no codigo inspecionado. Angular escapa interpolacoes e sanitiza determinados bindings por padrao; ainda assim, nao usar bypass de sanitizacao com dados externos, validar conteudo no servidor e revisar separadamente o MFE e `@pos-bank/lib-bank`.
- **Dependencias open source:** `npm audit --omit=dev` e `npm audit` completos, consultados no registry publico durante a verificacao anterior, retornaram zero vulnerabilidades conhecidas para o lockfile consultado. O resultado e temporal e deve ser atualizado; nao cobre dependencias carregadas pelo MFE em runtime, codigo privado, licencas, pacotes comprometidos ou falhas ainda nao publicadas. Repetir no CI em cada atualizacao e definir politica de bloqueio por severidade.
- **Sessao e autenticacao:** nao foi localizado mecanismo no front-end. Guards Angular podem melhorar navegacao, mas nao impedem acesso direto a API; autenticar e autorizar toda operacao no servidor. Definir fluxo OIDC/OAuth com Authorization Code + PKCE, expiracao, logout, renovacao e protecao CSRF quando aplicavel; preferir BFF e cookie `HttpOnly`, `Secure`, `SameSite` quando a arquitetura permitir.
- **Disponibilidade e confiabilidade:** medir disponibilidade da API e do MFE, adicionar timeouts, limites de retry com backoff, fallback e alertas. Evitar retry de operacoes de escrita sem idempotencia. Manter uma tela local acessivel mesmo com falha do dashboard remoto e testar indisponibilidade, latencia e respostas invalidas.
- **URLs externas:** API e MFE usam HTTPS e origens fixas nos arquivos de ambiente inspecionados. HTTPS protege o transporte, mas nao valida se a origem e autorizada ou confiavel. Restringir origens por ambiente, configurar CSP e CORS na camada correta, revisar mudancas de dominio e controlar publicacao dos artefatos remotos. CORS e CSP nao substituem autenticacao/autorizacao.
- **Criptografia:** foi observada protecao de transporte via HTTPS nas URLs configuradas. O cache `localStorage` e texto claro; nao foi possivel verificar criptografia em repouso, gestao de chaves, backups ou bases da API. Implementar criptografia em repouso no servidor com chaves gerenciadas; nao introduzir criptografia no navegador como substituto, pois a chave acessivel ao cliente nao protege contra XSS.
- **Sanitizacao e integridade:** nao foram encontrados usos explicitos de APIs de bypass ou HTML dinamico no codigo pesquisado. Dados de formulario, query params e respostas da API continuam sendo entrada nao confiavel: validar formato e limites no servidor e usar bindings Angular seguros. O conteudo e a integridade do JavaScript federado requerem revisao independente.

### Relacao com OWASP e propriedades do sistema

Os achados se relacionam principalmente a controle de acesso (OWASP A01), falhas criptograficas (A02), injecao/XSS (A03), configuracao de seguranca (A05), componentes vulneraveis/desatualizados (A06), autenticacao (A07), integridade de software e dados (A08), logging/monitoramento (A09) e disponibilidade. A auditoria de dependencias nao reportou alertas conhecidos nesta consulta; os demais pontos acima sao riscos ou lacunas de verificacao, nao confirmacao automatica de explorabilidade.

- **Confidencialidade:** reduzir dados financeiros expostos no navegador, exigir autenticacao/autorizacao no servidor e proteger transporte e armazenamento.
- **Integridade:** manter a API como fonte de verdade, validar operacoes no servidor e controlar a origem e o processo de release do microfrontend.
- **Disponibilidade e confiabilidade:** reduzir dependencia de origem remota unica, oferecer fallback, monitorar falhas e testar cenarios de degradacao.

### Ordem de tratamento

1. Confirmar com backend/produto se a API atual e demonstrativa e impedir dados reais ate a validacao de autenticacao, autorizacao e armazenamento.
2. Remover ou limitar o cache de transacoes em `localStorage`; corrigir a exclusao para refletir a persistencia real e definir a API como fonte de verdade.
3. Validar headers/CSP e origens reais em producao; formalizar confianca, revisao e deploy do microfrontend remoto.
4. Adicionar ao CI testes, `npm audit` e politica de atualizacao; monitorar disponibilidade e preparar fallback para API/MFE.
5. Planejar teste dinamico autenticado e revisao de backend/infraestrutura com escopo aprovado antes do uso de dados financeiros.

## 5. Aderencia ao Tech Challenge - Fase 4

O PDF permite evoluir a versao web em Angular ou a versao mobile. Este plano assume a continuidade da versao web Angular; a meta mobile sera atendida por uma interface responsiva, sem propor uma reescrita nativa fora do escopo atual.

| Requisito do desafio | Como o plano atende | Situacao observada |
| --- | --- | --- |
| Arquitetura modular e Clean Architecture | Organizacao por componentes dentro de funcionalidades, com camadas `presentation`, `application`, `domain` e `infrastructure`; `shared` apenas para reutilizacao real. | Planejado; a estrutura atual ainda precisa ser refatorada gradualmente. |
| State Management Patterns avancados | NgRx feature state de transacoes com actions, reducer, selectors e effects; estado efemero permanece local ao componente. | Feature state de transacoes foi implementado; cobertura automatizada e validacao de build ainda pendentes. |
| Lazy loading e pre-carregamento | Manter rotas sob demanda e implementar preloading seletivo guiado por metricas, sem carregar o MFE remoto antecipadamente por padrao. | Lazy loading existente e preloading seletivo da rota local de transacoes implementado; avaliar impacto real com metricas. |
| Cache e Programacao Reativa | Cache GET com expiracao/invalidacao e RxJS para filtros, cancelamento de consultas obsoletas e atualizacao da interface. | RxJS ja e usado; cache atual em `localStorage` precisa ser substituido/limitado por seguranca e consistencia. |
| Seguranca, autenticacao e criptografia | Fluxo seguro com backend, protecao de sessao, remocao de dados sensiveis do armazenamento do navegador e criptografia em repouso no servidor. | Planejado; depende de suporte e validacao da API/infraestrutura. |
| Experiencia web/mobile | Layout responsivo e verificacao dos fluxos em larguras de tela mobile e desktop. | Incluir nos criterios de validacao visual e funcional. |
| Entrega do projeto | Repositorio Git e README com tecnologias e passos locais; video demonstrativo de ate cinco minutos. | O README atual ja lista tecnologias e execucao local; o video deve ser gravado e incluido/linkado na entrega. |

### Evidencias de aceite da entrega

- Build de producao e testes automatizados executados; apresentar os resultados junto ao repositorio.
- README revisado com tecnologias e instrucoes de execucao local atualizadas apos as mudancas.
- Demonstracao gravada com duracao maxima de cinco minutos, cobrindo os principais fluxos e a aplicacao responsiva.
- Evidencias de desempenho (antes/depois) e de seguranca compativeis com o escopo do front-end e as dependencias do backend.

## Sequencia sugerida

1. **Fundacao e riscos imediatos:** confirmar API e requisitos de dados; corrigir o uso de configuracao de ambiente no servico de transacoes; retirar dados sensiveis do cache local; registrar metricas de base e auditar dependencias.
2. **Arquitetura e consistencia:** separar repositorio/API da apresentacao, definir contratos e casos de uso, registrar o NgRx feature state de transacoes (actions, reducer, selectors e effects) e adicionar cobertura de testes por feature.
3. **Performance medida:** corrigir consultas redundantes e cache, validar budgets e desempenho de rotas/MFE, e otimizar renderizacao apenas onde as metricas indicarem gargalo.
4. **Seguranca ponta a ponta:** implementar o fluxo acordado com o backend, controles de sessao e autorizacao, criptografia em repouso no servidor, politicas de navegador e verificacoes no CI.

A ordem pode mudar conforme a confirmacao de que a API atual e apenas demonstrativa. Autenticacao e criptografia de dados financeiros devem ser tratadas como requisito previo ao uso de dados reais, nao como melhoria cosmética do front-end.
