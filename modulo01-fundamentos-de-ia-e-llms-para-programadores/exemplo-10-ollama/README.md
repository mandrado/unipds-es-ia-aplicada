# Como rodar modelos localmente com Ollama

Neste capítulo, compartilho minha experiência com o Ollama, uma ferramenta acessível e poderosa para baixar, gerenciar e executar modelos de linguagem localmente, sem necessidade de conexão com servidores externos. Ao longo do capítulo, explico o funcionamento da ferramenta, suas possibilidades, seus desafios e a prática de uso com foco em programadores interessados em IA.

## O que é o Ollama?

O Ollama é uma aplicação compatível com macOS, Windows e Linux, com uma interface simples e uma API HTTP que permite integrações com diferentes aplicativos. Criado sobre o ecossistema da Meta e dos modelos LLaMA, o Ollama ganhou destaque a partir de julho de 2023. Seu grande diferencial está na facilidade de uso: com comandos simples como `ollama pull` e `ollama serve`, é possível baixar e executar modelos localmente.

O Ollama possui um catálogo amplo de modelos, incluindo modelos gerais, de código e multimodais, que aceitam entradas combinadas de texto e imagem.

### Benefícios do Ollama

- Execução local e offline: ideal para automações, scripts, testes e estudos.
- Gratuito: não exige pagamento por tokens.
- Compatibilidade com vários modelos: LLaMA, GPT OSS, Gemma, entre outros.
- Interface amigável e integrável ao terminal: permite integração com curl, scripts shell, editores e servidores MCP.

### Limitações

Apesar das vantagens, o Ollama não é indicado para uso em produção. Ele executa apenas um prompt por vez, demanda muitos recursos da máquina local e não oferece alta concorrência. Em ambientes com necessidade de escalabilidade e baixa latência, ferramentas como VLLM são mais apropriadas.

## Parâmetros, contexto e quantização

Para entender o comportamento dos modelos, considere três conceitos importantes:

- Parâmetros: representam os pesos do modelo, ou seja, o que ele aprendeu. Mais parâmetros geralmente indicam maior capacidade, mas também maior exigência computacional. Exemplos: modelos 20B (bilhões de parâmetros) e 120B.
- Tamanho de contexto: define quantos tokens (palavras, frases e comandos) podem ser processados por vez. Por exemplo, 32k, 128k ou até 1M tokens.
- Quantização: processo de reduzir o tamanho do modelo, substituindo a representação numérica dos pesos. Modelos quantizados usam menos memória e rodam mais rápido, com leve perda de qualidade.

Sufixos como `Q4F32__1` indicam os esquemas de quantização aplicados (ex.: pesos em 4 bits e ativações em 32 bits). Isso permite rodar modelos de 20B com apenas 16 GB de RAM.

### Experimentação com curl e interface HTTP

É simples criar scripts que utilizam o Ollama via terminal. Com a API HTTP, podemos fazer requisições curl para enviar prompts e receber respostas em JSON. Isso permite integração com qualquer sistema, inclusive para automação local.

A execução pode usar endpoints compatíveis com a API da OpenAI, o que facilita portar aplicações existentes para o Ollama.

### Modelos com ou sem censura

Há diferença entre modelos censurados e modelos "sem censura". Enquanto alguns modelos limitam respostas sobre temas sensíveis, outros não impõem filtros. Isso pode ser útil em ambientes de pesquisa ou estudo, mas exige responsabilidade, especialmente em aplicações de uso geral.

### Integração com Jan AI

O Jan AI é uma aplicação desktop open source que permite usar modelos locais com funcionalidades semelhantes ao ChatGPT, incluindo assistentes, histórico, banco vetorial, file system e integração com MCPs.

O Jan AI suporta modelos de várias fontes (OpenRouter, Hugging Face, Ollama etc.) e permite configurar o MCP localmente, viabilizando interação com arquivos do sistema, navegação web e uso em projetos pessoais.

### Jan AI no editor de código

Também é possível integrar o Jan AI ao editor de código para usar modelos locais em tarefas como geração de código, refatoração e revisão. Basta adicionar o provedor Ollama e selecionar o modelo desejado. Assim, mesmo modelos pequenos podem ajudar no dia a dia sem custo adicional.

## Passos iniciais com Ollama

Download e instalação:

- Ollama: https://www.ollama.com/download

