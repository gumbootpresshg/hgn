create table if not exists launch_ops_notes (
  id bigserial primary key,
  title text not null,
  note text,
  status text default 'open',
  created_at timestamptz default now()
);

insert into launch_ops_notes (title, note, status)
values
  ('Homepage readiness', 'Review homepage hierarchy before soft beta.', 'open'),
  ('Mobile pass', 'Complete mobile spacing and readability review.', 'active');
