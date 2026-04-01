create table analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  product_context text,
  time_period text,
  input_data jsonb not null,
  output jsonb not null,
  created_at timestamptz default now()
);

alter table analyses enable row level security;

create policy "Users can only access their own analyses"
  on analyses for all
  using (auth.uid() = user_id);
