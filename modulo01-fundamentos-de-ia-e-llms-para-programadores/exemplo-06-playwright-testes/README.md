
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
