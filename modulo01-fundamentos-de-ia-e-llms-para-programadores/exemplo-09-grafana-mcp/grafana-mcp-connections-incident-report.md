# Incident Report: 500 Errors on /students/db-leaky-connections

## Scope
- Analysis window: 2026-04-17T13:47:25Z to 2026-04-17T14:02:25Z (last 15 minutes from host time)
- Endpoint: `/students/db-leaky-connections`
- Telemetry sources: Prometheus, Loki, Tempo

## 1) Prometheus Metrics

### Request failures (500) for the endpoint
- Metric family: `http_server_duration_milliseconds_*`
- Route label: `http_route="/students/db-leaky-connections"`
- Failed requests in 15m (increase): ~446.3
- Total requests in 15m (increase): ~446.29
- Effective failure rate: 100%

### Response times for failure cases
- Mean failure latency: ~1008.84 ms
- p50: ~1750 ms
- p95: ~2425 ms
- p99: ~2485 ms
- Per-minute failed request rate: mostly ~27.4 to ~31.0 failures/min
- Per-minute failed latency: mostly ~1006 to ~1010 ms

## 2) Loki Logs Correlation

### Error-level logs for this endpoint
Correlated structured logs show:
- `req_url: /students/db-leaky-connections`
- `res_statusCode: 500`
- `responseTime: ~1005 to ~1009 ms`
- `trace_id` present (used for trace correlation)

### Complete error message and stack traces
Observed repeated error payload:
- Message: `timeout exceeded when trying to connect`
- Error line: `Error processing request`
- Stack trace excerpts:
  - `.../node_modules/pg-pool/index.js:45:11`
  - `.../src/scenarios/db-leaky-connections/main.ts:52:20`
  - `.../src/scenarios/db-leaky-connections/main.ts:84:24`

### Pattern of failed requests over time
From retrieved window payload counts:
- `Error processing request`: 17
- `Internal Server Error`: 17
- `res_statusCode: 500`: 17
- Timeout message occurrences: 34

## 3) Tempo Traces Correlation

### Traces related to failed requests
Failed traces found with:
- `resource.service.name = alumnus_app_d725`
- `span.http.route = /students/db-leaky-connections`
- `span.http.status_code >= 500`

Representative trace:
- `traceID: 87d44f5c3af24ab904feab79de3619c`
- Duration: ~1013 ms
- `serviceStats`: `spanCount=4`, `errorCount=3`

### Span hierarchy and operations
Observed span names in failed trace:
- `GET` (root-level server span, error)
- `GET /students/db-leaky-connections` (error)
- `handler - fastify -> @fastify/otel` (error)
- `request`

### Error spans and exception details
- 3 of 4 spans in representative trace are marked `status=error`
- Trace duration aligns with request/log latency (~1.0s)
- Exception text is primarily surfaced in Loki logs (timeout + stack)

## 4) Root Cause Analysis

### Root cause
Database connection acquisition timeout caused by leaked/unreleased connections in the db-leaky-connections scenario path.

### Exact file and line number causing the issue
Primary failing source locations from stack traces:
- `src/scenarios/db-leaky-connections/main.ts:52:20` in `DbLeakyConnectionsScenario.createConnection`
- Called from `src/scenarios/db-leaky-connections/main.ts:84:24`

Upstream surfaced in dependency:
- `node_modules/pg-pool/index.js:45:11`

### Why this is high confidence
1. Prometheus shows sustained 100% failure for this exact endpoint.
2. Loki shows repeated timeout-to-connect errors and 500 responses.
3. Tempo shows repeated error spans for the same route and service.
4. Stack traces repeatedly point to the same scenario file/lines.

## 5) Diagnosis Correlation Table

| Signal | Observation | Correlation |
|---|---|---|
| Prometheus | ~446 failed requests in 15m, 100% failure on endpoint | Confirms sustained endpoint impact |
| Prometheus latency | Mean ~1008.84 ms, p95 ~2425 ms | Consistent with pool wait timeout behavior |
| Loki request logs | `req_url` + `res_statusCode=500` + ~1s response time | Endpoint-specific failed request evidence |
| Loki error logs | `Error processing request` + timeout exceeded when trying to connect | Concrete failure mechanism |
| Loki stack traces | `main.ts:52:20` and `main.ts:84:24` | Pinpoints application code path |
| Tempo traces | Route spans in error; representative trace 3/4 spans error | End-to-end failure path confirmation |
| Cross-signal | Metrics, logs, traces converge on same pattern | High-confidence diagnosis |

## Final Diagnosis
The endpoint `/students/db-leaky-connections` is failing because DB connections are being leaked (not released), leading to pool acquisition timeouts and HTTP 500 responses. The immediate failing application location is `src/scenarios/db-leaky-connections/main.ts:52:20` (invoked from line `84:24`).
