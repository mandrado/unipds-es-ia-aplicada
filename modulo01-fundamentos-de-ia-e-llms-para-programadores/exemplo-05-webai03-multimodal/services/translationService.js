export class TranslationService {
    constructor() {
        this.translator = null;
        this.languageDetector = null;
    }

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

    async translateToPortuguese(text) {
        // If translator not available, try to initialize it now (late-binding with user gesture context)
        if (!this.translator && 'Translator' in self) {
            try {
                const availability = await Translator.availability({
                    sourceLanguage: 'en',
                    targetLanguage: 'pt'
                });
                
                if (availability === 'readily') {
                    console.log('Translator is now ready, initializing...');
                    this.translator = await Translator.create({
                        sourceLanguage: 'en',
                        targetLanguage: 'pt'
                    });
                    console.log('Translator initialized on-demand');
                } else if (availability === 'downloadable') {
                    console.log('Translator model available, attempting to initialize with download...');
                    try {
                        this.translator = await Translator.create({
                            sourceLanguage: 'en',
                            targetLanguage: 'pt',
                            monitor(m) {
                                m.addEventListener('downloadprogress', (e) => {
                                    const percent = ((e.loaded / e.total) * 100).toFixed(0);
                                    console.log(`Translator downloaded ${percent}%`);
                                });
                            }
                        });
                        console.log('Translator initialized and downloaded');
                    } catch (downloadError) {
                        console.log('Translator download initiated but will complete in background. Skipping translation for now.');
                        return text;
                    }
                } else if (availability === 'downloading') {
                    console.log('Translator still downloading, skipping translation');
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
