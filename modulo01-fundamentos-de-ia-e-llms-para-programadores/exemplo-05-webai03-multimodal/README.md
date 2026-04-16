# WebAI03 - Multimodal

## Objetivo
Este exemplo demonstra o uso de múltiplas APIs de IA no navegador:
- **Language Model API** para processamento de texto e imagem
- **Translator API** para tradução automática de eng para português
- **Language Detection API** para detecção de idioma

## Pré-requisitos
- Node.js instalado
- Google Chrome/Chrome Canary recente
- Flags da Prompt API ativas no Chrome:
  - `chrome://flags/#prompt-api-for-gemini-nano`
  - `chrome://flags/#translation-api`
  - `chrome://flags/#language-detector-api`

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
NotAllowedError: Requires a user gesture when availability is "downloading" or "downloadable".
    at TranslationService.initialize (translationService.js:9:19)
```

Com o stacktrace também mostrando:
```
Translator Availability: downloadable
Error initializing translation: Error: ⚠️ Erro ao inicializar APIs de tradução.
```

## Causa raiz (motivo detalhado)

A classe `TranslationService` tentava criar uma sessão de tradução com `Translator.create()` **sem verificar** se o modelo estava disponível.

Quando a API do Translator está em estado:
- `'readily'` → modelo pronto para usar
- `'downloading'` → modelo em download
- `'downloadable'` → modelo disponível para download

Se você chamar `Translator.create()` nos estados `'downloading'` ou `'downloadable'`, a API lança `NotAllowedError` porque requer um **gesto do usuário** (clique, toque, etc.) para iniciar a operação, não um carregamento automático na inicialização sem interação.

Resumo técnico:
- Falta de verificação de disponibilidade antes de chamar `Translator.create()`.
- Tentativa de inicializar recursos que precisam de user gesture sem interação.
- Falha em tempo de execução durante carregamento inicial.
- Quebra da aplicação inteira porque o erro não era tratado adequadamente.

## Alteração realizada (mínima)

### 1. Em `translationService.js`
Adicionado verificação de disponibilidade antes de criar o Translator:

```js
async initialize() {
    try {
        // Check Translator availability
        if ('Translator' in self) {
            const availability = await Translator.availability({
                sourceLanguage: 'en',
                targetLanguage: 'pt'
            });
            console.log('Translator Availability:', availability);

            // Only create translator if available (not downloadable/downloading)
            if (availability === 'readily') {
                this.translator = await Translator.create({
                    sourceLanguage: 'en',
                    targetLanguage: 'pt'
                });
                console.log('Translator initialized');
            } else if (availability === 'downloadable' || availability === 'downloading') {
                console.log('Translator model is downloading, will be available after download completes');
            } else {
                console.warn('Translator not available:', availability);
            }
        }
        // ... resto do código
        return true;
    } catch (error) {
        // Don't throw - allow app to continue without translation if it fails
        return false;
    }
}
```

**Mudanças:**
- Verifica `Translator.availability()` antes de tentar criar.
- Só cria se status for `'readily'`.
- Trata `'downloading'`/`'downloadable'` como estados temporários e permite continuar.
- Retorna `false` em caso de erro ao invés de lançar exceção.

### 2. Em `index.js`
Alterado o tratamento de erro para não quebrar a aplicação:

```js
// Initialize translation services (non-fatal if it fails)
try {
    const translationInitialized = await translationService.initialize();
    if (!translationInitialized) {
        console.warn('Translation services unavailable, app will work with AI only');
    }
} catch (error) {
    console.error('Error initializing translation:', error);
    console.warn('Translation services unavailable, app will work with AI only');
}
```

**Mudanças:**
- Não interrompe o carregamento se tradução falhar.
- Registra aviso para usuário/desenvolvedor.
- Aplicação continua funcionando com IA mesmo sem tradução inicialmente.

## Resultado após correção
- ✅ A aplicação não quebra mais no carregamento.
- ✅ Language Model continua funcionando normalmente.
- ✅ Se Translator estiver em download, a app fica disponível sem tradução.
- ✅ Quando o Translator ficar pronto, pode ser inicializado via user gesture (clique numa ação de tradução, por exemplo).
- ✅ Mensagens de log informam o estado das APIs.

## Próximos passos (opcional)
Se desejar implementar download do Translator com user gesture, adicione um botão "Baixar e Ativar Tradução" que permite ao usuário iniciar o download quando estiver em estado `'downloadable'`.
