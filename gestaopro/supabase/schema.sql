-- ============================================================
-- GestãoPro — schema para Supabase (Postgres)
-- Como usar: Supabase Dashboard -> SQL Editor -> cole e execute
-- ============================================================
create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  cargo text default 'Administrador',
  updated_at timestamptz default now()
);

create table if not exists produtos (
  id uuid primary key default uuid_generate_v4(),
  codigo text unique not null,
  nome text not null,
  preco_compra numeric not null default 0,
  preco_venda numeric not null default 0,
  estoque integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists clientes (
  id uuid primary key default uuid_generate_v4(),
  codigo text unique not null,
  nome text not null,
  telefone text,
  localizacao text,
  created_at timestamptz default now()
);

create table if not exists vendas (
  id uuid primary key default uuid_generate_v4(),
  numero text unique not null,
  data date not null default current_date,
  cliente_id uuid references clientes(id) on delete set null,
  produto_id uuid references produtos(id) not null,
  quantidade integer not null check (quantidade > 0),
  preco numeric not null,
  total numeric generated always as (quantidade * preco) stored,
  valor_pago numeric not null default 0,
  forma_pagamento text,
  created_at timestamptz default now()
);

create table if not exists despesas (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null check (tipo in ('entrada','saida')),
  categoria text not null,
  descricao text,
  valor numeric not null check (valor > 0),
  data date not null default current_date,
  created_at timestamptz default now()
);

create table if not exists estoque_movimentos (
  id uuid primary key default uuid_generate_v4(),
  produto_id uuid references produtos(id) on delete cascade,
  tipo text not null check (tipo in ('entrada','saida')),
  quantidade integer not null,
  motivo text,
  data date not null default current_date,
  created_at timestamptz default now()
);

create table if not exists metas (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  tipo text not null check (tipo in ('vendas','recebimentos','personalizada')),
  valor_alvo numeric not null check (valor_alvo > 0),
  valor_atual numeric not null default 0,
  data_inicio date not null default current_date,
  prazo date not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Automatismos: uma venda desconta o estoque sozinha
-- ============================================================
create or replace function fn_apos_inserir_venda() returns trigger as $$
begin
  update produtos set estoque = estoque - NEW.quantidade where id = NEW.produto_id;
  insert into estoque_movimentos(produto_id, tipo, quantidade, motivo, data)
  values (NEW.produto_id, 'saida', NEW.quantidade, 'Venda ' || NEW.numero, NEW.data);
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_apos_inserir_venda on vendas;
create trigger trg_apos_inserir_venda after insert on vendas
for each row execute function fn_apos_inserir_venda();

create or replace function fn_apos_apagar_venda() returns trigger as $$
begin
  update produtos set estoque = estoque + OLD.quantidade where id = OLD.produto_id;
  insert into estoque_movimentos(produto_id, tipo, quantidade, motivo, data)
  values (OLD.produto_id, 'entrada', OLD.quantidade, 'Estorno venda ' || OLD.numero, current_date);
  return OLD;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_apos_apagar_venda on vendas;
create trigger trg_apos_apagar_venda after delete on vendas
for each row execute function fn_apos_apagar_venda();

create or replace function fn_apos_inserir_movimento() returns trigger as $$
begin
  if NEW.tipo = 'entrada' then
    update produtos set estoque = estoque + NEW.quantidade where id = NEW.produto_id;
  else
    update produtos set estoque = estoque - NEW.quantidade where id = NEW.produto_id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_apos_inserir_movimento on estoque_movimentos;
create trigger trg_apos_inserir_movimento after insert on estoque_movimentos
for each row when (NEW.motivo is null or NEW.motivo not like 'Venda %')
execute function fn_apos_inserir_movimento();

-- ============================================================
-- Segurança (RLS): só utilizadores autenticados usam os dados
-- ============================================================
alter table profiles enable row level security;
alter table produtos enable row level security;
alter table clientes enable row level security;
alter table vendas enable row level security;
alter table despesas enable row level security;
alter table estoque_movimentos enable row level security;
alter table metas enable row level security;

create policy "profile_self" on profiles for select using (auth.uid() = id);
create policy "profile_self_update" on profiles for update using (auth.uid() = id);
create policy "profile_self_insert" on profiles for insert with check (auth.uid() = id);

create policy "produtos_auth_all" on produtos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "clientes_auth_all" on clientes for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "vendas_auth_all" on vendas for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "despesas_auth_all" on despesas for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "estoque_mov_auth_all" on estoque_movimentos for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "metas_auth_all" on metas for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Cria o perfil automaticamente quando um utilizador é criado no Auth
create or replace function fn_novo_utilizador() returns trigger as $$
begin
  insert into public.profiles (id, nome) values (new.id, split_part(new.email,'@',1))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_novo_utilizador on auth.users;
create trigger trg_novo_utilizador after insert on auth.users
for each row execute function fn_novo_utilizador();
