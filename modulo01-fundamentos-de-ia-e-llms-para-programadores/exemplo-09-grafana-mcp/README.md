# IA + TELEMETRIA: INVESTIGANDO ERROS COM GRAFANA MCP

> **O que foi feito:** Um agente de IA (Claude Sonnet 4.6 via GitHub Copilot) investigou erros 500 em um endpoint usando apenas dados de telemetria — sem acesso ao código-fonte — e gerou um [relatório de causa raiz](./grafana-mcp-connections-incident-report.md) automaticamente.

---

## Visão Geral

| Componente | Função |
|---|---|
| **App Alumnus** | Aplicação Next.js que emite dados de telemetria via OpenTelemetry |
| **Prometheus** | Coleta e armazena métricas de performance |
| **Grafana Loki** | Centraliza os logs |
| **Grafana Tempo** | Armazena os traces distribuídos |
| **Grafana** | Visualiza e correlaciona os três sinais |
| **Grafana MCP** | Servidor MCP que expõe o Grafana para agentes de IA no VS Code |

Toda a infraestrutura roda localmente com **Docker Compose**.

---

## Como Reproduzir

### 1. Subir a infraestrutura

```bash
cd alumnus/infra
docker-compose -f docker-compose-infra.yaml up --wait
```

Acesse o Grafana em http://localhost:3000.

### 2. Rodar o aplicativo

```bash
cd alumnus/_alumnus
npm ci
npm start
```

> Aguarde ~5 minutos para os dados aparecerem no Grafana.

### 3. Configurar o MCP do Grafana no VS Code

Consulte as instruções no [README da pasta alumnus](./alumnus/README.md).

### 4. Investigar com IA

Abra o GitHub Copilot em um diretório vazio e cole o prompt abaixo:

```
I'm seeing 500 errors on the /students/db-leaky-connections endpoint for my application.

Please investigate and provide a comprehensive report from the last 15 minutes including:

1. Query Prometheus metrics
   - Get requests that ended as 500 for this endpoint
   - Include response times for failure cases

2. Query Loki logs - Correlate logs with the metrics found
   - Show all error-level logs for this endpoint
   - Extract complete error messages and stack traces
   - Show the pattern of failed requests over time

3. Query Tempo traces - Correlate traces with logs and metrics
   - Get traces related to the failed requests
   - Show the span hierarchy and operations
   - Include any error spans with exception details

4. Root cause analysis
   - Based on error patterns, metrics, stack traces, and trace analysis
   - Identify the exact file and line number causing the issue

5. Provide a diagnosis table correlating all telemetry data.
```

> Ao final, peça para salvar o relatório em um arquivo Markdown no mesmo diretório.

### 5. Parar os serviços

```bash
docker-compose -f .\docker-compose-infra.yaml down
```

---

## Como a IA Investigou (passo a passo)

1. **Métricas (Prometheus):** verificou que 100% dos requests ao endpoint retornavam 500.
2. **Logs (Loki):** identificou mensagens de erro e stack traces relacionados a falhas de conexão com o banco.
3. **Traces (Tempo):** reconstruiu a cadeia de chamadas e localizou o span com erro.
4. **Correlação:** cruzou os três sinais e identificou a causa raiz — vazamento de conexões com o banco de dados.

**Resultado:** o agente apontou as linhas suspeitas do código sem ter acesso ao repositório.

---

## Resultado: Relatório Gerado

Ver [grafana-mcp-connections-incident-report.md](./grafana-mcp-connections-incident-report.md)

| Item | Detalhe |
|---|---|
| Endpoint afetado | `/students/db-leaky-connections` |
| Taxa de erro | 100% (HTTP 500) |
| Causa raiz | Conexões com o banco criadas por request sem reutilização (pool leak) |
| Detectado sem | acesso ao código-fonte |

---

## Por que essa abordagem vale a pena?

- **Velocidade:** investigação que levaria horas feita em minutos.
- **Precisão:** diagnóstico baseado em dados reais, sem achismo.
- **Independência do código:** funciona em sistemas legados ou desconhecidos.
- **Stack padrão de mercado:** OpenTelemetry + Prometheus + Loki + Tempo + Grafana.
