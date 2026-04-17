# Exemplo 08 — Context7

Este exemplo demonstra o uso do **Context7**, um servidor MCP que fornece documentação atualizada de bibliotecas diretamente no contexto do GitHub Copilot e outros assistentes de IA.

## O que é o Context7?

O Context7 é um projeto da [Upstash](https://upstash.com) que disponibiliza documentação técnica de bibliotecas e frameworks de forma estruturada via protocolo MCP (Model Context Protocol). Com ele, o assistente de IA pode consultar documentação real e atualizada ao gerar código, evitando respostas baseadas em versões desatualizadas.

## Como este projeto foi configurado

### 1. Pesquisa e criação de conta

- Acessei o site do Context7 e pesquisei sobre o serviço.
- Criei uma conta no portal.
- Gerei uma **API Key** nas configurações da conta.

### 2. Instalação via extensão do VS Code

Em vez de instalar o servidor MCP via linha de comando, utilizei a abordagem mais simples:

1. Abri o VS Code e acessei o painel de **Extensões** (`Ctrl+Shift+X`).
2. Pesquisei por **MCP** na barra de busca.
3. Encontrei e selecionei a extensão **Context7** do projeto **Upstash**.
4. Cliquei em **Instalar**.
5. Quando solicitado, colei a **API Key** gerada no portal do Context7.

A extensão configurou automaticamente o servidor MCP no ambiente, sem necessidade de editar arquivos de configuração manualmente.

## Como usar

Com o servidor MCP do Context7 ativo, o GitHub Copilot (e outros clientes MCP compatíveis) passa a ter acesso à ferramenta `resolve-library-id` e `get-library-docs`, permitindo consultar documentação atualizada de qualquer biblioteca suportada durante a geração de código.

## o Prompt

Criado o arquivo `prompt.md` com a estrutura completa da tarefa.

Conteúdo copiado para o chat com a instrução:

> "Crie um subdiretório `nextjs-better-auth-demo/` na mesma pasta onde está este arquivo `prompt.md` e coloque todo o projeto dentro dele."

O agente de IA utilizado foi o **Claude Sonnet 4.6** via GitHub Copilot.
