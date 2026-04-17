#  USANDO IA PARA: COLHER DADOS DE TELEMETRIA DE APPS
## 1. INTRODUÇÃO
Neste exemplo, vamos configurar o Grafana MCP (Metrics Collection Pipeline) para coletar dados de telemetria de um aplicativo Next.js instrumentado com OpenTelemetry. O Grafana MCP é uma solução leve e eficiente para coletar, processar e enviar métricas para o Grafana Cloud.

## 2. CONFIGURAÇÃO DO PROJETO
Precisa ter o docker instalado e rodando
Acesse o diretório alumnus/infra e execute os comandos
Rode `docker-compose -f docker-compose-infra.yaml up --wait` 
acesse http://localhost:3000 para acessar o Grafana.

## 3. INSTRUMENTAÇÃO DO APLICATIVO
Volte uma pasta e acesse cd ..\_alumnus
instale as dependências com `npm ci`
depois rode o programa com `npm start`

Neste momento o app começa a gerar as métricas e gravar os dados dentro do banco de dados.
Aguarde 5 minutos para começar a receber os dados no Grafana.

## 4. CONFIGURAR MCP DO GRAFANA
Dentro do README.md do diretório `alumnus`, veja as instruções para configurar o MCP do Grafana.

O agente de IA utilizado foi o **Claude Sonnet 4.6** via GitHub Copilot.

## 5. INFRAESTRUTURA DO PROJETO
Utilizado uma aplicação chamada Aluminus, já preparada para emitir dados de telemetria. A instrumentação foi feita com OpenTelemetry, que é hoje o padrão mais adotado para coleta unificada de telemetria.

Esses dados seram enviados para:
- Prometheus: coleta e armazena métricas de performance.
- Grafana Tempo: armazena os traces.
- Grafana Loki: centraliza os logs.
- Grafana: visualiza e correlaciona os sinais em painéis interativos.

Tudo foi orquestrado com Docker Compose para simular um ambiente real de produção.

### O papel do Grafana MCP e da IA

Para transformar esses dados em conhecimento acionável, utilizei um servidor MCP conectado ao Grafana. Com isso, um agente de IA integrado ao VS Code foi capaz de fazer investigações reais com base em um único prompt: "Estou recebendo erro 500 neste endpoint, descubra o motivo e gere um relatório."
Como funciona a investigação automatizada
1. Coleta de métricas: a IA acessa o Prometheus e verifica, por exemplo, que todos os requests estão retornando erro 500.
2. Exploração de logs: acessa o Grafana Loki para analisar os logs relacionados, identificando mensagens de erro.
3. Tracing: consulta o Grafana Tempo para reconstruir a cadeia de chamadas e localizar gargalos.
4. Correlação dos sinais: cruza os dados das três fontes e descobre que o problema está relacionado a um vazamento de conexões com o banco de dados.
O mais incrível é que a IA executa toda essa análise sem acesso ao código-fonte. Ela atua apenas com base nos dados expostos pelas ferramentas de telemetria.

### Diagnóstico e relatório final

O agente gerou um relatório estruturado com:
- Nome do endpoint afetado.
- Tempo de resposta das requisições.
- Stack trace com falha na conexão com o banco.
- Causa raiz: múltiplas conexões sendo criadas a cada requisição, sem reutilização.
- Linhas suspeitas de código onde o leak ocorre (mesmo sem ter acessado o repositório).

### Impacto e aplicação real
Essa prática foi usada para resolver um problema real de vulnerabilidade na minha infraestrutura em produção. O poder de usar IA com telemetria permitiu encontrar e explicar rapidamente falhas graves de performance.
Por que usar essa abordagem?
- Redução do tempo de investigação: uma tarefa que levaria horas pode ser feita em minutos.
- Precisão no diagnóstico: evita achismos e foca nos dados concretos.
- Menor dependência do código-fonte: ideal para sistemas legados ou desconhecidos.
- Alta integração com ferramentas do mercado: funciona com tecnologias amplamente utilizadas.

### Considerações finais
Colocar a IA para trabalhar com telemetria é o futuro da observabilidade. Ferramentas gratuitas e poderosas estão à nossa disposição, como Grafana, OpenTelemetry e Prometheus. Integradas a agentes inteligentes via MCP, transformam dados brutos em diagnósticos claros, rápidos e confiáveis.

Se você ainda está usando logs manuais e debugging tradicional, considere experimentar essa abordagem. O ganho de produtividade e clareza é imediato e vale cada segundo investido na configuração inicial.
