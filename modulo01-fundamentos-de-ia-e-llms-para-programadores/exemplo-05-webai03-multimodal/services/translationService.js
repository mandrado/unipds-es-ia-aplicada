export class TranslationService {
    constructor() {
        this.translator = null;
        this.languageDetector = null;
        this.availability = 'unavailable';
        this.isActivating = false;
    }

    isTranslatorReadyStatus(status) {
        return status === 'available' || status === 'readily';
    }

    async refreshAvailability() {
        if (!('Translator' in self)) {
            this.availability = 'unavailable';
            return this.availability;
        }

        this.availability = await Translator.availability({
            sourceLanguage: 'en',
            targetLanguage: 'pt'
        });

        return this.availability;
    }

    getState() {
        const isReady = !!this.translator;

        return {
            availability: isReady ? 'available' : this.availability,
            isReady,
            isActivating: this.isActivating,
            requiresUserActivation: !isReady && (this.availability === 'downloadable' || this.availability === 'downloading'),
        };
    }

    async initialize() {
        try {
            // Check Translator availability
            if ('Translator' in self) {
                const availability = await this.refreshAvailability();
                console.log('Translator Availability:', availability);

                // Only create translator if available (not downloadable/downloading)
                if (this.isTranslatorReadyStatus(availability)) {
                    this.translator = await Translator.create({
                        sourceLanguage: 'en',
                        targetLanguage: 'pt'
                    });
                    console.log('Translator initialized');
                } else if (availability === 'downloadable') {
                    console.log('Translator model available for download. It will be initialized on first use.');
                } else if (availability === 'downloading') {
                    console.log('Translator model is downloading. It will be initialized when ready.');
                } else {
                    console.warn('Translator not available:', availability);
                }
            }

            if ('LanguageDetector' in self) {
                this.languageDetector = await LanguageDetector.create();
                console.log('Language Detector initialized');
            }

            return true;
        } catch (error) {
            console.error('Error initializing translation:', error);
            // Don't throw - allow app to continue without translation if it fails
            return false;
        }
    }

    async activateTranslator(onProgress) {
        if (!('Translator' in self)) {
            throw new Error('⚠️ A API de Tradução não está ativa no navegador.');
        }

        if (this.translator) {
            return this.translator;
        }

        this.isActivating = true;

        try {
            const availability = await this.refreshAvailability();

            if (![ 'available', 'readily', 'downloadable', 'downloading' ].includes(availability)) {
                throw new Error('⚠️ O modelo de tradução não está disponível neste navegador.');
            }

            this.translator = await Translator.create({
                sourceLanguage: 'en',
                targetLanguage: 'pt',
                monitor(m) {
                    m.addEventListener('downloadprogress', (e) => {
                        const percent = ((e.loaded / e.total) * 100).toFixed(0);
                        console.log(`Translator downloaded ${percent}%`);

                        if (typeof onProgress === 'function') {
                            onProgress(percent);
                        }
                    });
                }
            });

            this.availability = 'available';
            console.log('Translator initialized by user gesture');
            return this.translator;
        } catch (error) {
            await this.refreshAvailability();

            if (error?.name === 'NotAllowedError') {
                throw new Error('⚠️ O navegador exigiu um clique direto do usuário para ativar a tradução. Tente clicar novamente no botão.');
            }

            throw new Error(`⚠️ Não foi possível ativar a tradução: ${error.message}`);
        } finally {
            this.isActivating = false;
        }
    }

    async translateToPortuguese(text) {
        // If translator not available, try to initialize it now (late-binding with user gesture context)
        if (!this.translator && 'Translator' in self) {
            try {
                const availability = await this.refreshAvailability();
                
                if (this.isTranslatorReadyStatus(availability)) {
                    console.log('Translator is now ready, initializing...');
                    this.translator = await Translator.create({
                        sourceLanguage: 'en',
                        targetLanguage: 'pt'
                    });
                    console.log('Translator initialized on-demand');
                } else if (availability === 'downloadable') {
                    console.log('Translator requires user gesture for download. Use the activation button before translating.');
                    return text;
                } else if (availability === 'downloading') {
                    console.log('Translator still downloading. Finish activation from the button and try again.');
                    return text;
                } else {
                    console.warn('Translator not available:', availability);
                    return text;
                }
            } catch (error) {
                console.warn('Could not initialize Translator on-demand:', error.message);
                return text;
            }
        }
        
        if (!this.translator) {
            console.warn('Translator not available, returning original text');
            return text;
        }

        try {
            // Detect language first
            if (this.languageDetector) {
                const detectionResults = await this.languageDetector.detect(text);
                console.log('Detected languages:', detectionResults);

                // If already in Portuguese, no need to translate
                if (detectionResults && detectionResults[0]?.detectedLanguage === 'pt') {
                    console.log('Text is already in Portuguese');
                    return text;
                }
            }

            // Use streaming translation
            const stream = this.translator.translateStreaming(text);
            let translated = '';
            for await (const chunk of stream) {
                translated = chunk; // Each chunk is the full translation so far
            }
            console.log('Translated text:', translated);
            return translated;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Return original text if translation fails
        }
    }
}
