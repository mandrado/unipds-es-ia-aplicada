export class AIService {
    // List of supported output languages by the Language Model API
    static SUPPORTED_LANGUAGES = ['en', 'es', 'ja'];
    static DEFAULT_LANGUAGE = 'en';
    
    // Language preference to safe API language mapping
    static LANGUAGE_MAP = {
        'pt': 'en',    // Portuguese -> use English for API, reinforce PT in prompt
        'pt-br': 'pt', // Brazilian Portuguese
        'pt-pt': 'pt', // European Portuguese
    };

    constructor() {
        this.session = null;
        this.abortController = null;
        this.detectLanguages();
    }

    /**
     * Detects user's preferred language and maps to safe API language.
     * - preferredLanguage: what the user wants (may include unsupported languages like 'pt')
     * - outputLanguage: what to send to API (must be from SUPPORTED_LANGUAGES)
     * - Uses system prompt to reinforce unsupported language preferences
     */
    detectLanguages() {
        // Get user's browser language preference, normalize to base language
        let userLang = navigator.language?.split('-')[0] || AIService.DEFAULT_LANGUAGE;
        
        // Store the preferred language (user's actual choice)
        this.preferredLanguage = userLang;
        
        // Map to safe API language, or use default if not in supported list
        if (AIService.SUPPORTED_LANGUAGES.includes(userLang)) {
            this.outputLanguage = userLang;
            console.log(`Detected supported language: ${userLang}`);
        } else {
            // Unsupported language: use English for API, reinforce preference in prompt
            this.outputLanguage = AIService.DEFAULT_LANGUAGE;
            console.log(`Detected language '${userLang}' not directly supported by Language Model API.`);
            console.log(`Supported: ${AIService.SUPPORTED_LANGUAGES.join(', ')}. Using API language: ${AIService.DEFAULT_LANGUAGE}, reinforcing '${userLang}' in system prompt.`);
        }
    }

    /**
     * Gets system prompt with language reinforcement if preferred language differs from API language
     */
    getSystemPrompt() {
        let prompt = `You are an AI assistant that responds clearly and objectively.
                        Always respond in plain text format instead of markdown.`;
        
        // If preferred language is different from API output language, reinforce it
        if (this.preferredLanguage !== this.outputLanguage) {
            const languageNames = {
                'pt': 'Portuguese',
                'en': 'English',
                'es': 'Spanish',
                'ja': 'Japanese',
            };
            prompt += `\n\nIMPORTANT: Respond in ${languageNames[this.preferredLanguage] || this.preferredLanguage}.`;
        }
        
        return prompt;
    }

    async checkRequirements() {
        const errors = [];

        // @ts-ignore
        const isChrome = !!window.chrome;
        if (!isChrome) {
            errors.push("⚠️ Este recurso só funciona no Google Chrome ou Chrome Canary (versão recente).");
        }

        if (!('LanguageModel' in self)) {
            errors.push("⚠️ As APIs nativas de IA não estão ativas.");
            errors.push("Ative a seguinte flag em chrome://flags/:");
            errors.push("- Prompt API for Gemini Nano (chrome://flags/#prompt-api-for-gemini-nano)");
            errors.push("Depois reinicie o Chrome e tente novamente.");
            return errors;
        }

        // Check Translator availability
        if ('Translator' in self) {
            const translatorAvailability = await Translator.availability({
                sourceLanguage: 'en',
                targetLanguage: 'pt'
            });
            console.log('Translator Availability:', translatorAvailability);

            if (translatorAvailability === 'no') {
                errors.push("⚠️ Tradução de inglês para português não está disponível.");
            }
        } else {
            errors.push("⚠️ A API de Tradução não está ativa.");
            errors.push("Ative a seguinte flag em chrome://flags/:");
            errors.push("- Translation API (chrome://flags/#translation-api)");
        }

        // Check Language Detection API
        if (!('LanguageDetector' in self)) {
            errors.push("⚠️ A API de Detecção de Idioma não está ativa.");
            errors.push("Ative a seguinte flag em chrome://flags/:");
            errors.push("- Language Detection API (chrome://flags/#language-detector-api)");
        }

        if (errors.length > 0) {
            return errors;
        }

        const availability = await LanguageModel.availability({ 
            languages: [this.outputLanguage],
            outputLanguage: this.outputLanguage
        });
        console.log('Language Model Availability:', availability);

        if (availability === 'available') {
            return null;
        }

        if (availability === 'unavailable') {
            errors.push(`⚠️ O seu dispositivo não suporta modelos de linguagem nativos de IA.`);
        }

        if (availability === 'downloading') {
            errors.push(`⚠️ O modelo de linguagem de IA está sendo baixado. Por favor, aguarde alguns minutos e tente novamente.`);
        }

        if (availability === 'downloadable') {
            errors.push(`⚠️ O modelo de linguagem de IA precisa ser baixado, baixando agora... (acompanhe o progresso no terminal do chrome)`);
            try {
                const session = await LanguageModel.create({
                    expectedInputLanguages: [this.outputLanguage],
                    outputLanguage: this.outputLanguage,
                    monitor(m) {
                        m.addEventListener('downloadprogress', (e) => {
                            const percent = ((e.loaded / e.total) * 100).toFixed(0);
                            console.log(`Downloaded ${percent}%`);
                        });
                    }
                });
                await session.prompt('Hello');
                session.destroy();

                // Re-check availability after download
                const newAvailability = await LanguageModel.availability({ 
                    languages: [this.outputLanguage],
                    outputLanguage: this.outputLanguage
                });
                if (newAvailability === 'available') {
                    return null; // Download successful
                }
            } catch (error) {
                console.error('Error downloading model:', error);
                errors.push(`⚠️ Erro ao baixar o modelo: ${error.message}`);
            }
        }

        return errors.length > 0 ? errors : null;
    }

    async getParams() {
        const params = typeof LanguageModel.params === 'function'
            ? await LanguageModel.params()
            : {
                defaultTemperature: 1,
                defaultTopK: 3,
                maxTemperature: 2,
                maxTopK: 128,
            };
        console.log('Language Model Params:', params);
        return params;
    }

    async* createSession(question, temperature, topK, file = null) {
        this.abortController?.abort();
        this.abortController = new AbortController();

        // Destroy previous session and create new one with updated parameters
        if (this.session) {
            this.session.destroy();
        }

        this.session = await LanguageModel.create({

            expectedLanguage: this.outputLanguage,

            expectedInputs: [
                { type: "text", languages: [this.outputLanguage] },
                { type: "audio" },
                { type: "image" },
            ],
            expectedOutputs: [{ type: "text", languages: [this.outputLanguage] }],
            outputLanguage: this.outputLanguage,
            temperature: temperature,
            topK: topK,
            initialPrompts: [
                {
                    role: 'system',
                    content: [{
                        type: "text",
                        value: this.getSystemPrompt()
                    }]
                },
            ],
        });

        // Build content array with text and optional file
        const contentArray = [{ type: "text", value: question }];

        if (file) {
            const fileType = file.type.split('/')[0];
            if (fileType === 'image' || fileType === 'audio') {
                // Convert file to blob for proper handling
                const blob = new Blob([await file.arrayBuffer()], { type: file.type });
                contentArray.push({ type: fileType, value: blob });
                console.log(`Adding ${fileType} to prompt:`, file.name);
            }
        }

        const responseStream = await this.session.promptStreaming(
            [
                {
                    role: 'user',
                    content: contentArray,
                },
            ],
            {
                signal: this.abortController.signal,
            }
        );

        for await (const chunk of responseStream) {
            if (this.abortController.signal.aborted) {
                break;
            }
            yield chunk;
        }
    }

    abort() {
        this.abortController?.abort();
    }

    isAborted() {
        return this.abortController?.signal.aborted;
    }
}
