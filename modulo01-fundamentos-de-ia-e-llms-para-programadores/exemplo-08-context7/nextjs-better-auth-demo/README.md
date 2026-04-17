# Demo gerada: Next.js + Better Auth + GitHub OAuth + SQLite

## Docs consultados via Context7

| Biblioteca | Tópico |
|---|---|
| `better-auth` | Next.js App Router — `toNextJsHandler` |
| `better-auth` | GitHub OAuth — `socialProviders.github` |
| `better-auth` | SQLite direto com `better-sqlite3` (`new Database(...)`) |
| `better-auth` | Client React — `createAuthClient`, `useSession`, `signIn.social` |
| `better-auth` | Server session — `auth.api.getSession({ headers })` |

**Snippets base utilizados:**
```ts
// Route handler (App Router)
import { toNextJsHandler } from "better-auth/next-js";
export const { GET, POST } = toNextJsHandler(auth);

// SQLite direto
import Database from "better-sqlite3";
export const auth = betterAuth({ database: new Database("./better-auth.sqlite") });

// Client social sign-in
await authClient.signIn.social({ provider: "github", callbackURL: "/" });
```

## Estrutura de arquivos criados

```
exemplo-08-context7/
├── app/
│   ├── api/auth/[...all]/route.ts   ← handler Better Auth
│   ├── components/SignOutButton.tsx  ← botão "Sair" (client)
│   ├── login/page.tsx               ← página de login com GitHub
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                     ← Home (Hello World + estado sessão)
├── lib/
│   ├── auth.ts                      ← configuração Better Auth (servidor)
│   └── auth-client.ts               ← auth client React
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Como rodar localmente

**Pré-requisitos:**
- Node.js 18+
- Conta e OAuth App no GitHub ([Settings → Developer settings → OAuth Apps](https://github.com/settings/developers))
  - *Homepage URL:* `http://localhost:3000`
  - *Authorization callback URL:* `http://localhost:3000/api/auth/callback/github`

**1. Criar o arquivo `.env.local`** (copiar `.env.example` e preencher):
```bash
cp .env.example .env.local
```
Gere um valor seguro para `BETTER_AUTH_SECRET` com o comando:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```env
BETTER_AUTH_SECRET=cole_aqui_o_valor_gerado_acima
BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=seu_client_id
GITHUB_CLIENT_SECRET=seu_client_secret
```

**2. Instalar dependências:**
```bash
npm install
```

**3. Criar tabelas do banco SQLite:**
```bash
npx @better-auth/cli migrate
```

**4. Iniciar o servidor de desenvolvimento:**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Dependências utilizadas

| Pacote | Função |
|---|---|
| `next` | Framework React (App Router) |
| `react` / `react-dom` | UI |
| `better-auth` | Autenticação |
| `better-sqlite3` | Banco SQLite local |
| `tailwindcss` | Estilização |
