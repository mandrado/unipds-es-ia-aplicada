# RAG com JavaScript + Neo4j (Embeddings + Busca Vetorial + Resposta com LLM)

Este projeto demonstra um fluxo de RAG (Retrieval-Augmented Generation) com:

1. Leitura de um PDF (`tensores.pdf`)
2. Quebra do texto em chunks
3. Geração de embeddings localmente com `@huggingface/transformers`
4. Indexacao vetorial no Neo4j
5. Busca por similaridade
6. Geracao de resposta com LLM via OpenRouter

## Visao Geral da Arquitetura

- `src/documentProcessor.ts`: carrega e quebra o PDF em chunks.
- `src/config.ts`: centraliza configuracoes de embeddings, Neo4j, prompts e LLM.
- `src/index.ts`: orquestra todo o pipeline (ingestao, indexacao, busca e resposta).
- `src/ai.ts`: executa busca vetorial + montagem de prompt + chamada do modelo.
- `prompts/template.txt`: template de prompt.
- `prompts/answerPrompt.json`: regras e metadados do comportamento da resposta.
- `docker-compose.yml`: sobe o Neo4j local.
- `.env-template`: variaveis de ambiente obrigatorias.

## Pre-requisitos

- Node.js `v22.13.1` (conforme `package.json`)
- Docker em execucao
- NPM

## Configuracao de Ambiente

1. Copie o arquivo de exemplo:

```bash
copy .env-template .env
```

2. Ajuste as variaveis no `.env`:

- `OPENROUTER_API_KEY`: chave da API OpenRouter (obrigatoria para etapa de resposta)
- `NLP_MODEL`: modelo de chat usado para gerar resposta
- `EMBEDDING_MODEL`: modelo local de embedding (ex: `Xenova/all-MiniLM-L6-v2`)
- `NEO4J_USER`, `NEO4J_PASSWORD`, `NEO4J_URI`, `NEO4J_DATABASE`

Observacao importante:
Os embeddings sao gerados localmente, mas a resposta final do RAG usa um modelo remoto via OpenRouter.

## Instalacao

```bash
npm ci
```

Tambem funciona com:

```bash
npm install
```

## Subindo a Infra (Neo4j)

```bash
npm run infra:up
```

Depois, valide o Neo4j Browser em:

- http://localhost:7474/browser/

Credenciais padrao do compose local:

- usuario: `neo4j`
- senha: `password`

Se voce alterar a senha no `.env`, mantenha a consistencia com o `docker-compose.yml`.

## Executando o Pipeline

Modo desenvolvimento (watch):

```bash
npm run dev
```

Modo execucao unica:

```bash
npm run start
```

Durante a execucao, o sistema:

1. Carrega o `tensores.pdf`
2. Gera chunks de texto
3. Limpa os nos antigos do label `Chunk`
4. Salva os novos documentos no Neo4j (`addDocuments`)
5. Faz busca por similaridade para as perguntas definidas em `src/index.ts`
6. Gera resposta via LLM
7. Salva as respostas em arquivos `.md` na pasta `respostas/`

## Comparativo com o roteiro (`script.txt`)

Itens citados no roteiro e onde estao no projeto:

- `config.js` -> `src/config.ts`
- `util.js` -> `src/util.ts`
- `documentProcessor` -> `src/documentProcessor.ts`
- `embeddings` -> inicializados em `src/index.ts`
- `VectorStoreManager.addDocuments/clearAll` -> implementado no fluxo de `src/index.ts` com `Neo4jVectorStore.addDocuments(...)` e limpeza via query Cypher
- `docker-compose` -> `docker-compose.yml`
- `tensores.pdf` -> raiz do projeto

## Ajustando perguntas e comportamento

- Perguntas de teste: edite o array `questions` em `src/index.ts`
- Regras do assistente: edite `prompts/answerPrompt.json`
- Template do prompt: edite `prompts/template.txt`
- Quantidade de documentos recuperados: ajuste `similarity.topK` em `src/config.ts`

## Encerrando a Infra

```bash
npm run infra:down
```

## Troubleshooting rapido

- Erro de conexao com Neo4j:
	- confirme `npm run infra:up`
	- valide `NEO4J_URI`, usuario e senha no `.env`
- Falha de resposta com LLM:
	- confira `OPENROUTER_API_KEY`
	- valide `NLP_MODEL`
- Nao encontrou contexto relevante:
	- revise o PDF de entrada
	- ajuste `chunkSize/chunkOverlap` em `src/config.ts`
	- ajuste `similarity.topK`

## O que esta implementado nesta etapa

- Ingestao de PDF
- Chunking de texto
- Embeddings locais
- Indexacao vetorial no Neo4j
- Busca por similaridade
- Prompting estruturado com template + regras
- Geracao e persistencia de respostas em Markdown
