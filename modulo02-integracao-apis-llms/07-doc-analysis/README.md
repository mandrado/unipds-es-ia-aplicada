# Refs

- A Comprehensive Overview of Large Language Models: https://arxiv.org/pdf/2307.06435
- list of Models to Input Modalities files: https://openrouter.ai/models?fmt=cards&input_modalities=file&max_price=0.1

## Installation

```bash
npm install
npm install @langchain/langgraph@latest @langchain/core@latest
```

## OpenAI Developers Realtime

https://developers.openai.com/api/docs/guides/realtime

## Example CURL:

curl -X POST -F "question=faça um resumo em até 10 linhas desse documento?" -F "file=@a-comprehensive-overview-of-large-language-models.pdf" http://localhost:4000/chat
