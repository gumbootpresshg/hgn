import SectionArticleList from "@/components/SectionArticleList"

export const revalidate = 60

export default function MountieMinutePage() {
  return (
    <SectionArticleList
      title="Mountie Minute"
      description="Mountie Minute articles and public safety updates."
      sectionType="mountie-minute"
      emptyText="No Mountie Minute articles found yet. Check that stories are tagged/category set as Mountie Minute."
    />
  )
}
