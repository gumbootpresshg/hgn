export type SecurityHardeningItem = {
  title: string;
  area: 'Admin' | 'Submissions' | 'Database' | 'Deployment' | 'Alerts';
  status: 'Ready' | 'Needs review' | 'Required before upload';
  detail: string;
};

export const securityHardeningItems: SecurityHardeningItem[] = [
  {
    title: 'Admin routes require login',
    area: 'Admin',
    status: 'Required before upload',
    detail: 'Confirm every admin route redirects unauthenticated visitors before online beta.',
  },
  {
    title: 'Letters can insert only',
    area: 'Submissions',
    status: 'Ready',
    detail: 'Public letter forms should submit safely without exposing the protected inbox.',
  },
  {
    title: 'Submission alert log is private',
    area: 'Alerts',
    status: 'Needs review',
    detail: 'Only admin/editor accounts should read notification logs and delivery details.',
  },
  {
    title: 'Service role key stays server-side',
    area: 'Deployment',
    status: 'Required before upload',
    detail: 'Never expose SUPABASE_SERVICE_ROLE_KEY or mail provider secrets in client bundles.',
  },
  {
    title: 'RLS enabled for sensitive tables',
    area: 'Database',
    status: 'Required before upload',
    detail: 'Submission, alert, and security audit tables should have row level security enabled.',
  },
];

export const securityHardeningScore = Math.round(
  (securityHardeningItems.filter((item) => item.status === 'Ready').length / securityHardeningItems.length) * 100,
);

export function getRequiredSecurityItems() {
  return securityHardeningItems.filter((item) => item.status === 'Required before upload');
}
