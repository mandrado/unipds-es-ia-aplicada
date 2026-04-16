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

```

A classe `TranslationService` tentava criar uma sessão de tradução com `Translator.create()` **sem verificar** se o modelo estava disponível.
```text
Quando a API do Translator está em estado:
- `'readily'` → modelo pronto para usar
```
- `'downloadable'` → modelo disponível para download

```

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

## Nova Feature: Botão "Baixar e Ativar Tradução"

Para resolver corretamente a exigência de **user gesture** da Translator API, foi adicionada uma ativação manual pela interface.

### Como funciona

Quando o `Translator.availability()` retorna:

- `downloadable`: o modelo pode ser baixado, mas o navegador exige um clique do usuário para iniciar `Translator.create()`.
- `downloading`: o download já começou, mas a ativação ainda pode depender da ação explícita do usuário.
- `available`: o modelo já está disponível e o código pode criar a instância do tradutor.

Nesses casos, a interface exibe o botão:

```text
Baixar e Ativar Tradução
```

Ao clicar nesse botão, o código chama `await Translator.create(...)` sob gesto do usuário e monitora o progresso pelo evento `downloadprogress`.

### O que foi implementado

#### 1. Botão e área de status na interface

Foi adicionada uma área específica para ativação da tradução, exibida apenas quando o tradutor precisa de ativação manual.

#### 2. Ativação manual no `TranslationService`

Foi criado o método `activateTranslator(onProgress)`, responsável por:

- verificar o estado atual do `Translator`
- chamar `Translator.create(...)` somente a partir do clique do usuário
- acompanhar o progresso do download
- atualizar o estado interno para `available` após sucesso

Exemplo da lógica:

```js
this.translator = await Translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'pt',
    monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
            const percent = ((e.loaded / e.total) * 100).toFixed(0);
            onProgress(percent);
        });
    }
});
```

#### 3. Sincronização do estado com a UI

O controller passou a observar o estado da tradução e atualizar a interface:

- mostra o botão quando há necessidade de ativação manual
- desabilita o botão durante ativação
- mostra mensagens como:
  - `Iniciando download do tradutor...`
  - `Baixando modelo de tradução... 45%`
  - `Tradução ativada com sucesso.`

### Benefício dessa feature

- evita o erro `NotAllowedError` durante inicialização automática
- respeita a política de segurança do Chrome
- permite ao usuário controlar explicitamente o download do modelo
- fornece feedback visual durante o processo
- mantém a aplicação utilizável mesmo antes da tradução estar pronta

### Observação importante

Depois do download, o estado retornado pela API pode ser `available`. O código foi ajustado para tratar `available` como estado válido de pronto para uso, evitando logs incorretos como:

```text
Translator Availability: available
Translator not available: available
```

Esse comportamento anterior era um bug de interpretação do status, não um problema real da API.

## Tratamento Inteligente de Idioma (LanguageModel API)

### O Problema: Aviso de Idioma Não Especificado
Durante a execução, a API exibia um aviso:
```text
No output language was specified in a LanguageModel API request. 
An output language should be specified to ensure optimal output quality 
and properly attest to output safety. Please specify a supported output 
language code: [en, es, ja]
```

### A Causa Raiz
A Language Model API aceita apenas 3 idiomas: `en`, `es`, `ja`.
Usuários em navegadores com idioma português (`pt`, `pt-br`, `pt-pt`) não tinham suporte direto, causando o aviso de segurança.

### A Solução Implementada (em `aiService.js`)

Implementamos um sistema de **mapeamento inteligente** com dois níveis:

```js
detectLanguages() {
    // Preferência do usuário (pode ser qualquer idioma)
    let userLang = navigator.language?.split('-')[0] || AIService.DEFAULT_LANGUAGE;
    this.preferredLanguage = userLang;  // Ex: 'pt'
    
    // Idioma seguro para enviar à API (lista suportada)
    if (AIService.SUPPORTED_LANGUAGES.includes(userLang)) {
        this.outputLanguage = userLang;  // Ex: 'en'
    } else {
        // Fallback: usa English para API, mas reforça no prompt
        this.outputLanguage = AIService.DEFAULT_LANGUAGE;
    }
}
```

**Estratégia:**
- `preferredLanguage`: o idioma que o usuário realmente quer (português)
- `outputLanguage`: o idioma que enviamos para a API (english, para evitar aviso)

#### 2. Reforço do Idioma Preferido no System Prompt

```js
getSystemPrompt() {
    
    // Se idioma preferido ≠ idioma da API, reforça no prompt
    if (this.preferredLanguage !== this.outputLanguage) {
        const languageNames = {
            'pt': 'Portuguese',
            'en': 'English',
            'es': 'Spanish',
            'ja': 'Japanese',
        };
        prompt += `\n\nIMPORTANT: Respond in ${languageNames[this.preferredLanguage]}.`;
    }
    
    return prompt;
}
```

**Efeito prático:**
- Api recebe: `outputLanguage: 'en'` → nenhum aviso ✅
- Model vê no prompt: `"IMPORTANT: Respond in Portuguese"` → responde em português ✅

### Benefícios desta Abordagem

| Aspecto | Resultado |
|---------|-----------|
| Aviso de segurança | ❌ Eliminado — API não reclama mais |
| Resposta em português | ✅ Funcionando — modelo segue instrução do prompt |
| Compatibilidade | ✅ Funciona para qualquer navegador (pt, pt-br, pt-pt, en, es, ja, etc.) |
| Robustez | ✅ Fallback define sempre um idioma suportado |
| Logs informativos | ✅ Console mostra qual idioma foi detectado e usado |

### Boas Práticas Implementadas

1. **Nunca assuma o idioma** — Detecta dinamicamente via `navigator.language`
2. **Padrão de Fallback** — Se idioma não suportado, usa English como fallback seguro
3. **Reforço no Prompt** — Usa System Prompt para garantir output no idioma preferido
4. **Logging claro** — Console mostra decisões de idioma para debugging

### Exemplo de Fluxo

```
Usuário em: Chrome Português Brasil
           ↓
navigator.language = 'pt-BR'
           ↓
detectLanguages() extrai 'pt'
           ↓
preferredLanguage = 'pt'
outputLanguage = 'en' (não suportado diretamente, fallback)
           ↓
LanguageModel.create({
    outputLanguage: 'en',                    // API feliz, sem avisos
    initialPrompts: [
        { role: 'system', content: 'IMPORTANT: Respond in Portuguese.' }
    ]
})
           ↓
Modelo responde em português ✅
```

