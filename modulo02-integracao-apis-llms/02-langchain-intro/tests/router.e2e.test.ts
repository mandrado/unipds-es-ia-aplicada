import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from '../src/server.ts';


// Garantir que a variável de ambiente esteja definida
if (!process.env.LANGSMITH_API_KEY) {
    console.warn("\x1b[31mA variável de ambiente LANGSMITH_API_KEY não está definida.\x1b[0m");
}

// Teste para verificar se o endpoint /chat está funcionando corretamente
test('command upper transform message into UPPERCASE', async () => {
    const app = createServer();

    const msg = "make this message UPPERCASE please!";
    const expected = msg.toUpperCase();

    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body: {
            question: msg
        }
    })
    assert.equal(response.statusCode, 200);
    assert.equal(response.body, expected);
});

test('command lower transform message into LOWERCASE', async () => {
    const app = createServer();

    const msg = "MAKE THIS MESSAGE LOWERCASE PLEASE!";
    const expected = msg.toLowerCase();

    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body: {
            question: msg
        }
    })
    assert.equal(response.statusCode, 200);
    assert.equal(response.body, expected);
});

test('command unknown transform message into UNKNOWN', async () => {
    const app = createServer();

    const msg = 'HEY THERE!'
    const expected = "Unknown command. Try 'make this uppercase' or 'convert to lowercase'"

    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body: {
            question: msg
        }
    })
    assert.equal(response.statusCode, 200);
    assert.equal(response.body, expected);
});
