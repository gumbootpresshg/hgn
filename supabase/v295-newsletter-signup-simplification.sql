-- HGN v0.66.4: reader-first public newsletter signup defaults.
-- Safe to run after v291. Existing subscriber preferences, including paused Guide data, are untouched.

insert into public.hgn_newsletter_signup_page (
  singleton_key, headline, intro, signup_explanation, success_message, button_text
)
values (
  'default',
  'Get the HGN Update',
  'Free biweekly local news, events and island information from Haida Gwaii News.',
  'Local stories and community information, delivered every other week. Unsubscribe anytime.',
  'You''re on the list. Check your inbox for a welcome email.',
  'Get the HGN Update'
)
on conflict (singleton_key) do nothing;

update public.hgn_newsletter_signup_page
set
  headline = case
    when headline is null or headline = 'Get the island update' then 'Get the HGN Update'
    else headline
  end,
  intro = case
    when intro is null or intro = 'Sign up for local headlines and community updates from Haida Gwaii News.'
      then 'Free biweekly local news, events and island information from Haida Gwaii News.'
    else intro
  end,
  signup_explanation = case
    when signup_explanation is null or signup_explanation = 'Choose the reader updates you would like to receive.'
      then 'Local stories and community information, delivered every other week. Unsubscribe anytime.'
    else signup_explanation
  end,
  success_message = case
    when success_message is null or success_message = 'You are signed up. Thank you for supporting local news.'
      then 'You''re on the list. Check your inbox for a welcome email.'
    else success_message
  end,
  button_text = case
    when button_text is null or button_text = 'Sign up' then 'Get the HGN Update'
    else button_text
  end,
  updated_at = now()
where singleton_key = 'default';
