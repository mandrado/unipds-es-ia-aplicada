# Smart Model Router Gateway

> **Módulo 02 — Integração de APIs com LLMs**
> Engenharia de Software com IA Aplicada
> Anotações de aula para revisão futura.

---

## Objetivo do Projeto

Construir um **gateway inteligente** capaz de receber perguntas via HTTP e rotear as requisições entre múltiplos modelos de LLM. A ideia é abstrair a escolha do modelo — o gateway decide qual modelo usar com base em critérios como custo, latência ou tipo de tarefa.

---

## Iteração 1 — Scaffolding e ambiente

**Data:** 28/04/2026

### O que fizemos

Configuração do ambiente Node.js 24 com TypeScript nativo e inicialização do projeto com Fastify.

#### Configurar nvm e Node.js 24

```powershell
nvm install 24
nvm use 24
node -v   # v24.x.x
```

#### Inicializar o projeto

```powershell
mkdir 01-smart-model-router-gateway
cd 01-smart-model-router-gateway
npm init -y
npm install fastify@5.7.4 @types/node@24
```

#### Estrutura de arquivos criada

```
01-smart-model-router-gateway/
├── src/
│   ├── index.ts      ← ponto de entrada, sobe o servidor
│   └── server.ts     ← factory function que configura o Fastify
├── package.json
└── README.md
```

#### Script de desenvolvimento

```json
"scripts": {
  "dev": "node --inspect --watch src/index.ts"
}
```

### Pontos importantes para revisão

- **Node.js 24 roda TypeScript nativamente** via "type stripping" — o runtime remove as anotações de tipo em tempo de execução, sem necessidade de `tsc` ou `ts-node`. Isso simplifica o setup de projetos modernos.
- **`--watch`** reinicia o processo automaticamente ao detectar mudanças nos arquivos. Substitui o `nodemon` para projetos Node.js 24+.
- **`--inspect`** habilita o protocolo de depuração do V8. É possível conectar o VS Code ou o Chrome DevTools ao processo em execução.
- **`"type": "module"`** no `package.json` faz o Node.js tratar todos os arquivos `.js` e `.ts` como ES Modules — obrigatório para usar `import`/`export` sem extensão `.cjs`.

---

## Iteração 2 — Primeiro endpoint e separação de responsabilidades

**Data:** 28/04/2026

### O que fizemos

Criação da factory function `createServer()` em `server.ts` com o primeiro endpoint `POST /chat`, e o ponto de entrada `index.ts` que instancia e sobe o servidor.

```typescript
// src/server.ts
import Fastify from "fastify";

export const createServer = () => {
    const app = Fastify({ logger: false });

    app.post('/chat', {
        schema: {
            body: {
                type: "object",
                required: ["question"],
                properties: {
                    question: { type: "string", minLength: 5 },
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { question } = request.body as { question: string };
            return reply.send({ answer: `The question was: ${question}` });
        } catch (error) {
            console.error("Error handling /chat request:", error);
            return reply.code(500).send({ error: "Internal Server Error" });
        }
    });

    return app;
};
```

```typescript
// src/index.ts
import { createServer } from "./server.ts";

const app = createServer();
await app.listen({ port: 3000, host: '0.0.0.0' });
console.log("Server is running on http://localhost:3000");
```

### Validação com `app.inject()`

O Fastify fornece `app.inject()` para testar rotas **sem abrir uma conexão HTTP real**. Útil para smoke tests no próprio `index.ts` durante o desenvolvimento:

```typescript
app.inject({
    method: 'POST',
    url: '/chat',
    body: { question: "What is the capital of France?" }
}).then(response => {
    console.log("Status:", response.statusCode);
    console.log("Body:", response.body);
});
```

### Pontos importantes para revisão

- **Factory function** (`createServer`) isola a criação e configuração do servidor da sua inicialização. Facilita testes unitários (instanciar sem chamar `listen`) e reuso em múltiplos contextos.
- **Separação `server.ts` / `index.ts`**: `server.ts` é responsável pela configuração (rotas, plugins, schemas). `index.ts` é responsável pelo boot (listen, env vars, graceful shutdown). Esse padrão é amplamente usado em projetos Fastify.
- **JSON Schema no Fastify**: o campo `schema.body` valida e serializa o corpo da requisição automaticamente. Se a validação falhar, o Fastify retorna `400 Bad Request` antes mesmo de chegar no handler — sem código extra.
- **`minLength: 5`** na propriedade `question` garante que perguntas muito curtas sejam rejeitadas na borda do sistema.
- **`host: '0.0.0.0'`** faz o servidor escutar em todas as interfaces de rede, necessário quando o serviço roda em container ou VM (não apenas `localhost`).

---

## Stack

| Tecnologia | Versão | Papel |
|---|---|---|
| Node.js | 24.x | Runtime com TypeScript nativo |
| Fastify | 5.7.4 | Framework HTTP de alta performance |
| `@types/node` | ^24 | Tipos TypeScript para Node.js |

---

## Próximos passos

- [ ] Integrar o primeiro provider de LLM (ex: OpenAI, Ollama, OpenRouter)
- [ ] Implementar a lógica de roteamento inteligente entre modelos
- [ ] Adicionar variáveis de ambiente (API keys) via `.env`
- [ ] Criar testes automatizados usando `app.inject()`


## Criar a conexão com o https://openrouter.ai/

### Vistia ao modelos em https://openrouter.ai/models,
Filtre pelo preço do prompt. A página lista diversos modelos de IA oferecidos pelo OpenRouter, organizados por categorias como: Texto, Imagem, Áudio, Vídeo, Embeddings, Rerank, Speech, Transcrição. Cada modelo inclui informações como contexto máximo, preço por milhão de tokens, data de lançamento e capacidades multimodais.
  
### visita as atividades em https://openrouter.ai/activity, 
A página permite a visualizar o uso dos modelos utilizados através do OpenRouter.

### Visita ao chat em https://openrouter.ai/chat, 
A página funciona como um playground de modelos de IA, permitindo comparar diferentes modelos lado a lado e testar suas capacidades em vários desafios. 

### visita ao ranking em https://openrouter.ai/rankings, com as seguintes informações:

1. Ranking de Modelos (Trending). A página mostra os modelos de IA mais usados recentemente na plataforma OpenRouter, com base em volume de tokens consumidos.
2. Market Share por Autor, mostra a participação de mercado (em tokens) dos principais desenvolvedores
3. Categorias de Comparação, apágina permite comparar modelos por: Uso geral, Linguagens naturais, Linguagens de  programação, Comprimento de contexto, Uso de ferramentas, Processamento de imagens.
4. Apps & Agents mais populares, Ranking dos aplicativos/agentes que mais consomem tokens.
5. Estrutura geral da plataforma, a página também destaca: Diretório de apps e agentes, Estatísticas de uso, Links para documentação, API, SDK e suporte.
