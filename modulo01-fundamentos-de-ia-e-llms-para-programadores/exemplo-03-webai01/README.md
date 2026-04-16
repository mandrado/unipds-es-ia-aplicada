# Exemplo 03 - WebAI 01

## Resumo do problema

Ao executar o projeto no Google Chrome, apareceram dois comportamentos principais:

1. `TypeError: LanguageModel.params is not a function`
2. Aviso de idioma de saida ausente:
   - `No output language was specified in a LanguageModel API request...`
3. Em algumas tentativas, `LanguageModel` estava indisponivel dependendo do navegador/perfil usado.

Tambem foi observado que `LanguageModel.availability()` retornava `downloadable` e depois `available`, indicando que a API estava ativa e o modelo local estava em processo de download/disponibilizacao.

## Causa raiz

1. Diferencas de implementacao entre versoes/canais do Chrome para a API experimental `LanguageModel`.
2. Uso de `LanguageModel.params()` como obrigatorio, mesmo quando o metodo nao existe na versao em execucao.
3. Chamadas sem `expectedOutputLanguages`, gerando warning e podendo degradar a experiencia.
4. Dependencia de contexto correto do navegador (perfil/canal com Web AI habilitado).

## Solucao implantada

O arquivo `index.html` foi atualizado para ser resiliente a variacoes da API:

1. Estrutura HTML completa e fluxo de execucao com clique no botao `Iniciar`.
2. Verificacao de disponibilidade com idiomas explicitos:
   - `expectedInputLanguages: ["pt"]`
   - `expectedOutputLanguages: ["en"]`
3. Remocao da dependencia obrigatoria de `LanguageModel.params()`:
   - Agora o codigo so chama `params()` se o metodo existir.
4. Fallback de inferencia:
   - Usa `promptStreaming()` quando disponivel.
   - Faz fallback para `prompt()` quando streaming nao existir.
5. Mensagens de erro orientativas para facilitar troubleshooting.
6. Painel de diagnostico em tela com:
   - Presenca da API `LanguageModel`
   - Resultado de `availability()` sem argumentos e com idiomas
   - Suporte a `params()` e `create()`
   - Metodos detectados em tempo de execucao

## Como executar

1. Iniciar servidor local na pasta do exemplo:

```bash
python -m http.server 8000
```

2. Abrir no navegador:

- `http://localhost:8000`

3. Clicar em `Iniciar`.

## Validacao esperada

- Se a API estiver pronta, a resposta e renderizada na tela.
- Se houver restricao de ambiente, o painel de diagnostico ajuda a identificar rapidamente o ponto de falha.

## Observacoes

- Nao e necessario reiniciar o browser para esse erro especifico de `params()`.
- Reinicio so costuma ser necessario apos alteracao de flags em `chrome://flags`.
- O warning de idioma e evitado mantendo `expectedOutputLanguages` nas chamadas relevantes.
