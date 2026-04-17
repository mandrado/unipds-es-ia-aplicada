
# Projeto de Automação com Playwright MCP

## Finalidade do Projeto

Este projeto tem como objetivo implementar automação de testes e interações web utilizando o Playwright em conjunto com o MCP (Model Context Protocol). A solução permite a execução automatizada de tarefas em navegadores web, incluindo testes de interface, scraping de dados e automação de processos web.

## Pré-requisitos

### Instalação das Extensões Necessárias

Para o funcionamento adequado deste projeto, é **obrigatória** a instalação das seguintes extensões:

#### Playwright Test for VSCode
Extensão oficial do Playwright para Visual Studio Code que fornece:
- Integração nativa com o editor
- Execução e debug de testes
- Visualização de resultados
- IntelliSense para APIs do Playwright

#### Playwright MCP
Esta extensão fornece a integração necessária entre o Playwright e o protocolo MCP, permitindo:

- Controle automatizado de navegadores
- Execução de scripts de automação
- Integração com sistemas de IA e assistentes
- Comunicação via protocolo MCP

### Como Instalar

<!-- As extensões podem ser instaladas diretamente através da janela de extensões do VSCode -->
Você pode instalar as extensões diretamente através da janela de extensões do VSCode, procurando por "Playwright Test" e "Playwright MCP".

Alternativamente, execute o seguinte comando para instalar a extensão:
bash
npm install playwright-mcp
Ou, se estiver usando yarn:
bash
yarn add playwright-mcp
**Importante:** Sem estas extensões, o projeto não funcionará corretamente, pois elas são fundamentais para estabelecer a comunicação entre os componentes do sistema e fornecer o ambiente de desenvolvimento adequado.

## Passos Realizados Até o Momento

1. Estrutura inicial de testes Playwright criada no projeto.
2. Dependência de desenvolvimento instalada: `@playwright/test`.
3. Configuração principal criada em `playwright.config.js` com:
	- `baseURL` apontando para `https://mandrado.github.io/vanilla-js-web-app-example/`.
	- Timeout global de teste em 5 segundos (`5000ms`).
	- Execução configurada para Chromium.
	- Relatório HTML habilitado.
4. Pasta `tests/` criada com especificação inicial e depois evoluída para cobrir elementos reais da página.
5. Navegação dos testes ajustada para `page.goto('/vanilla-js-web-app-example/')`, conforme solicitado.
6. Levantamento dos elementos da aplicação em produção realizado (inputs, área de cards e títulos esperados).
7. Suite de testes atualizada para validar:
	- Título da página.
	- Campos do formulário (`#title`, `#imageUrl`, `#btnSubmit`).
	- Placeholder e tipo dos campos.
	- Exibição da lista de cards e quantidade inicial.
	- Títulos dos cards carregados por padrão.
	- Presença de texto alternativo nas imagens.
	- Inclusão de novo card após envio do formulário com dados válidos.
8. Workflow de CI criado em `.github/workflows/playwright.yml` para:
	- Checkout do repositório.
	- Setup do Node.js.
	- `npm ci`.
	- Instalação apenas do Chromium (`npx playwright install --with-deps chromium`).
	- Execução dos testes (`npm test`).
	- Upload do relatório HTML em caso de falha.
9. Execução local validada com sucesso: 8 testes passando.

## Resumo da Sessão Atual (Registro e Aprendizado)

Nesta etapa, a suíte foi evoluída com foco em comportamento real do formulário e em eliminação de duplicidades.

### O que foi realizado

1. A aplicação foi navegada em produção para mapear elementos e mensagens reais de validação antes de escrever os testes.
2. Foram criados cenários cobrindo:
	- Submissão válida do formulário e atualização da lista.
	- Validação de formulário com URL inválida.
	- Comportamento dos campos (preenchimento e limpeza após envio bem-sucedido).
	- Verificações estruturais da home (título, campos, cards iniciais e `alt` das imagens).
3. A execução foi ajustada para abrir o **Google Chrome instalado no computador** (modo headed), em vez do navegador embutido/extensão.
4. A navegação dos testes foi corrigida para a URL completa da aplicação (`/vanilla-js-web-app-example/`) para evitar execução na raiz do domínio.
5. Os testes antigos e novos foram consolidados em uma única suíte para evitar cenários duplicados.
6. O arquivo consolidado foi renomeado para o padrão do projeto: `tests/home.spec.ts`.

### Estado final validado

- Arquivo de teste principal: `tests/home.spec.ts`.
- Execução local no Chrome concluída com sucesso.
- Resultado final da suíte: **10 testes passando**.

### Aprendizados principais

- Basear os testes no comportamento observado da página reduz falsos positivos e asserts frágeis.
- Preferir seletores acessíveis (`getByRole` com nome) aumenta legibilidade e manutenção da suíte.
- Consolidar arquivos de testes evita redundância, reduz custo de manutenção e facilita onboarding.
- Em cenários com GitHub Pages/subpaths, validar `baseURL` + `goto` evita erros de rota e timeout.
