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
