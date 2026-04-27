# Smart Model Router Gateway

Gateway inteligente para roteamento de requisições entre múltiplos modelos de LLMs, construído com Node.js e Fastify.

---

## Pré-requisitos

- [nvm for Windows](https://github.com/coreybutler/nvm-windows) instalado como administrador
- Node.js 24.x (gerenciado via nvm)

---

## Configuração do Ambiente

### 1. Instalar e configurar o nvm

Após remover a versão anterior do Node.js, instale o **nvm** como administrador e em seguida instale as versões necessárias:

```powershell
# Instalar versão que estava em uso anteriormente (compatibilidade)
nvm install 22.19.0

# Instalar a versão 24 (utilizada no projeto)
nvm install 24

# Ativar a versão 24
nvm use 24
```

Verificar a versão ativa:

```powershell
node -v   # v24.x.x
npm -v
```

---

### 2. Inicializar o projeto

```powershell
# Criar e entrar no diretório do projeto
mkdir 01-smart-model-router-gateway
cd 01-smart-model-router-gateway

# Inicializar o package.json com valores padrão
npm init -y
```

---

### 3. Instalar as dependências

```powershell
npm install fastify@5.7.4 @types/node@24
```

| Pacote | Versão | Finalidade |
|---|---|---|
| `fastify` | 5.7.4 | Framework HTTP de alta performance |
| `@types/node` | ^24 | Tipos TypeScript para Node.js |

---

### 4. Criar a estrutura de arquivos

```powershell
# Criar diretório fonte
mkdir src

# Criar arquivo de entrada
New-Item src/index.ts
```

Estrutura resultante:

```
01-smart-model-router-gateway/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

### 5. Configurar o script de desenvolvimento

No `package.json`, o script `dev` está configurado para executar TypeScript diretamente com Node.js 24 (suporte nativo a `--watch`) e o flag `--inspect` para depuração:

```json
"scripts": {
  "dev": "node --inspect --watch src/index.ts"
}
```

> Node.js 24 suporta TypeScript de forma nativa via strip de tipos, sem necessidade de compilação prévia.

---

## Executar o projeto

```powershell
npm run dev
```

---

## Stack

| Tecnologia | Versão |
|---|---|
| Node.js | 24.x |
| Fastify | 5.7.4 |
| TypeScript | via `@types/node` |
