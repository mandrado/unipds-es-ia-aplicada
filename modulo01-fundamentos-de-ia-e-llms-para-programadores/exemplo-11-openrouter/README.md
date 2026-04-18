# Como usar OpenRouter para orquestrar vários modelos

Neste capítulo, compartilho como utilizo o OpenRouter para orquestrar diferentes modelos de linguagem em um único ponto de integração. A motivação para isso veio da dificuldade de manter várias integrações simultâneas com APIs de diferentes fornecedores, cada uma com seu SDK, formatos, limitações e custos distintos.

## Por que usar um orquestrador?
Quando você começa a usar diferentes modelos (como OpenAI, Google, Anthropic, etc.), percebe que o trabalho de integração vira um caos: diversas API keys, SDKs, regras, dashboards de billing espalhados e um risco real de vendor lock-in. Com um orquestrador como o OpenRouter, tudo isso é centralizado.
OpenRouter é uma API unificada, compatível com o padrão da OpenAI, que permite trocar de modelo ou provedor por configuração, sem alterar a lógica da aplicação. Isso muda completamente o jogo para aplicações reais, oferecendo flexibilidade, escalabilidade e manutenção simplificada.

Funcionalidades do OpenRouter
- Fallback automático: se um modelo falha, ele tenta outro automaticamente.
- Roteamento por custo ou desempenho: você define suas prioridades (como latência ou preço) e ele escolhe.
- Cobrança consolidada: um único billing, mesmo que você use modelos de diferentes provedores.
- Modelos gratuitos: muitos modelos não exigem cartão de crédito.
- Compatibilidade com padrões: APIs, formatos e autenticação semelhantes ao da OpenAI.
- 
## Como Começar
O processo é simples:
1. [Acesse o site do OpenRouter](https://openrouter.ai/).
2. Crie uma conta gratuita.
3. Navegue pelos modelos disponíveis, aplicando filtros como "100% Free".
4. Gere sua API Key e configure variáveis de ambiente como OPENROUTER_KEY e outras.

Com a chave gerada, você pode começar a testar modelos gratuitos com controle total.

## Casos de uso reais e modelos
Durante a aula, usei o modelo Gemma 27B, que possui 27 bilhões de parâmetros e um desempenho interessante para tarefas gerais de linguagem. Mesmo sendo gratuito, ele entregou respostas surpreendentes.
Outros modelos também estão disponíveis, como o LLaMA 2, Mistral e modelos menores como 4B ou 2B que podem ser utilizados até no navegador.

Você pode classificar modelos por tipo (texto, imagem, embeddings) e por custo. A maioria dos modelos multimodais e de embeddings ainda não possui opções gratuitas, mas isso pode mudar com o tempo.

## Cuidados com a segurança
Durante a demonstração, destaquei a importância de manter as chaves de API fora do controle de versão. Um erro comum é subir o arquivo de configuração para o GitHub e expor a chave. O OpenRouter tem mecanismos de segurança para invalidar chaves vazadas automaticamente, mas o ideal é sempre proteger esses dados.

## Integrações Bring Your Own Key (BYOK)
Além dos modelos já disponibilizados, é possível plugar suas próprias chaves da OpenAI, Anthropic, entre outros. Isso permite manter o controle sobre sua cota enquanto aproveita os benefícios do orquestrador.

## Conclusão
Usar o OpenRouter é uma excelente estratégia para quem deseja liberdade na escolha de modelos, economia de custos e simplicidade na integração com aplicações reais. Para protótipos, testes e até mesmo alguns usos em produção, ele se mostra uma solução robusta e acessível.

Recomendo fortemente que você experimente o OpenRouter nos seus projetos, explore diferentes modelos e construa sua própria arquitetura de IA sem amarras.

---

## Como executar o script `request.sh`

O arquivo `request.sh` contém um exemplo de chamada à API do OpenRouter via `curl`. Para executá-lo, use o **Git Bash**:

```bash
sh request.sh
```

> **Atenção:** execute o comando acima **dentro do diretório** `exemplo-11-openrouter`, ou seja, com o Git Bash aberto nessa pasta.

### Variáveis de ambiente (.env)

O script carrega as variáveis de ambiente a partir de um arquivo `.env` no mesmo diretório. Copie o arquivo de exemplo e preencha com sua chave:

```bash
cp .env-sample .env
# edite o .env e insira sua OPENROUTER_API_KEY
```

### Por que `source .env` falha no Git Bash?

O comando `source .env` busca o arquivo `.env` relativo ao **diretório de trabalho atual (CWD)** do shell, não relativo à localização do script. No Git Bash, isso é instável: dependendo de como o shell foi aberto ou de onde o comando foi executado, o CWD pode não ser o diretório do script, fazendo com que o `.env` não seja encontrado mesmo estando na mesma pasta, retornando algo como:

```bash
$ sh request.sh 
request.sh: line 3: source: .env: file not found
```

**Solução aplicada no script:** em vez de `source .env`, o script usa:

```bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/.env"
```

`$(dirname "$0")` retorna o diretório onde o próprio script está localizado, garantindo que o `.env` seja sempre encontrado independentemente do CWD do shell no momento da execução.

---

## Como executar o script `request.ps1`

O arquivo `request.ps1` é equivalente ao `request.sh`, mas para rodar no **terminal PowerShell** (Windows). Utilize o mesmo `.env` criado anteriormente:

```powershell
.\request.ps1
```

### Diferenças em relação ao `request.sh`

| `request.sh` (Git Bash) | `request.ps1` (PowerShell) |
|---|---|
| `source "$SCRIPT_DIR/.env"` | `Get-Content "$PSScriptRoot\.env"` — `$PSScriptRoot` é o equivalente nativo do PS |
| `curl` | `curl.exe` — evita o alias `Invoke-WebRequest` do PowerShell |
| `'...'` com concatenação de variável | here-string `@"..."@` |
| `$VAR` | `$env:VAR` para variáveis de ambiente |
| `\` continuação de linha | `` ` `` continuação de linha |

### Atenção: aspas no valor do `.env`

O arquivo `.env-sample` usa aspas duplas no valor (`OPENROUTER_API_KEY="sua_chave"`). O parser do `request.ps1` remove essas aspas automaticamente ao carregar as variáveis, evitando que o header de autenticação fique malformado (`Bearer "sua_chave"` em vez de `Bearer sua_chave`).
