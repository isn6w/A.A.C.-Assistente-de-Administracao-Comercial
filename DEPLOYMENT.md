# Deploy na Vercel com Supabase

Este projeto usa Next.js 16 na Vercel e Supabase Auth/Postgres. A Vercel
detecta Next.js automaticamente; nao e necessario criar `vercel.json`.
O arquivo `.env.example` lista as variaveis, e `.env.local` permanece local.

## 1. Criar e preparar o projeto Supabase

1. Crie um projeto no [Supabase](https://supabase.com/dashboard). Guarde a
   senha do banco em um gerenciador seguro; ela nao e necessaria no frontend.
2. No dashboard do projeto, abra **Project Settings > API** (ou **API Keys**)
   e copie o **Project URL** e a **publishable key** (`sb_publishable_...`).
   A chave legada `anon` tambem e publica, mas prefira a publishable key.
3. Abra **SQL Editor** e execute, um arquivo por vez, as migrations abaixo,
   nesta ordem. Para cada uma, abra o arquivo correspondente em
   `supabase/migrations/`, copie o conteudo completo e confirme a execucao:
   - `20261006194500_catalog_and_inventory.sql`
   - `20261007170000_product_markup_pricing.sql`
   - `20261008120000_pricing_settings.sql`
   - `20261010150000_pricing_invoice_batches.sql`
   - `20261010173000_fixed_expenses_as_percentages.sql`
   - `20261010190000_sales_and_markup_invoice_import.sql`
   - `20261010193500_sale_installments.sql`
   - `20261010195000_pix_payment_settings.sql`

   A ordem e obrigatoria. Em especial, a migration de parcelas depende da
   migration-base de vendas. Se o projeto Supabase ja tiver dados ou migrations
   aplicadas, nao execute os arquivos novamente sem revisar o estado e fazer
   backup; as migrations nao sao um procedimento de reset.
4. Depois das migrations, verifique vendas e a RPC base no SQL Editor:

   ```sql
   select
     to_regclass('public.sales') as sales_table,
     to_regclass('public.sale_items') as sale_items_table,
     to_regprocedure('public.record_sale(jsonb,text,integer)') as record_sale;
   ```

   Os tres resultados devem ser diferentes de `NULL`.
5. Em **Authentication > Settings**, desative o cadastro publico. A aplicacao
   nao oferece fluxo de cadastro: crie o primeiro usuario em **Authentication
   > Users > Add user** e defina uma senha forte. Crie/convida outros usuarios
   somente pelo painel administrativo do Supabase.
6. Promova a conta inicial a administradora no SQL Editor, substituindo o
   marcador pelo e-mail exato. Confira primeiro que a consulta retorna uma
   unica conta; em seguida execute o `INSERT`:

   ```sql
   select id, email
   from auth.users
   where lower(trim(email)) = lower(trim('<EMAIL_DO_ADMIN>'));

   insert into public.profiles (user_id, role)
   select id, 'admin'
   from auth.users
   where lower(trim(email)) = lower(trim('<EMAIL_DO_ADMIN>'))
   on conflict (user_id) do update set role = 'admin';
   ```

7. Em **Authentication > URL Configuration**, configure o **Site URL** com a
   URL de producao, por exemplo `https://seu-projeto.vercel.app`, e inclua essa
   origem na lista de **Redirect URLs**. Ao adicionar um dominio proprio,
   atualize ambos os campos. Inclua URLs de preview somente se realmente usar
   esses deploys para testar autenticacao.

## 2. Publicar o codigo em Git

O diretorio de trabalho atual nao contem um repositorio Git (`.git`). A Vercel
recomenda importar um repositorio Git; crie um repositorio privado na sua conta
GitHub/GitLab/Bitbucket, publique nele o projeto e mantenha `.env.local` fora
do commit. O `.gitignore` ja ignora `.env*`, `.next/`, `node_modules/` e `.vercel/`,
mantendo `.env.example` versionavel.

Antes de publicar, revise os arquivos a enviar para garantir que nenhum segredo
ou dado real tenha sido adicionado ao codigo. Nunca publique `service_role`,
senha do banco ou `MP_ACCESS_TOKEN`.

## 3. Configurar e implantar na Vercel

1. Entre na [Vercel](https://vercel.com/), escolha **Add New > Project** e
   importe o repositorio criado.
2. Confirme **Framework Preset: Next.js**, **Root Directory: `./`**,
   **Build Command: `npm run build`** e **Install Command: `npm install`**.
   O comando de build Next.js padrao tambem funciona. Selecione Node.js **22.x**
   nas configuracoes do projeto (Next.js 16 requer Node.js 20.9 ou superior).
3. Em **Project Settings > Environment Variables**, configure estas variaveis:

   | Nome | Valor | Ambientes |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL do Supabase | Production; Preview se necessario |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | chave `sb_publishable_...` do Supabase | Production; Preview se necessario |
   | `MP_ACCESS_TOKEN` | token privado do Mercado Pago | Somente se habilitar pagamentos Mercado Pago |

   Use a mesma URL/chave publica do projeto Supabase correspondente ao ambiente.
   `MP_ACCESS_TOKEN` e opcional para Pix manual e obrigatorio somente para o modo
   Mercado Pago. Nunca prefixe esse token com `NEXT_PUBLIC_`. Nao cadastre a
   chave `service_role` na Vercel para esta aplicacao.
4. Clique em **Deploy**. Depois de salvar ou alterar variaveis, faca um novo
   deploy para que o build e as funcoes recebam os valores atualizados.
5. Abra a URL publicada, entre com o e-mail e senha do usuario criado no
   Supabase e valide `/dashboard`, produtos, configuracoes e calculadora. A
   conta administradora precisa ter `profiles.role = 'admin'`.

## 4. Mercado Pago (opcional)

Para usar Pix manual, nao e necessario configurar o token. Para Mercado Pago,
adicione `MP_ACCESS_TOKEN` como variavel privada nos ambientes Vercel desejados
e faca novo deploy. Depois, em **Configuracoes** na aplicacao, selecione Mercado
Pago e preencha os dados requeridos. Teste primeiro com as credenciais de teste
do provedor; so use credenciais de producao depois de confirmar recebedor e
fluxo de conciliacao.

## 5. Validacao e operacao

Execute localmente antes de publicar:

```powershell
npm install
npm run typecheck
npm test
npm run build
```

No deploy, consulte **Vercel > Project > Deployments > Build Logs** em caso de
falha. O modo `admin/admin` so existe em `NODE_ENV=development` sem Supabase
configurado; ele nao autentica nem grava dados em producao. O Supabase continua
sendo a fonte persistente, com autorizacao e RLS nas migrations.

Este guia prepara a configuracao, mas nao cria projetos remotos nem implanta a
aplicacao: isso requer acesso as contas Supabase, Git e Vercel do proprietario.
