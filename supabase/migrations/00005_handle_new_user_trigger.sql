-- ============================================================
-- Migration 00005: Trigger HANDLE_NEW_USER
-- ============================================================
-- Quando um usuário se registra via Supabase Auth, este trigger
-- cria automaticamente um registro na tabela profiles.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Dispara após INSERT em auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

comment on function public.handle_new_user() is 'Cria perfil automaticamente ao registrar novo usuário';
