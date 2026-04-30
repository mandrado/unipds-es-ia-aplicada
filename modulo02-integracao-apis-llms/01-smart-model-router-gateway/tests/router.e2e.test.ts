import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.ts';
import { config } from '../src/config.ts';
import { OpenRouter } from '@openrouter/sdk';
import { type LLMResponse, OpenRouterService } from '../src/openrouterService.ts';

// Garantir que a variável de ambiente esteja definida
if (!process.env.OPENROUTER_API_KEY) {
    console.warn("\x1b[31mA variável de ambiente OPENROUTER_API_KEY não está definida.\x1b[0m");
}

// test.todo("Testar endpoint /chat");


test('routes to cheapes model by default', async () => {
    const customConfig = {
        ...config,
        provider: {
            ...config.provider,
            sort: {
                ...config.provider.sort,
                by: "price"
            }
        }
    };

    const routerService = new OpenRouterService(customConfig);
    const app = createServer(routerService);

    // copiado do index.ts pois aqui é o local onde o servidor é criado e onde podemos usar 
    // o app.inject para testar os endpoints
    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body: {
            question: "What is rate limiting for LLMs? answer in one phrase"
        }
    })
    assert.equal(response.statusCode, 200);
    const body = response.json() as { answer: LLMResponse }

    console.log(body);

    assert.equal(body.answer.model, "openai/gpt-oss-120b:free");
});

test('routes to highest throughput model by default', async () => {
    const customConfig = {
        ...config,
        provider: {
            ...config.provider,
            sort: {
                ...config.provider.sort,
                by: "throughput"
            }
        }
    };

    const routerService = new OpenRouterService(customConfig);
    const app = createServer(routerService);

    // copiado do index.ts pois aqui é o local onde o servidor é criado e onde podemos usar 
    // o app.inject para testar os endpoints
    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body: {
            question: "What is rate limiting for LLMs? answer in one phrase"
        }
    })
    assert.equal(response.statusCode, 200);
    const body = response.json() as { answer: LLMResponse }

    console.log(body);

    assert.equal(body.answer.model, "liquid/lfm-2.5-1.2b-instruct-20260120:free");
});
