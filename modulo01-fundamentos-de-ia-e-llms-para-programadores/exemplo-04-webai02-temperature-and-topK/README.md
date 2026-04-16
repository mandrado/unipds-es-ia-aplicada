# WebAI02 - Temperature and TopK

## Objetivo
Este exemplo demonstra o uso da Language Model API no navegador com controle de parâmetros de geração (`temperature` e `topK`) via interface web.

## Pré-requisitos
- Node.js instalado
- Google Chrome/Chrome Canary recente
- Flag da Prompt API ativa no Chrome:
  - `chrome://flags/#prompt-api-for-gemini-nano`

## Como iniciar
No diretório do projeto, execute:

```bash
npm ci
npm start
```

Se preferir em um único comando:

```bash
npm ci && npm start
```

## Erro encontrado durante execução
Ao iniciar a aplicação e abrir no navegador, ocorria o erro:

```text
Uncaught (in promise) TypeError: LanguageModel.params is not a function
    at main (index.js:202:40)
```

Também aparecia um aviso de idioma de saída da API, porém esse aviso **não** era a causa da quebra da aplicação.

## Causa raiz (motivo detalhado)
A função `main()` tentava executar `LanguageModel.params()` para obter limites/defaults (`maxTopK`, `defaultTopK`, `maxTemperature`, `defaultTemperature`).

Em alguns ambientes/versões da Language Model API, esse método não está disponível. Quando o código tenta chamá-lo mesmo assim, o JavaScript lança `TypeError` e interrompe a inicialização da página.

Resumo técnico:
- Dependência implícita de um método opcional/não suportado no runtime atual.
- Falta de fallback para valores padrão quando a API não expõe `params()`.
- Resultado: falha em tempo de execução no carregamento inicial.

## Alteração realizada (mínima)
Foi aplicada uma correção mínima em `index.js`:

1. Verifica se `LanguageModel.params` é função.
2. Se for função, mantém o comportamento original e usa `await LanguageModel.params()`.
3. Se não for função, usa fallback local com valores padrão seguros:
   - `defaultTemperature: 1`
   - `defaultTopK: 3`
   - `maxTemperature: 2`
   - `maxTopK: 128`

Trecho da lógica aplicada:

```js
const params = typeof LanguageModel.params === 'function'
    ? await LanguageModel.params()
    : {
        defaultTemperature: 1,
        defaultTopK: 3,
        maxTemperature: 2,
        maxTopK: 128,
    };
```

## Resultado após correção
- A aplicação deixa de quebrar na inicialização.
- Os controles de `temperature` e `topK` continuam sendo preenchidos corretamente.
- O fluxo de perguntas volta a funcionar.

## Observação
O aviso sobre idioma de saída (`No output language was specified...`) pode ser tratado em uma melhoria separada, mas não impede a execução após esta correção.
