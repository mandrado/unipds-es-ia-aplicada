export class FormController {
    constructor(aiService, translationService, view) {
        this.aiService = aiService;
        this.translationService = translationService;
        this.view = view;
        this.isGenerating = false;
    }

    setupEventListeners() {
        // Update display values for range inputs
        this.view.onTemperatureChange((e) => {
            this.view.updateTemperatureDisplay(e.target.value);
        });

        this.view.onTopKChange((e) => {
            this.view.updateTopKDisplay(e.target.value);
        });

        // File input handlers
        this.view.onFileChange((event) => {
            this.view.handleFilePreview(event);
        });

        this.view.onFileButtonClick(() => {
            this.view.triggerFileInput();
        });

        this.view.onTranslationButtonClick(async () => {
            await this.handleTranslationActivation();
        });

        // Form submit handler
        this.view.onFormSubmit(async (event) => {
            event.preventDefault();

            if (this.isGenerating) {
                this.stopGeneration();
                return;
            }

            await this.handleSubmit();
        });

        this.syncTranslationControls();
    }

    async handleSubmit() {
        const question = this.view.getQuestionText();

        if (!question.trim()) {
            return;
        }

        // Get parameters from form
        const temperature = this.view.getTemperature();
        const topK = this.view.getTopK();
        const file = this.view.getFile();

        console.log('Using parameters:', { temperature, topK });

        // Change button to stop mode
        this.toggleButton(true);

        this.view.setOutput('Processing your question...');

        try {
            const aiResponseChunks = await this.aiService.createSession(
                question,
                temperature,
                topK,
                file
            );

            this.view.setOutput('');

            let fullResponse = '';
            for await (const chunk of aiResponseChunks) {
                if (this.aiService.isAborted()) {
                    break;
                }
                console.log('Received chunk:', chunk);
                fullResponse += chunk;
                this.view.setOutput(fullResponse);
            }

            // Translate the full response to Portuguese
            if (fullResponse && !this.aiService.isAborted()) {
                this.view.setOutput('Traduzindo resposta...');
                const translatedResponse = await this.translationService.translateToPortuguese(fullResponse);
                this.view.setOutput(translatedResponse);
                this.syncTranslationControls();
            }
        } catch (error) {
            console.error('Error during AI generation:', error);
            this.view.setOutput(`Erro: ${error.message}`);
        }

        this.toggleButton(false);
    }

    stopGeneration() {
        this.aiService.abort();
        this.toggleButton(false);
    }

    toggleButton(isGenerating) {
        this.isGenerating = isGenerating;

        if (isGenerating) {
            this.view.setButtonToStopMode();
        } else {
            this.view.setButtonToSendMode();
        }
    }

    syncTranslationControls() {
        const translationState = this.translationService.getState();

        if (translationState.isReady) {
            this.view.setTranslationControlsVisible(true);
            this.view.setTranslationButtonState({
                disabled: true,
                text: 'Tradução ativada',
            });
            this.view.setTranslationStatus('O tradutor está pronto para uso.', 'success');
            return;
        }

        if (translationState.requiresUserActivation) {
            this.view.setTranslationControlsVisible(true);
            this.view.setTranslationButtonState({
                disabled: translationState.isActivating,
                text: translationState.isActivating ? 'Ativando Tradução...' : 'Baixar e Ativar Tradução',
            });

            const message = translationState.availability === 'downloading'
                ? 'O modelo de tradução está em download. Clique para concluir e ativar quando permitido.'
                : 'A tradução precisa de um clique seu para iniciar o download e ativar o recurso.';

            this.view.setTranslationStatus(message);
            return;
        }

        this.view.setTranslationControlsVisible(false);
        this.view.setTranslationStatus('');
    }

    async handleTranslationActivation() {
        this.syncTranslationControls();
        this.view.setTranslationStatus('Iniciando download do tradutor...', '');

        try {
            await this.translationService.activateTranslator((percent) => {
                this.view.setTranslationStatus(`Baixando modelo de tradução... ${percent}%`);
            });
            this.syncTranslationControls();
            this.view.setTranslationStatus('Tradução ativada com sucesso.', 'success');
        } catch (error) {
            console.error('Error activating translation:', error);
            this.syncTranslationControls();
            this.view.setTranslationStatus(error.message, 'error');
        }
    }
}
