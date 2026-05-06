import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from '../src/server.ts';


// Garantir que a variável de ambiente esteja definida
if (!process.env.LANGSMITH_API_KEY) {
    console.warn("\x1b[31mA variável de ambiente LANGSMITH_API_KEY não está definida.\x1b[0m");
}

// test.todo("Testar endpoint /chat");


test('routes to cheapes model by default', async () => {
    const app = createServer();

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
    const responseBody = JSON.parse(response.body);
});
