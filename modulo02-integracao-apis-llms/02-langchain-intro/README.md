# LangChain.js + LangGraph: Guia de Referência

## Visão Geral

Este módulo cobre a construção de pipelines estruturados com **LangChain.js** e **LangGraph**, usando Node.js 24 (TypeScript nativo) e Fastify como camada HTTP. O foco está em **gerenciamento de estado**, **fluxos condicionais** e **observabilidade via LangGraph Studio**.

O projeto implementa uma Web API que classifica a intenção do usuário (`uppercase`, `lowercase`, `unknown`) e roteia a execução para nós específicos de um grafo — sem depender de um LLM para a lógica de roteamento nesta fase.

## Stack

| Dependência     | Versão                           |
| --------------- | -------------------------------- |
| Node.js         | 24 (TypeScript stripping nativo) |
| Fastify         | 5.7.4                            |
| @langchain/core | 1.1.44                           |
| langchain       | 1.2.17                           |
| @types/node     | 24                               |

**Referências:**

- [LangChain JS Docs](https://docs.langchain.com/oss/javascript/langchain/overview)
- [LangGraph JS Docs](https://docs.langchain.com/oss/javascript/langgraph/overview)

---

## Setup

### 1. Instalar dependências

```pwsh
cd .\modulo02-integracao-apis-llms\02-langchain-intro\
npm init -y
npm install fastify@5.7.4 @types/node@24
npm install @langchain/core@1.1.44 langchain@1.2.17
```

### 2. Configurar como ES Module

Em `package.json`, adicionar:

```json
{
  "type": "module"
}
```

> Obrigatório para uso de `import`/`export` nativos com Node.js 24. Sem isso, os imports quebram em runtime.

### 3. Configurar variáveis de ambiente

Criar `.env` na raiz do projeto:

```bash
LANGCHAIN_API_KEY=sua_chave_do_langsmith
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=nome-do-projeto
```

A **LANGCHAIN_API_KEY** é gerada no [LangSmith](https://smith.langchain.com/). O tracing é gratuito no plano básico.

### 4. Gerar e explorar o template (opcional)

```pwsh
npx @langchain/langgraph-cli new
cd .\myapp\
npx @langchain/langgraph-cli@latest dev
```

Copiar o arquivo `langgraph.json` gerado para a raiz do projeto, depois remover o template:

```pwsh
cd ..
Remove-Item -Recurse -Force .\myapp\
```

> O `langgraph.json` define qual export o Studio deve carregar como grafo principal.

---

## Conceitos Fundamentais

### Chain e Pipe

**Chain** é o princípio central do LangChain: composição de funções em sequência. Cada etapa recebe um input, processa e passa o resultado adiante.

```
entrada → transformação → chamada de modelo → pós-processamento → saída
```

Cada etapa é **isolável**, **testável** e **substituível** — incluindo a troca de um modelo por outro sem refatorar o fluxo.

### Nó (Node)

Um **nó** é uma função que recebe o estado atual do grafo, processa e retorna um estado atualizado. Contrato invariável:

```typescript
function meuNode(state: GraphState): Partial<GraphState> {
  // lê state, processa, retorna campos atualizados
  return { output: state.messages.at(-1)?.content.toUpperCase() };
}
```

### Edge (Aresta)

Uma **edge** define a ordem de execução entre nós. Pode ser:

- **Direta:** `START → nodeA → nodeB → END`
- **Condicional:** o próximo nó é determinado pelo valor de um campo do estado em runtime

### Estado (State)

O **estado** é o contrato do grafo — o objeto compartilhado lido e escrito por todos os nós. Deve ser definido explicitamente antes de construir o grafo.

### LangSmith / LangGraph Studio

**LangSmith** é a camada de observabilidade: exibe quais nós executaram, o estado antes/depois de cada etapa, prompts enviados e respostas recebidas. É gratuito para uso em desenvolvimento.

**LangGraph Studio** (servidor local via CLI) renderiza o grafo visualmente e expõe um chat para testar interações diretamente no navegador.

---

## Estrutura do Projeto

```
02-langchain-intro/
├── .env
├── langgraph.json
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts             # Fastify HTTP server
│   ├── graph/
│   │   ├── index.ts          # buildGraph() + export para o Studio
│   │   ├── state.ts          # GraphState schema (Zod)
│   │   ├── identifyIntentNode.ts
│   │   ├── uppercaseNode.ts
│   │   ├── lowercaseNode.ts
│   │   ├── fallbackNode.ts
│   │   └── chatResponseNode.ts
└── tests/
    └── chat.e2e.test.ts
```

---

## Implementação

### 1. Definir o Estado

```typescript
// src/graph/state.ts
import { z } from "zod";
import { messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const GraphStateSchema = z.object({
  messages: z.array(z.instanceof(BaseMessage)).default([]),
  command: z.enum(["uppercase", "lowercase", "unknown"]).default("unknown"),
  output: z.string().default(""),
});

export type GraphState = z.infer<typeof GraphStateSchema>;
```

> **messages** deve existir para o LangGraph Studio renderizar o chat. **command** é a variável de decisão do fluxo condicional. **output** é o resultado exposto pela API.

### 2. Criar os Nós

**identifyIntentNode** — classifica a intenção e define `command`:

```typescript
// src/graph/identifyIntentNode.ts
import { GraphState } from "./state.ts";

export function identifyIntentNode(state: GraphState): Partial<GraphState> {
  const input = (state.messages.at(-1)?.content as string) ?? "";
  const text = input.toLowerCase();

  let command: GraphState["command"] = "unknown";
  if (text.includes("upper")) command = "uppercase";
  else if (text.includes("lower")) command = "lowercase";

  return { command, output: input };
}
```

**uppercaseNode** — transforma o texto para maiúsculo:

```typescript
// src/graph/uppercaseNode.ts
import { GraphState } from "./state.ts";

export function uppercaseNode(state: GraphState): Partial<GraphState> {
  const input = (state.messages.at(-1)?.content as string) ?? "";
  return { output: input.toUpperCase() };
}
```

**lowercaseNode** — transforma o texto para minúsculo:

```typescript
// src/graph/lowercaseNode.ts
import { GraphState } from "./state.ts";

export function lowercaseNode(state: GraphState): Partial<GraphState> {
  const input = (state.messages.at(-1)?.content as string) ?? "";
  return { output: input.toLowerCase() };
}
```

**fallbackNode** — resposta padrão para intenções não reconhecidas:

```typescript
// src/graph/fallbackNode.ts
import { GraphState } from "./state.ts";

export function fallbackNode(_state: GraphState): Partial<GraphState> {
  return {
    output: 'Comando não reconhecido. Use "uppercase" ou "lowercase" no texto.',
  };
}
```

**chatResponseNode** — materializa `output` como `AIMessage` no histórico (necessário para o Studio renderizar a resposta no chat):

```typescript
// src/graph/chatResponseNode.ts
import { AIMessage } from "@langchain/core/messages";
import { GraphState } from "./state.ts";

export function chatResponseNode(state: GraphState): Partial<GraphState> {
  return {
    messages: [...state.messages, new AIMessage(state.output)],
  };
}
```

### 3. Construir o Grafo com Fluxo Condicional

```typescript
// src/graph/index.ts
import { StateGraph, START, END } from "@langchain/langgraph";
import { GraphStateSchema, GraphState } from "./state.ts";
import { identifyIntentNode } from "./identifyIntentNode.ts";
import { uppercaseNode } from "./uppercaseNode.ts";
import { lowercaseNode } from "./lowercaseNode.ts";
import { fallbackNode } from "./fallbackNode.ts";
import { chatResponseNode } from "./chatResponseNode.ts";

export function buildGraph() {
  const workflow = new StateGraph<GraphState>({ channels: GraphStateSchema });

  workflow
    .addNode("identifyIntent", identifyIntentNode)
    .addNode("uppercase", uppercaseNode)
    .addNode("lowercase", lowercaseNode)
    .addNode("fallback", fallbackNode)
    .addNode("chatResponse", chatResponseNode);

  workflow.addEdge(START, "identifyIntent");

  workflow.addConditionalEdges("identifyIntent", (state) => {
    switch (state.command) {
      case "uppercase":
        return "uppercase";
      case "lowercase":
        return "lowercase";
      default:
        return "fallback";
    }
  });

  workflow.addEdge("uppercase", "chatResponse");
  workflow.addEdge("lowercase", "chatResponse");
  workflow.addEdge("fallback", "chatResponse");
  workflow.addEdge("chatResponse", END);

  return workflow.compile();
}

// Export necessário para o LangGraph Studio
export const graph = buildGraph();
```

### 4. Expor como Web API (Fastify)

```typescript
// src/server.ts
import Fastify from "fastify";
import { HumanMessage } from "@langchain/core/messages";
import { buildGraph } from "./graph/index.ts";

const graph = buildGraph();

export const app = Fastify();

app.post("/chat", async (req, reply) => {
  const { message } = req.body as { message: string };

  const result = await graph.invoke({
    messages: [new HumanMessage(message)],
    command: "unknown",
    output: "",
  });

  return reply.send({ output: result.output });
});
```

### 5. Configurar o LangGraph Studio

```json
// langgraph.json
{
  "graphs": {
    "agent": "./src/graph/index.ts:graph"
  }
}
```

Iniciar o Studio:

```pwsh
npx @langchain/langgraph-cli@latest dev
```

O Studio abre no navegador e exibe o grafo. Para testar:

1. Abrir a aba **Chat**
2. Enviar mensagem com `upper` → fluxo segue por `identifyIntent → uppercase → chatResponse`
3. Enviar mensagem com `lower` → fluxo segue por `identifyIntent → lowercase → chatResponse`
4. Enviar mensagem sem gatilho → fluxo segue por `identifyIntent → fallback → chatResponse`

> Para reexecutar a partir de um nó específico, clique com o botão direito no nó no Studio e selecione **Re-run from here**.

---

## Testes Automatizados

Testes e2e usando `node:test` nativo e `inject` do Fastify (sem subir porta, sem dependência de rede):

```typescript
// tests/chat.e2e.test.ts
import { describe, it } from "node:test";
import assert from "node:assert";
import { app } from "../src/server.ts";

describe("POST /chat", () => {
  it("deve transformar para uppercase", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/chat",
      payload: { message: "make this upper please" },
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(JSON.parse(res.body).output, "MAKE THIS UPPER PLEASE");
  });

  it("deve transformar para lowercase", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/chat",
      payload: { message: "convert to LOWER please" },
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(JSON.parse(res.body).output, "convert to lower please");
  });

  it("deve retornar fallback para comando desconhecido", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/chat",
      payload: { message: "olá mundo" },
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(JSON.parse(res.body).output.includes("Comando não reconhecido"));
  });
});
```

Executar:

```pwsh
node --test
```

---

## Pontos de Atenção

| Situação                                  | Causa                                      | Solução                                                        |
| ----------------------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| `ERR_MODULE_NOT_FOUND` ao importar        | `type: "module"` ausente no `package.json` | Adicionar `"type": "module"`                                   |
| Imports com extensão `.js` não resolvidos | Node ESM exige extensão explícita          | Usar `.ts` nos imports ao rodar com TypeScript nativo          |
| Studio não encontra o grafo               | Export incorreto em `langgraph.json`       | Verificar path e nome do export exportado                      |
| Resposta duplicada no chat do Studio      | `AIMessage` adicionada mais de uma vez     | Centralizar adição de `AIMessage` apenas no `chatResponseNode` |
| Template gerado com versão desatualizada  | CLI usa versão beta mais antiga            | Fixar versões manualmente no `package.json` após gerar         |
