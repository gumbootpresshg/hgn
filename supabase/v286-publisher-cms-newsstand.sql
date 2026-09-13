-- HGN v0.65.0 Publisher CMS + Archive Newsstand

create table if not exists hgn_site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  eyebrow text,
  description text,
  blocks jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  visibility text not null default 'public',
  seo_title text,
  seo_description text,
  system_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table hgn_site_pages enable row level security;
drop policy if exists "Public can read published site pages" on hgn_site_pages;
create policy "Public can read published site pages" on hgn_site_pages for select using (status = 'published' and visibility = 'public');

alter table correction_requests add column if not exists publication_scope text default 'online';
alter table correction_requests add column if not exists print_edition text;
alter table correction_requests add column if not exists print_page text;

alter table digital_editions add column if not exists slug text;
alter table digital_editions add column if not exists year integer;
alter table digital_editions add column if not exists featured boolean default false;
alter table digital_editions add column if not exists updated_at timestamptz default now();

insert into hgn_site_pages (slug,title,eyebrow,description,blocks,status,visibility,system_key)
values
('about','Haida Gwaii News','About Us','Independent local journalism for Haida Gwaii',
 '[{"id":"about-1","type":"paragraph","content":"Haida Gwaii News is a community newspaper and digital news service covering the islands, people, events, businesses, sports, columns, letters, obituaries and public notices that matter to Haida Gwaii."},{"id":"about-2","type":"paragraph","content":"Our website supports the print paper while giving readers a useful daily source for local news, community information, weather, events, archives and ways to take part."}]'::jsonb,
 'published','public','about'),
('privacy','Privacy Policy','Legal','How Haida Gwaii News handles personal information',
 '[{"id":"privacy-1","type":"paragraph","content":"Haida Gwaii News collects information readers choose to provide through accounts, newsletter subscriptions, contact forms, community submissions, marketplace activity and other public features."},{"id":"privacy-2","type":"paragraph","content":"We use this information to operate the publication, respond to requests, manage reader accounts, review submissions, send newsletters and improve our services. We do not publish private personal information unless it is intentionally supplied for publication and approved through an editorial workflow."},{"id":"privacy-3","type":"paragraph","content":"We use service providers such as Supabase, Vercel and Resend to operate parts of the website. Requests about personal information can be sent through our Contact page."}]'::jsonb,
 'published','public','privacy'),
('terms','Terms of Use','Legal','Terms for using Haida Gwaii News',
 '[{"id":"terms-1","type":"paragraph","content":"Haida Gwaii News provides journalism, community information, events, directories, marketplace tools and reader services for informational purposes."},{"id":"terms-2","type":"paragraph","content":"People submitting material confirm that they have the right to submit it and understand that HGN may review, edit, approve, reject, archive or remove submitted material according to editorial and community standards."},{"id":"terms-3","type":"paragraph","content":"Users may not submit unlawful, abusive, defamatory, infringing or deliberately misleading material, or private personal information about another person without permission."},{"id":"terms-4","type":"paragraph","content":"HGN may change or retire site features as the publication develops. Editorial decisions remain with Haida Gwaii News."}]'::jsonb,
 'published','public','terms')
on conflict (system_key) do nothing;

-- Tighten legacy archive write access. Public reading stays available; writes now go through authenticated newsroom APIs.
drop policy if exists "Authenticated can manage editions" on digital_editions;

-- Add Notices to the existing saved Community menu once if it is not already present.
do $$
declare
  nav jsonb;
  rebuilt jsonb := '[]'::jsonb;
  item jsonb;
begin
  select config->'navigation' into nav from hgn_site_platform_settings where singleton_key='default';
  if jsonb_typeof(nav) = 'array' then
    for item in select * from jsonb_array_elements(nav)
    loop
      if item->>'id' = 'community' and not exists (
        select 1 from jsonb_array_elements(coalesce(item->'children','[]'::jsonb)) child where child->>'id'='notices'
      ) then
        item := jsonb_set(item,'{children}',coalesce(item->'children','[]'::jsonb) || jsonb_build_array(jsonb_build_object('id','notices','label','Notices','href','/notices','enabled',true,'visibility','public')));
      end if;
      rebuilt := rebuilt || jsonb_build_array(item);
    end loop;
    update hgn_site_platform_settings set config=jsonb_set(config,'{navigation}',rebuilt), updated_at=now() where singleton_key='default';
  end if;
exception when undefined_table then null;
end $$;
