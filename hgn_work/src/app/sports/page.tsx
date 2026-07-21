import SectionArticleList from "@/components/SectionArticleList"

export const revalidate = 60

export default function SportsPage() {
  return (
    <SectionArticleList
      title="Sports"
      description="Local sports, recreation, school athletics, tournaments, and community games."
      sectionType="sports"
      emptyText="No sports articles found yet. Check that stories are tagged/category set as Sports."
    />
  )
}