Após instalar, abra o terminal e verifique a versão:

```pwsh
$ ollama -v
ollama version is 0.21.0
```

Iniciar o servidor local do Ollama (no meu teste, o Ollama já estava rodando):

```pwsh
$ ollama serve
Ollama server is running on http://localhost:11434
```

### Verificar os modelos instalados

Use o comando `ollama list` ou `ollama ls`.

```pwsh
$ ollama list
NAME            TYPE        SIZE
```

Na primeira execução, não haverá modelos instalados.

### Baixar um modelo e rodar um teste

Atenção: modelos podem ser muito grandes. Neste exemplo, o download é de 1,3 GB, mas há versões maiores, como `llama4:latest` com 67 GB e `llama4:128x17b` com 245 GB.

```pwsh
$ ollama pull llama3.2:1b
```

Após baixar o modelo, podemos testar com um prompt simples:

```pwsh
ollama run llama3.2:1b
```

Nota: para listar as tags da API, na primeira vez pode ser necessário aceitar o risco de execução do script.

```pwsh
curl http://localhost:11434/api/tags
```

Listar apenas os modelos:

```pwsh
(Invoke-RestMethod -Uri "http://localhost:11434/api/tags").models.name
```

Ou usar o próprio comando Ollama:

```pwsh
ollama list | Select-Object -Skip 1 | ForEach-Object { ($_ -split '\s+')[0] }
gpt-oss:20b
llama3.2:1b
llama2-uncensored:7b
```

## Scripts de exemplo

Este diretório possui duas versões do mesmo fluxo de teste da API HTTP do Ollama:

- `request.sh`: versão para Linux/macOS e também para Git Bash no Windows.
- `request.ps1`: versão para PowerShell no Windows.

Comparação rápida entre os dois arquivos:

- Ambos executam os mesmos passos: listar modelos, baixar modelos e testar os endpoints `/v1/chat/completions` e `/api/generate`.
- Ambos usam `curl` e `jq` para enviar requisições e formatar a saída JSON.
- A principal diferença está na sintaxe do script.
- Em `request.sh`, a continuação de linha é feita com `\` (padrão shell).
- Em `request.ps1`, a continuação é feita com crase `` ` `` (padrão PowerShell).
- O `request.ps1` inclui comentários explicativos adicionais para facilitar o uso no Windows.

### Executar no Linux/macOS ou Git Bash

```bash
chmod +x request.sh
./request.sh
```

### Executar no Windows (PowerShell)

```pwsh
./request.ps1
```

Se o PowerShell bloquear a execução local do script, use:

```pwsh
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
./request.ps1
```

Dependências para ambos os scripts:

- Ollama instalado e serviço ativo em `http://localhost:11434`
- `curl`
- `jq`

## Considerações finais

Rodar modelos localmente com o Ollama é uma excelente alternativa para programadores que desejam explorar IA de forma econômica e independente. Apesar das limitações em ambientes de produção, para prototipagem, automação local e estudo, a experiência é muito boa.

Ao dominar ferramentas como Ollama e Jan AI, você potencializa suas aplicações de IA, reduz custos e ganha liberdade para experimentar. O segredo está em compreender as limitações de hardware, escolher modelos adequados ao seu cenário e aplicar boas práticas de prompt engineering.

## Integração com Jan AI

O Jan - Open-source ChatGPT replacement - é uma aplicação desktop open source, que permite usar modelos locais com funcionalidades semelhantes ao ChatGPT, incluindo assistentes, historórico, banco vetorial, file system e integração com MCPs.

O Jan AI suporta modelos de várias fontes (OpenRouter, Hugging Face, Ollama, etc.) e permite configurar o MCP localmente, o que viabiliza interação com arquivos do sistema, navegação web, e uso em projetos pessoais.

### Jan AI no Editor de Código
Demonstro como integrar o Jan AI no editor de código para usar modelos locais em atividades como geração de código, refatoramento e revisão. Basta adicionar o provedor Ollama e selecionar o modelo desejado. Assim, mesmo modelos pequenos podem ajudar no dia a dia sem qualquer custo.

### Download e instegração do Jan AI no VS Code.

- link: https://www.jan.ai/docs/desktop/install/windows

Baixe e siga as orientaçoes no link acima.

Verifique a compatibilidade com o NVIDIA Driver e [CUDA Toolkit](https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html)
