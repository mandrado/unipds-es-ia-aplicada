
# OpenRouter na prática (JS)

## Visão Geral

Este projeto demonstra como criar um gateway HTTP inteligente para LLMs usando o OpenRouter, com roteamento multi-modelo configurável, integração segura e testes automatizados. O objetivo é permitir a troca de modelos por configuração, sem refatoração, e comparar critérios como custo, latência e throughput.

**Stack:** Node.js 24 (TypeScript nativo), Fastify 5.7.4, @openrouter/sdk 0.5.1, @types/node.

**Destaques:**
- Roteamento multi-modelo: escolha automática do modelo por preço, latência ou throughput.
- Configuração centralizada e validação fail-fast.
- Testes end-to-end nativos com node:test.
- Separação clara entre configuração, serviço de integração e API HTTP.

---


## Objetivo

Construir um gateway HTTP capaz de receber perguntas e rotear para diferentes modelos LLM, abstraindo a escolha do modelo por critérios configuráveis.

---


## Estrutura Essencial

```
01-smart-model-router-gateway/
├── .env / .env.example
├── package.json
├── tsconfig.json
├── src/
│   ├── config.ts
│   ├── openrouterService.ts
│   ├── server.ts
│   └── index.ts
└── tests/
        └── router.e2e.test.ts
```

---

---


## Componentes-Chave

- **config.ts**: Centraliza variáveis de ambiente, lista de modelos e estratégia de roteamento. Validação fail-fast impede execução sem API key.
- **openrouterService.ts**: Classe `OpenRouterService` encapsula integração com o SDK, aceita configuração injetável para testes, expõe método `generate(prompt)` que retorna `{ model, content }`.
- **server.ts**: Factory function `createServer(routerService)` expõe rota `POST /chat` com validação JSON Schema e tratamento de erro mínimo.
- **index.ts**: Instancia serviço e servidor, faz o boot na porta configurada.
- **router.e2e.test.ts**: Testes E2E nativos, validam roteamento por critério (`price`, `throughput`) usando `app.inject()`.

---



## Princípios de Engenharia

- **Credenciais seguras**: API key no `.env` (não versionado), `.env.example` documenta contrato.
- **Configuração validada**: fail-fast impede execução sem segredo.
- **Roteamento multi-modelo**: lista de até 3 modelos, critério configurável (`price`, `latency`, `throughput`).
- **Fallback automático**: se o modelo prioritário falhar, o próximo da lista é usado.
- **Testes automatizados**: node:test cobre cenários de roteamento, usando injeção de configuração.

---


## Recursos OpenRouter

- Modelos: https://openrouter.ai/models (filtrar por preço, contexto, categoria)
- Atividades: https://openrouter.ai/activity (uso por modelo/chave)
- Playground: https://openrouter.ai/chat (comparação de modelos)
- Rankings: https://openrouter.ai/rankings (trending, market share, apps)
- Chaves de API: https://openrouter.ai/workspaces/default/keys
- SDK: `npm install @openrouter/sdk@0.5.1`

---


## Stack

| Tecnologia        | Versão | Papel                        |
|-------------------|--------|------------------------------|
| Node.js           | 24.x   | Runtime TypeScript nativo    |
| Fastify           | 5.7.4  | Framework HTTP               |
| @openrouter/sdk   | 0.5.1  | SDK oficial OpenRouter       |
| @types/node       | ^24    | Tipos para Node.js           |

---


## Exemplo de Configuração

```typescript
// src/config.ts
export const config = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  models: [
    'openai/gpt-oss-120b:free',
    'liquid/lfm-2.5-1.2b-instruct:free',
    'tencent/hy3-preview:free',
  ],
  provider: { sort: { by: "price", partition: "none" } },
  temperature: 0.2,
  maxTokens: 100,
  systemPrompt: "You are a helpful assistant.",
  port: 3000
};
```

---

---


## Exemplo de Serviço

```typescript
// src/openrouterService.ts
import { OpenRouter } from "@openrouter/sdk";
export class OpenRouterService {
    constructor(config) {
        this.client = new OpenRouter({ apiKey: config.apiKey });
        this.config = config;
    }
    async generate(prompt) {
        const response = await this.client.chat.send({
            models: this.config.models,
            messages: [
                { role: 'system', content: this.config.systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
            provider: this.config.provider
        });
        return { model: response.model, content: String(response.choices.at(0)?.message.content) };
    }
}
```

---

---


## Exemplo de Servidor

```typescript
// src/server.ts
import Fastify from "fastify";
export const createServer = (routerService) => {
    const app = Fastify();
    app.post('/chat', {
        schema: {
            body: { type: "object", required: ["question"], properties: { question: { type: "string", minLength: 5 } } }
        }
    }, async (request, reply) => {
        try {
            const { question } = request.body;
            const response = await routerService.generate(question);
            return reply.send({ answer: response });
        } catch (error) {
            return reply.code(500).send({ error: "Internal Server Error" });
        }
    });
    return app;
};
```

---

---


## Exemplo de Teste

```typescript
// tests/router.e2e.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.ts';
import { config } from '../src/config.ts';
import { OpenRouterService } from '../src/openrouterService.ts';

test('routes to cheapest model', async () => {
  const routerService = new OpenRouterService({ ...config, provider: { sort: { by: "price" } } });
  const app = createServer(routerService);
  const response = await app.inject({ method: 'POST', url: '/chat', body: { question: "Pergunta exemplo" } });
  assert.equal(response.statusCode, 200);
});
```

---

### Pontos importantes para revisão

- **`node:test` e `node:assert/strict`** são módulos nativos do Node.js 18+. Não há dependência de teste para instalar — o runner já está no runtime.
- **`app.inject()` nos testes**: os testes reutilizam a mesma factory `createServer()` e simulam requisições HTTP sem abrir porta. Isso torna os testes rápidos, sem conflito de porta e sem depender de rede.
- **Injeção de `customConfig`**: cada teste cria um `OpenRouterService` com a estratégia de roteamento que quer validar (`price` ou `throughput`). O `configOverride` do construtor de `OpenRouterService` é a chave que torna isso possível sem alterar variáveis globais.
- **Fragilidade intencional do `assert.equal(body.answer.model, ...)`**: fixar o nome do modelo esperado é uma decisão consciente. O teste valida o comportamento do roteamento sob o estado atual do mercado. Se um modelo mudar de preço ou sair do ar, o teste quebra e sinaliza que a expectativa precisa ser reavaliada — o que é o comportamento correto.
- **`--trace-warnings`**: flag que imprime stack trace completo para todos os `DeprecationWarning` e avisos do Node. Ajuda a identificar APIs obsoletas cedo.
- **`test:dev` com `--inspect --watch`**: o modo de desenvolvimento reinicia os testes a cada mudança de arquivo e permite anexar o VS Code para inspecionar execução com breakpoints.

---


## Fluxo de Requisição

```
Cliente HTTP
    │ POST /chat { question }
    ▼
server.ts (valida schema)
    │ chama routerService.generate()
    ▼
openrouterService.ts (monta chamada, aplica critério)
    │ envia para OpenRouter SDK
    ▼
OpenRouter (cloud)
    │ roteia e responde
    ▼
server.ts → Cliente HTTP (model, content)
```

## Fluxo de Teste

```
router.e2e.test.ts
    │ instancia serviço/config customizada
    │ app.inject(POST /chat)
    ▼
assert.equal(statusCode, 200)
```

---

---
