# Orientacoes para agentes

Estas instrucoes se aplicam a todo o repositorio. O A.A.C. usa Next.js App
Router, React e TypeScript, Supabase para autenticacao/banco e Vercel para deploy.

## Postura de trabalho

- Atue como engenheiro de software senior full stack: mantenha o codigo simples,
  legivel, testavel e alinhado aos padroes da comunidade.
- Antes de implementar, formule o escopo e verifique os arquivos e fluxos
  diretamente envolvidos. Se faltar uma decisao essencial, faca perguntas
  objetivas antes de gerar codigo.
- Explique o por que da solucao em poucos topicos e destaque riscos ou falhas de
  logica relevantes antes do resumo final.
- Valide entradas, trate erros de forma previsivel e nao esconda falhas com
  `catch` vazio.
- Mantenha as alteracoes focadas. Nao faca refatoracoes ou mudancas de schema
  sem necessidade para a tarefa.

## Arquitetura

- `app/` contem as paginas e o layout Next.js; componentes interativos ficam em
  `components/` e estilos globais em `app/globals.css`.
- `proxy.ts` atualiza cookies SSR do Supabase e protege rotas. Verifique claims
  assinadas com `supabase.auth.getClaims()`; nunca confie apenas em cookies locais.
- `lib/supabase/client.ts` cria o cliente browser com URL e publishable key
  publicas. Nunca exponha service role keys nem segredos em variaveis `NEXT_PUBLIC_*`.
- Supabase PostgreSQL e o banco persistente. Toda tabela de negocio deve ter
  RLS habilitado e politicas testadas; nao adicionar SQLite ou persistencia local.
- Vercel detecta Next.js automaticamente. Configure `NEXT_PUBLIC_SUPABASE_URL` e
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` nos ambientes local e Vercel.
- `admin/admin` existe somente para pre-visualizacao local sem dados, sob
  `NODE_ENV=development`. Producoes usam exclusivamente Supabase Auth.

## Comandos

- Instalar dependencias: `npm install`
- Desenvolvimento com reload: `npm run dev`
- Build: `npm run build`
- Verificacao de tipos: `npm run typecheck`
- Execucao de producao: `npm start`
- Nao ha suite de testes configurada. Valide build, tipos e fluxos alterados.

## Backend e dados

- Acesse dados pelo cliente Supabase autenticado. Use migrations SQL em
  `supabase/migrations/`; nao use service role no browser nem SQL montado com
  valores fornecidos pelo cliente.
- Valide tipos, limites, campos obrigatorios e IDs antes de consultar ou gravar.
  Trate registros ausentes como `404` e entradas invalidas como `400`.
- Nao envie `err.message`, stack traces, senhas, hashes ou segredos na resposta
  HTTP. Registre detalhes no servidor somente quando isso nao expuser dados
  sensiveis.
- Operacoes de negocio devem validar a identidade/cargo no servidor e ter
  politicas RLS equivalentes. Nunca confie em totais, precos ou estoque enviados
  pelo navegador sem recalcular no servidor/banco.
- Vendas e movimentos de estoque exigem transacoes/RPC atomica; valores
  monetarios devem ser armazenados em centavos.
- Crie usuarios administrativos pelo Supabase Auth. Nunca inclua contas padrao,
  senhas ou chaves privadas no codigo. `admin/admin` e apenas visual local.
- Toda alteracao de schema deve vir com migration Supabase revisada e politicas
  RLS; teste permissoes com usuario autorizado e nao autorizado.

## Frontend

- Use React/Next para a interface e chamadas Supabase autenticadas. Trate estados
  de carregamento, respostas nao-OK e mensagens de erro sem inconsistencias.
- Escape ou use APIs seguras ao inserir dados vindos do usuario ou do banco no
  DOM; evite `innerHTML` para conteudo nao confiavel.
- Preserve acessibilidade basica: labels associados, foco em modais, botoes
  acionaveis por teclado e feedback textual para erros.
- Respeite o visual e os breakpoints existentes antes de introduzir novas
  dependencias ou um framework.

## Seguranca e verificacao

- Antes de finalizar, procure falhas de autenticacao/autorizacao, injecao SQL,
  XSS, CSRF em mutacoes, exposicao de segredos, abuso de payloads e inconsistencias
  de concorrencia em estoque/pagamentos.
- Adicione ou atualize verificacoes focadas quando houver infraestrutura para
  isso. Informe claramente qualquer lacuna de testes ou comando indisponivel.
- Ao concluir, resuma arquivos alterados, riscos encontrados e validacoes
  executadas de forma direta.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
