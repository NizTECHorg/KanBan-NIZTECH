# KanBan NIZTECH

Quadro kanban no navegador para organizar projetos, listas e cartões. A interface é uma SPA em React; autenticação, dados e imagens das notas ficam no Supabase.

## O que o app faz

- Cadastro e login
- Projetos com cor e listas padrão (A fazer, Em andamento, Concluído)
- Cartões com rótulo, responsável, nota e imagem
- Arrastar cartões entre listas
- Acesso protegido por sessão; permissões no Postgres via RLS

Rotas principais: `/` (login), `/cadastro`, `/projetos` e `/projetos/:projectId`.

## Stack

- React 19, TypeScript, Vite 6
- React Router 7, TanStack Query, Zustand
- React Hook Form e Zod
- Tailwind CSS 4
- Supabase (Auth, Postgres, Storage)

## Pré-requisitos

- Node.js 22 ou superior
- npm
- Um projeto no [Supabase](https://supabase.com) com as tabelas do kanban aplicadas

O SQL fica em `supabase/migrations/` na máquina local. Essa pasta está no `.gitignore` e não entra no repositório.

## Configuração

Crie um arquivo `.env` na raiz:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

Use só a chave **anon**. A `service_role` não pode ir para o frontend.

A URL precisa ser `https`. Valores de exemplo (`seu-projeto`, `sua-chave`) são tratados como ausentes e a tela de configuração aparece no lugar do app.

As variáveis `VITE_*` entram no bundle no momento do build. Depois de alterar o `.env`, reinicie o servidor de desenvolvimento. Em produção, altere as variáveis e faça um novo deploy.

## Scripts

```bash
npm install
npm run dev        # servidor local do Vite
npm run build      # checagem de tipos + build de produção em dist/
npm run preview    # serve o build localmente
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
```

## Estrutura

```text
src/
  pages/            telas (login, projetos, quadro)
  components/       UI do quadro e primitivos
  hooks/            queries e mutations do kanban
  services/         chamadas ao Supabase
  schemas/          validação com Zod
  routes/           rotas e guards de autenticação
```

As páginas não falam com o Supabase direto: passam pelos hooks em `src/hooks/kanban.ts`, que chamam `src/services/kanban.service.ts`.

## Deploy

O build é estático (`dist/`).

- **Vercel:** `vercel.json` reescreve todas as rotas para `index.html`. Defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` antes do build.
- **Netlify:** `netlify.toml` publica `dist`, faz o fallback da SPA e envia os headers de segurança.
