// Garantir que a variável de ambiente esteja definida
if (!process.env.OPENROUTER_API_KEY) {
    console.warn("\x1b[31mA variável de ambiente OPENROUTER_API_KEY não está definida.\x1b[0m");
}

export type ModelConfig = {
    apiKey: string;
    httpReferer: string;
    xTitle: string;
    port: number;
    models: string[];
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;

    provider: {
        sort: {
            by: string,
            partition: string,
        }
    }

};

export const config: ModelConfig = {
    apiKey: process.env.OPENROUTER_API_KEY!,
    httpReferer: "http://localhost",
    xTitle: "Smart Model Router Gateway",
    port: 3000,
    models: [
        // 'models' array must have 3 items or fewer.
        'openai/gpt-oss-120b:free',
        'liquid/lfm-2.5-1.2b-instruct:free',
        //'google/gemma-4-26b-a4b-it:free',
        'tencent/hy3-preview:free',
    ], // definir aqui os modelos de llms que vamos usar.
    temperature: 0.2,
    maxTokens: 100,
    systemPrompt: "You are a helpful assistant.",
    provider: {
        // docs: https://openrouter.ai/docs/guides/routing/provider-selection#provider-sorting
        sort: {
            by: "price", // The sorting strategy: "price", "throughput", or "latency".
            //by: "latency",
            //by: "throughput",
            partition: "none", // How to group endpoints for sorting: "model" (default) or "none".
        }
    }
};

