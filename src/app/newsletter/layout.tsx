import { pageMetadata } from "@/lib/page-metadata"

export const metadata = pageMetadata("Newsletter", "Subscribe to Haida Gwaii News for local reporting, community updates and island stories.", "/newsletter")

export default function NewsletterLayout({ children }: { children: React.ReactNode }) { return children }
