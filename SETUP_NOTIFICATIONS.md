# Configuração do Sistema de Notificação por E-mail

## Pré-requisitos

1. **Conta no Resend** (recomendado para Supabase)
   - Crie uma conta em https://resend.com
   - Gere uma API key

2. **Supabase CLI instalado**
   ```bash
   npm install -g supabase
   ```

## Passo 1: Configurar a Edge Function

1. Faça login no Supabase CLI:
   ```bash
   supabase login
   ```

2. Link o projeto:
   ```bash
   supabase link --project-ref SEU_PROJECT_REF
   ```

3. Configure a variável de ambiente:
   ```bash
   supabase secrets set RESEND_API_KEY=sua_api_key_do_resend
   ```

4. Deploy a função:
   ```bash
   supabase functions deploy notify-onboarding
   ```

## Passo 2: Criar o Database Trigger no Supabase

Vá em **SQL Editor** no painel do Supabase e execute:

```sql
-- Habilitar extensões necessárias
create extension if not exists "pg_net";

-- Criar função que dispara a Edge Function
create or replace function notify_new_onboarding()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://SEU_PROJECT_REF.supabase.co/functions/v1/notify-onboarding',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'onboarding_config',
      'record', row_to_json(new)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

-- Criar o trigger na tabela onboarding_config
drop trigger if exists on_new_onboarding on onboarding_config;
create trigger on_new_onboarding
  after insert on onboarding_config
  for each row
  execute function notify_new_onboarding();
```

**IMPORTANTE:** Substitua `SEU_PROJECT_REF` pelo ID do seu projeto Supabase.

## Passo 3: Configurar Row Level Security (Opcional)

```sql
-- Permitir inserções anônimas (para o formulário público)
alter table onboarding_config enable row level security;

create policy "Anyone can insert" on onboarding_config
  for insert with check (true);

create policy "Only authenticated can read" on onboarding_config
  for select using (auth.role() = 'authenticated');
```

## Alternativa: Webhook Direto

Se preferir não usar Edge Functions, você pode usar o Database Webhooks do Supabase:

1. Vá em **Database > Webhooks**
2. Crie um novo webhook:
   - Nome: `notify-onboarding`
   - Table: `onboarding_config`
   - Events: `INSERT`
   - URL: Endpoint de um serviço como Zapier, Make, ou seu próprio backend

## Destinatários Configurados

- victorlllima@gmail.com
- netolimapereira2015@gmail.com

## Testando

1. Preencha o formulário de onboarding
2. Verifique o console do Supabase em **Functions > Logs**
3. Confirme o recebimento do e-mail

## Estrutura da Tabela (SQL de referência)

```sql
create table if not exists onboarding_config (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  
  -- Section 1: Identity & UX
  tone_of_voice text,
  typing_indicator boolean default false,
  read_receipts boolean default false,
  use_emojis boolean default false,
  
  -- Section 2: Management & Intervention
  manual_intervention boolean default false,
  return_command text,
  auto_scheduling boolean default false,
  email_agenda text,
  whatsapp_notificacao text,
  
  -- Section 3: Qualification & Overflow
  neighborhoods jsonb default '[]'::jsonb,
  price_min numeric,
  price_max numeric,
  triggers jsonb default '[]'::jsonb,
  outros_gatilhos text,
  
  -- Section 4: Follow-up
  followup_attempts integer default 3,
  hot_lead_timing text default '15min',
  warm_lead_timing text default '1day',
  info_adicional_followup text,
  
  -- Section 5: Pipeline (JSONB para preservar ordem)
  pipeline_stages jsonb default '[]'::jsonb,
  auto_pipeline boolean default false,
  
  -- Section 6: Infrastructure
  data_retention text default '6months',
  send_method text default 'official',
  meta_verification text default 'unknown'
);
```
