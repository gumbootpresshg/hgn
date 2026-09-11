import SectionArticleList from "@/components/SectionArticleList"

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
