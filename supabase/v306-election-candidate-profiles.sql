-- HGN v0.67.14 - Publisher-managed candidate profile directory.
-- Candidate statements are supplied material and are presented neutrally.

create table if not exists public.hgn_election_candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  candidate_name text not null,
  office text not null,
  race_name text not null,
  community text,
  portrait_url text,
  statement text not null,
  source_label text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hgn_election_candidate_profiles_public_order_idx
  on public.hgn_election_candidate_profiles (published, race_name, sort_order, candidate_name);

update public.hgn_election_settings
set introduction = replace(introduction, 'debates', 'forums')
where id = 'current' and introduction ilike '%debates%';

alter table public.hgn_election_candidate_profiles enable row level security;

drop policy if exists "Election candidate profiles public read" on public.hgn_election_candidate_profiles;
create policy "Election candidate profiles public read" on public.hgn_election_candidate_profiles
  for select using (published = true);

drop policy if exists "Election candidate profiles publisher write" on public.hgn_election_candidate_profiles;
create policy "Election candidate profiles publisher write" on public.hgn_election_candidate_profiles
  for all using (
    exists (
      select 1 from public.hgn_profiles p
      where p.user_id = auth.uid()
        and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor'))
    )
  ) with check (
    exists (
      select 1 from public.hgn_profiles p
      where p.user_id = auth.uid()
        and (p.is_admin = true or p.can_access_publisher_tools = true or p.account_type in ('admin','publisher','editor'))
    )
  );

-- The first five print profiles supplied for Port Clements. Portraits may be
-- added later in Publisher CMS without changing the candidate statement.
insert into public.hgn_election_candidate_profiles
  (slug, candidate_name, office, race_name, community, statement, source_label, sort_order)
values
  ('jasmine-beachy-port-clements-councillor', 'Jasmine Beachy', 'Candidate for Councillor', 'Port Clements municipal candidates', 'Port Clements', $$My name is Jasmine Beachy, from the Yahgulaanas Raven Clan of Old Massett, and I have proudly called Port Clements home for the past 20 years. During that time, I’ve been involved with various volunteer groups and have become deeply invested in our community.

For the past six years, I have worked as a StrongStart Facilitator and volunteered with Moms and Tots, and I’m currently working toward my ECE certificate. I have also spent many years running a business alongside my husband, which has given me valuable experience in organization, planning, decision-making, and working with others.

I want to bring a fresh outlook to Council, focusing on recreation, beautification, and the future of our children and seniors. I also want to advocate for sustainable local industry, businesses, and jobs that keep our community strong. I’m approachable, open-minded, and always willing to listen to the people of Port Clements.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 11', 10),
  ('amber-bellis-port-clements-councillor', 'Amber Bellis', 'Candidate for Councillor', 'Port Clements municipal candidates', 'Port Clements', $$My name is Amber Bellis. I am from the Yahgulaanas Raven clan from Old Massett and a lifelong resident of Port Clements. I bring a unique blend of deep local roots and extensive leadership experience, fresh energy, balance, and a strong voice to our community.

I am an entrepreneur and have served as a commissioner for the Haida Gwaii Rec (2010) and as a president of manual osteopaths (2021). Combined with my education, an MBA and three doctoral degrees, including a PhD in osteopathic clinical sciences. These experiences have given me strategic tools that I believe can contribute to shaping the future of our community.

As a manual osteopath, my target is to restore balance and harmony. I bring this philosophy to local politics, advocating for sustainable economic growth, enhancing inter-community collaboration, and expanding recreational access. Let’s work together to build a thriving, balanced community where every voice is heard.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 11', 20),
  ('brigid-cumming-port-clements-councillor', 'Brigid Cumming', 'Candidate for Councillor', 'Port Clements municipal candidates', 'Port Clements', $$I first moved to Port Clements in 1967 as a small child with my parents, Tom and Wendy Quinn. I've lived here continuously since 1984, married, raised kids, worked and volunteered for many different groups. As well as being a Councillor since spring 2017, I am Council's representative to Haida Gwaii Community Futures.

This past term on Council we've built a new sewage lagoon and replaced the asbestos concrete water pipes on the upper two blocks of Tingley Street. Many smaller projects have been done or are almost done. Looking forward, we need to upgrade our water storage tanks. Supporting local residents, services, and businesses remain key to building our community.

I have found serving on Council challenging and worthwhile. I would like to continue to put my experience to work for the village and hope to receive your vote to serve as a Councillor on October 17, 2026.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 11', 30),
  ('dennis-reindl-port-clements-councillor', 'Dennis Reindl', 'Candidate for Councillor', 'Port Clements municipal candidates', 'Port Clements', $$After more than 30 years of teaching jewellery casting and as a practicing artist, I believe cooperation and creativity can help build a stronger community. I am an artist, educator and small-business owner who has made Masset my home.

I am running for council to support progressive ideas from other candidates. These include the possibility of establishing a community thrift store in the former library, developing the planned waterfront park, and my long-held notion of the prospect to create an art school or makerspace with accessible studios for jewellery, printmaking, sculpture and other creative activities.

I would also like to explore opportunities for recreation, beautification and sustainable energy, while looking for grants and partnerships that can make worthwhile projects affordable.

Most importantly, I believe council should listen to residents, work cooperatively and approach new ideas with an open mind and a realistic understanding of what Masset can accomplish.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 11', 40),
  ('betty-stewart-port-clements-councillor', 'Elizabeth “Betty” Stewart', 'Candidate for Councillor', 'Port Clements municipal candidates', 'Port Clements', $$My name is Elizabeth “Betty” Stewart. I am running for Councillor for the Village of Port Clements.

Since 2017, I have solely-owned & operated a small business in Port Clements and am known for my Grandma Betty’s Artisan Jams & Jellies.

I was a VOPC Councillor from 2017-2018, and am proud to say I was on the Council that successfully lobbied, negotiated and finally secured Cell Service for our Community (which went live in March, 2019).

Issues of Interest ...

VOPC: It is essential that Council returns to a more accessible governing body that represents all of its Taxpayers, and ensures the public is informed of Council’s discussions & decisions in a fair, transparent, accurate & timely manner.

Employment & Volunteers: Pursue initiatives that assist in the development of Employment & Volunteer opportunities.

Education: Help find a path forward to keep our Elementary School open.

Healthcare: Continue to advocate for the Haida Gwaii CT Scanner Project.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 11', 50)
on conflict (slug) do update set
  candidate_name = excluded.candidate_name,
  office = excluded.office,
  race_name = excluded.race_name,
  community = excluded.community,
  statement = excluded.statement,
  source_label = excluded.source_label,
  sort_order = excluded.sort_order,
  updated_at = now();
