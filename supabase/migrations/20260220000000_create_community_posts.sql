-- Community posts table: social feed posts for the hiking community
create table public.community_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  peak_id uuid references public.peaks(id) on delete set null,
  is_condition_report boolean not null default false,
  image_urls text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for common queries
create index idx_community_posts_user on public.community_posts(user_id);
create index idx_community_posts_created on public.community_posts(created_at desc);
create index idx_community_posts_peak on public.community_posts(peak_id) where peak_id is not null;
create index idx_community_posts_conditions on public.community_posts(created_at desc) where is_condition_report = true;

-- Enable Row Level Security
alter table public.community_posts enable row level security;

-- Policy: Anyone can view posts (public feed)
create policy "Anyone can view posts"
  on public.community_posts for select
  using (true);

-- Policy: Authenticated users can create posts
create policy "Authenticated users can create posts"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own posts
create policy "Users can update their own posts"
  on public.community_posts for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own posts
create policy "Users can delete their own posts"
  on public.community_posts for delete
  using (auth.uid() = user_id);

-- Updated_at trigger
create trigger community_posts_updated_at
  before update on public.community_posts
  for each row execute function update_updated_at();

-- Post likes table
create table public.post_likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  post_id uuid not null references public.community_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create index idx_post_likes_post on public.post_likes(post_id);
create index idx_post_likes_user on public.post_likes(user_id);

alter table public.post_likes enable row level security;

create policy "Anyone can view likes"
  on public.post_likes for select
  using (true);

create policy "Users can insert their own likes"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on public.post_likes for delete
  using (auth.uid() = user_id);

-- Post comments table
create table public.post_comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_post_comments_post on public.post_comments(post_id, created_at);
create index idx_post_comments_user on public.post_comments(user_id);

alter table public.post_comments enable row level security;

create policy "Anyone can view comments"
  on public.post_comments for select
  using (true);

create policy "Users can insert their own comments"
  on public.post_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on public.post_comments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.post_comments for delete
  using (auth.uid() = user_id);

create trigger post_comments_updated_at
  before update on public.post_comments
  for each row execute function update_updated_at();

-- Post saves/bookmarks table
create table public.post_saves (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  post_id uuid not null references public.community_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create index idx_post_saves_post on public.post_saves(post_id);
create index idx_post_saves_user on public.post_saves(user_id);

alter table public.post_saves enable row level security;

create policy "Anyone can view saves"
  on public.post_saves for select
  using (true);

create policy "Users can insert their own saves"
  on public.post_saves for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own saves"
  on public.post_saves for delete
  using (auth.uid() = user_id);
