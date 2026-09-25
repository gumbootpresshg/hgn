-- HGN v0.66.1: tighter newsletter control, Guide pause enforcement, and launch sponsor placeholder.
update public.hgn_newsletter_settings
set include_guide=false,
    lookback_days=case when lookback_days > 28 then 14 else lookback_days end,
    frequency_days=case when frequency_days > 28 then 14 else frequency_days end,
    updated_at=now()
where singleton_key='default';

insert into public.hgn_newsletter_ad_campaigns (advertiser_name,placement,destination_url,alt_text,status,inventory_status,internal_note,sort_order)
select 'Newsletter Footer Sponsor · $200', 'footer_sponsor', '/advertise', 'Advertise in the Haida Gwaii News newsletter', 'house_ad', 'open', 'Replace with the paid footer sponsor. One sponsor per biweekly edition at the launch rate of $200.', 999
where not exists (select 1 from public.hgn_newsletter_ad_campaigns where placement='footer_sponsor' and advertiser_name='Newsletter Footer Sponsor · $200');
