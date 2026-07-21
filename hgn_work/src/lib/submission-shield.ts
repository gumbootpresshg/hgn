export type SubmissionShieldItem = {
  title: string;
  area: 'Letters' | 'Forms' | 'Alerts' | 'Database' | 'Operations';
  status: 'Ready' | 'Needs review' | 'Blocker';
  detail: string;
};

export const submissionShieldItems: SubmissionShieldItem[] = [
  {
    title: 'Letter alerts have a stable key',
    area: 'Alerts',
    status: 'Ready',
    detail: 'The Letters to the Editor alert setting now uses a required alert_key so partial SQL runs do not break inserts.',
  },
  {
    title: 'Public submissions are write-only',
    area: 'Database',
    status: 'Blocker',
    detail: 'Before online beta, confirm anonymous visitors can create a letter but cannot list or read submitted letters.',
  },
  {
    title: 'Admin/editor inbox is private',
    area: 'Letters',
    status: 'Blocker',
    detail: 'Letter content, sender emails, phone numbers, and alert logs should only be visible after admin/editor login.',
  },
  {
    title: 'Spam tripwires are active',
    area: 'Forms',
    status: 'Needs review',
    detail: 'Keep the honeypot, minimum submit time, repeated email checks, and basic rate limit in place for public forms.',
  },
  {
    title: 'Alert delivery failures are visible',
    area: 'Operations',
    status: 'Ready',
    detail: 'Failed email or phone alert attempts should be logged so you do not miss letters silently during beta.',
  },
];

export const submissionShieldScore = Math.round(
  (submissionShieldItems.filter((item) => item.status === 'Ready').length / submissionShieldItems.length) * 100,
);

export function getSubmissionShieldBlockers() {
  return submissionShieldItems.filter((item) => item.status === 'Blocker');
}

export function getSubmissionShieldNextActions() {
  return submissionShieldItems.filter((item) => item.status !== 'Ready');
}
