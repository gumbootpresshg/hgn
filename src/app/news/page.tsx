import SectionArticleList from "@/components/SectionArticleList"
import { pageMetadata } from "@/lib/page-metadata"
export const metadata = pageMetadata("Local News", "The latest local news and reporting from across Haida Gwaii.", "/news")

export const revalidate = 60

export default function LocalNewsPage() {
  return (
    <SectionArticleList
      title="Local News"
      description="Latest local news from across Haida Gwaii."
      sectionType="local-news"
      emptyText="No local news articles found yet. Check that stories are tagged/category set as Local News."
    />
  )
}
